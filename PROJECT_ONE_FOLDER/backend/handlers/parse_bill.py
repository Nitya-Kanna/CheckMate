"""
Lambda handler for POST /ai/parse-bill
Alibaba Qwen parser with safe local fallback
"""
import json
import os
from urllib import request as urlrequest
from urllib import error as urlerror
from utils import success_response, error_response

QWEN_BASE_URL = os.getenv("ALIBABA_BASE_URL", "https://dashscope-intl.aliyuncs.com/compatible-mode/v1")
QWEN_MODEL = os.getenv("ALIBABA_MODEL", "qwen-plus")
QWEN_VISION_MODEL = os.getenv("ALIBABA_VISION_MODEL", "qwen-vl-plus")
QWEN_API_KEY = os.getenv("ALIBABA_API_KEY", "")


def _normalize_ai_result(ai_payload, receipt_items):
    """
    Normalize multiple possible model shapes into:
    [{person, item, price}]
    """
    parsed = ai_payload.get("parsed", [])
    if not isinstance(parsed, list):
        parsed = []

    receipt_lookup = {str(it.get("name", "")).lower(): float(it.get("price", 0) or 0) for it in receipt_items}
    normalized = []

    for row in parsed:
        if not isinstance(row, dict):
            continue
        person = row.get("person") or row.get("name") or row.get("user")
        item = row.get("item") or row.get("item_name") or row.get("product")
        price = row.get("price")
        try:
            price = float(price) if price is not None else 0.0
        except (TypeError, ValueError):
            price = 0.0

        if (not price) and item:
            item_key = str(item).lower()
            if item_key in receipt_lookup:
                price = receipt_lookup[item_key]
            else:
                for receipt_name, receipt_price in receipt_lookup.items():
                    if item_key in receipt_name or receipt_name in item_key:
                        price = receipt_price
                        break

        if person and item and price > 0:
            normalized.append({
                "person": str(person).strip().capitalize(),
                "item": str(item).strip(),
                "price": round(float(price), 2)
            })

    if normalized:
        return normalized

    # Also accept grouped format:
    # {"parsed_by_person":[{"person":"Lisa","items":["Green Tea","Burger"]}]}
    grouped = ai_payload.get("parsed_by_person", [])
    if isinstance(grouped, list):
        flattened = []
        for row in grouped:
            if not isinstance(row, dict):
                continue
            person = row.get("person") or row.get("name") or row.get("user")
            items = row.get("items", [])
            if not person or not isinstance(items, list):
                continue
            for raw_item in items:
                item_name = raw_item.get("name") if isinstance(raw_item, dict) else raw_item
                if not item_name:
                    continue
                item_name = str(item_name).strip()
                price = 0.0
                key = item_name.lower()
                if key in receipt_lookup:
                    price = receipt_lookup[key]
                else:
                    for receipt_name, receipt_price in receipt_lookup.items():
                        if key in receipt_name or receipt_name in key:
                            price = receipt_price
                            break
                if price > 0:
                    flattened.append({
                        "person": str(person).strip().capitalize(),
                        "item": item_name,
                        "price": round(float(price), 2)
                    })
        return flattened

    return []


def _call_qwen_parser(input_text, receipt_items):
    if not QWEN_API_KEY:
        raise RuntimeError("ALIBABA_API_KEY is not configured")

    prompt = {
        "instruction": (
            "Parse bill ownership from user input and receipt items. "
            "Return strict JSON only with shape: "
            "{\"parsed\":[{\"person\":\"Lisa\",\"item\":\"Green Tea\",\"price\":6.5}]}. "
            "Only use items present in receipt_items."
        ),
        "input_text": input_text,
        "receipt_items": receipt_items
    }

    payload = {
        "model": QWEN_MODEL,
        "temperature": 0,
        "messages": [
            {"role": "system", "content": "You are a precise bill splitting parser. Output valid JSON only."},
            {"role": "user", "content": json.dumps(prompt)}
        ],
        "response_format": {"type": "json_object"}
    }

    req = urlrequest.Request(
        f"{QWEN_BASE_URL}/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {QWEN_API_KEY}"
        },
        method="POST",
    )

    try:
        with urlrequest.urlopen(req, timeout=25) as response:
            raw = response.read().decode("utf-8")
            data = json.loads(raw)
    except urlerror.HTTPError as exc:
        err_body = exc.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"Qwen HTTP {exc.code}: {err_body}") from exc
    except Exception as exc:
        raise RuntimeError(f"Qwen request failed: {exc}") from exc

    content = (
        data.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "")
    )
    if not content:
        raise RuntimeError("Qwen response missing message content")

    try:
        parsed_json = json.loads(content)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Qwen returned non-JSON content: {content[:240]}") from exc

    normalized = _normalize_ai_result(parsed_json, receipt_items)
    if not normalized:
        raise RuntimeError("Qwen response did not contain parseable items")
    return normalized


def _local_fallback_parser(input_text, receipt_items):
    parsed_data = []
    input_lower = input_text.lower()
    statements = input_lower.replace(" and ", ",").split(",")

    for statement in statements:
        statement = statement.strip()
        words = statement.split()
        if len(words) < 2:
            continue

        person = words[0].strip()

        for item in receipt_items:
            item_name = item.get("name", "")
            item_name_lower = item_name.lower()
            if item_name_lower and item_name_lower in statement:
                parsed_data.append({
                    "person": person.capitalize(),
                    "item": item_name,
                    "price": round(float(item.get("price", 0) or 0), 2)
                })
    return parsed_data


def _call_qwen_vision_receipt_ocr(receipt_image_base64, receipt_image_mime_type="image/jpeg"):
    if not QWEN_API_KEY:
        raise RuntimeError("ALIBABA_API_KEY is not configured")

    instruction = (
        "Extract receipt details from this image. "
        "Return strict JSON only with shape: "
        "{\"restaurant_name\":\"...\",\"date\":\"YYYY-MM-DD\",\"time\":\"HH:MM\","
        "\"items\":[{\"name\":\"Item\",\"price\":12.34}],"
        "\"subtotal\":0,\"tax\":0,\"service\":0,\"total\":0}. "
        "Use numeric prices, and if a field is missing set sensible defaults."
    )

    payload = {
        "model": QWEN_VISION_MODEL,
        "temperature": 0,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": instruction},
                    {"type": "image_url", "image_url": {"url": f"data:{receipt_image_mime_type};base64,{receipt_image_base64}"}}
                ]
            }
        ],
        "response_format": {"type": "json_object"}
    }

    req = urlrequest.Request(
        f"{QWEN_BASE_URL}/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {QWEN_API_KEY}"
        },
        method="POST",
    )

    try:
        with urlrequest.urlopen(req, timeout=45) as response:
            raw = response.read().decode("utf-8")
            data = json.loads(raw)
    except urlerror.HTTPError as exc:
        err_body = exc.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"Qwen Vision HTTP {exc.code}: {err_body}") from exc
    except Exception as exc:
        raise RuntimeError(f"Qwen Vision request failed: {exc}") from exc

    content = (
        data.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "")
    )
    if not content:
        raise RuntimeError("Qwen Vision response missing message content")

    try:
        parsed = json.loads(content)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Qwen Vision returned non-JSON content: {content[:240]}") from exc

    items = parsed.get("items", [])
    normalized_items = []
    for item in items if isinstance(items, list) else []:
        if not isinstance(item, dict):
            continue
        name = str(item.get("name", "")).strip()
        try:
            price = float(item.get("price", 0) or 0)
        except (TypeError, ValueError):
            price = 0
        if name and price >= 0:
            normalized_items.append({"name": name, "price": round(price, 2)})

    def num(value):
        try:
            return round(float(value or 0), 2)
        except (TypeError, ValueError):
            return 0.0

    subtotal = num(parsed.get("subtotal"))
    tax = num(parsed.get("tax"))
    service = num(parsed.get("service"))
    total = num(parsed.get("total"))

    if total <= 0:
        total = round(subtotal + tax + service, 2)
    if subtotal <= 0 and normalized_items:
        subtotal = round(sum(i["price"] for i in normalized_items), 2)
        if total <= 0:
            total = subtotal

    return {
        "restaurant_name": str(parsed.get("restaurant_name", "Receipt")).strip() or "Receipt",
        "date": str(parsed.get("date", "")),
        "time": str(parsed.get("time", "")),
        "items": normalized_items,
        "subtotal": subtotal,
        "tax": tax,
        "service": service,
        "total": total
    }


def lambda_handler(event, context):
    """
    Parse natural language input to match people with receipt items
    
    Request body:
    {
        "input": "zin ate nasi lemak, lisa ate pizza",
        "receipt_items": [
            {"name": "Nasi Lemak", "price": 8.50},
            {"name": "Pizza", "price": 25.00}
        ]
    }
    
    Response:
    {
        "parsed": [
            {
                "person": "zin",
                "items": ["Nasi Lemak"],
                "total": 8.50
            },
            {
                "person": "lisa",
                "items": ["Pizza"],
                "total": 25.00
            }
        ]
    }
    """
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        input_text = body.get('input', '')
        receipt_items = body.get('receipt_items', [])
        receipt_image_base64 = body.get("receipt_image_base64", "")
        receipt_image_mime_type = body.get("receipt_image_mime_type", "image/jpeg")

        # OCR/Vision mode: parse receipt image directly.
        if receipt_image_base64:
            try:
                receipt = _call_qwen_vision_receipt_ocr(receipt_image_base64, receipt_image_mime_type)
                return success_response({
                    "receipt": receipt,
                    "parser_mode": "qwen_vision"
                })
            except Exception as vision_error:
                print(f"Qwen Vision OCR failed: {vision_error}")
                return error_response(400, f"OCR parse failed: {vision_error}")
        
        if not input_text:
            return error_response(400, 'Missing input text')
        
        if not receipt_items:
            return error_response(400, 'Missing receipt items')
        
        parser_mode = "fallback"
        try:
            parsed_data = _call_qwen_parser(input_text, receipt_items)
            parser_mode = "qwen"
        except Exception as qwen_error:
            print(f"Qwen parse failed, using fallback: {qwen_error}")
            parsed_data = _local_fallback_parser(input_text, receipt_items)

        if not parsed_data:
            return error_response(400, 'Could not parse input. Try: "zin ate nasi lemak, lisa ate pizza"')

        return success_response({
            'parsed': parsed_data,
            'original_input': input_text,
            'parser_mode': parser_mode
        })
        
    except json.JSONDecodeError:
        return error_response(400, 'Invalid JSON in request body')
    except Exception as e:
        print(f"Error parsing bill: {str(e)}")
        return error_response(500, f'Internal server error: {str(e)}')

# Made with Bob
