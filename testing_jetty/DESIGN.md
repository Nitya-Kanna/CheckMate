# AI Bill Splitter — Hackathon MVP Design

> **Scope**: Deployable demo showcasing multi-cloud architecture. Focus on the wow-factor workflow: **scan → extract → assign via AI → share payment request natively**.

---

## 1. Overview

| Attribute | Value |
|-----------|-------|
| **Project Name** | AI Bill Splitter (hackathon MVP) |
| **Purpose** | Demo workflow: upload receipt → AI extracts items → assign via LLM → tap to share payment request via native messaging apps. |
| **Target Platform** | Mobile-first PWA (installable, camera access) |
| **Infrastructure** | **AWS + Alibaba Cloud** (multi-cloud demo) |

---

## 2. MVP Features (Demo-Ready)

| ID | Feature | Demo Flow | Priority |
|----|---------|-----------|----------|
| F-01 | Receipt Upload | Camera capture or file picker. | P0 |
| F-02 | OCR Extraction | Vision model returns items + prices + restaurant name. | P0 |
| F-03 | Contact Entry | Simple form: name + mobile number. Mock TNG name lookup for demo. | P0 |
| F-04 | Manual Assignment UI | Dropdown per item to pick who ate what. Auto-calculate totals + tax split. | P0 |
| F-05 | **LLM Natural Language Split** | User types `"Calvin had nasi lemak, Jet had iced coffee, rojak shared"` → AI updates all assignments instantly. | P0 |
| F-06 | **Native Share Payment Request** | Per-person card with amount owed + [**Share**] button. Tapping opens the device's native share sheet (Messages, Telegram, etc.) pre-filled with payment message + mock TNG link. | P0 |
| F-07 | Debt Dashboard (simplified) | List who owes what on the current bill only. No historical tracking. | P1 |

**What's OUT of scope for hackathon:**
- Real TNG backend payment settlement loop
- Auth / user accounts (single-session app)
- Device contact book integration
- Persistent database (in-memory only)

---

## 3. User Flow (Demo Script)

```
1. [Landing Page]
   "Snap or upload your receipt"
   ↓
2. [Upload Receipt]
   User takes photo → loading spinner "Reading your receipt..."
   ↓
3. [Extracted Receipt View]
   ┌─────────────────────────────┐
   │ 🍽️ Restaurant: Nasi Kandar  │
   │                             │
   │ Items extracted:            │
   │ ☐ Nasi Lemak        RM 8.00 │
   │ ☐ Teh Ice           RM 3.50 │
   │ ☐ Iced Coffee       RM 6.00 │
   │ ☐ Rojak            RM 10.00 │
   │ Tax (6%)            RM 1.65 │
   │ ─────────────────────────── │
   │ Total              RM 29.15 │
   └─────────────────────────────┘
   ↓
4. [Add People]
   "Who's splitting this bill?"
   [Calvin] [+6012-345-6789]  [Jet] [+6019-876-5432]
   ↓
5. [Assign Items — Two Paths]

   PATH A — Manual:
   Each item has a dropdown: "Who ordered this?"
   → Nasi Lemak: [Calvin ▼]
   → Teh Ice:    [Calvin ▼]
   → Iced Coffee:[Jet ▼]
   → Rojak:      [Shared: Calvin + Jet ▼]
   Auto-calculated amounts update live.

   PATH B — Natural Language (The Wow Factor):
   "Or just tell us:"
   ["Calvin had nasi lemak and teh ice, Jet had iced coffee, rojak shared"]
   [✨ AI Split]
   → All dropdowns auto-populate. Amounts calculated.
   ↓
6. [Review & Share]
   ┌─────────────────────────────┐
   │ 💰 Calvin owes: RM 11.83    │
   │    [📤 Share Request]       │
   │                             │
   │ 💰 Jet owes:     RM 17.32   │
   │    [📤 Share Request]       │
   └─────────────────────────────┘

   Tapping [📤 Share Request] triggers:

   ┌─────────────────────────────┐
   │  iOS / Android Share Sheet  │
   │  ─────────────────────────  │
   │  💬 Messages    Calvin      │
   │  ✈️ Telegram               │
   │  📧 Email                  │
   │  📋 Copy                   │
   └─────────────────────────────┘

   Pre-filled message:
   "Hey! You were billed RM11.83 for Nasi Kandar.
    Pay me back: https://tngdigital.com.my/pay?to=..."
   ↓
7. [Done]
   "All set! Payment requests shared."
```

### 3.1 Native Share Mechanism

| Platform | Method | Behavior |
|----------|--------|----------|
| **Mobile (iOS/Android)** | Web Share API (`navigator.share()`) | Opens native share sheet with pre-filled text + URL. User picks their preferred messaging app. |
| **Desktop** | Web Share API (if supported) OR copy to clipboard | On desktop Safari/Chrome, native share may appear. Otherwise, copy to clipboard for pasting into any messaging app. |
| **Fallback** | Copy to clipboard | Always available if share APIs unavailable. |

---

## 4. Multi-Cloud Architecture (Hackathon Demo)

> **Goal**: Demonstrate AWS + Alibaba Cloud working together, not full production resilience.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Client Layer (PWA)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Camera Upload│  │ Native Share │  │ Assignment UI│          │
│  └──────┬───────┘  └──────────────┘  └──────────────┘          │
└─────────┼────────────────────────────────────────────────────────┘
          │ HTTPS
┌─────────▼────────────────────────────────────────────────────────┐
│                   API Gateway Layer                               │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │  AWS API Gateway (Primary) → OCR, Split, Message APIs  │     │
│  │  AliCloud API Gateway (Demo route) → Fallback/Health   │     │
│  └─────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
          │
    ┌─────┴─────┐
    ▼           ▼
┌────────┐  ┌────────┐
│ AWS    │  │AliCloud│
│ Lambda │  │   FC   │
│ (OCR)  │  │(Split) │
└───┬────┘  └───┬────┘
    │           │
    ▼           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AI & Data Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ AWS Bedrock  │  │ AliCloud     │  │ AWS S3       │          │
│  │  (Claude)    │  │  DashScope   │  │ (Receipt     │          │
│  │  OCR + LLM   │  │  (Qwen)      │  │  Images)     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │ AliCloud OSS │  │ AWS ElastiCache│                            │
│  │ (Backup img) │  │ Redis (cache) │                            │
│  └──────────────┘  └──────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

### 4.1 Component Responsibilities

| Component | Cloud | Responsibility |
|-----------|-------|----------------|
| **PWA Frontend** | Vercel / Netlify | Camera upload, assignment UI, native share integration. |
| **AWS API Gateway** | AWS | Primary API routing, auth, rate limiting. |
| **AliCloud API Gateway** | Alibaba Cloud | Secondary gateway demo route; shows multi-cloud capability. |
| **AWS Lambda (OCR)** | AWS | Receipt image → AWS Bedrock (Claude/GPT-4o) → structured items. |
| **AliCloud Function Compute (Split)** | Alibaba Cloud | NLP split logic → AliCloud DashScope (Qwen) → assignments. |
| **AWS Bedrock** | AWS | Primary LLM for OCR + natural language splitting (Claude 3.5 Sonnet). |
| **AliCloud DashScope** | Alibaba Cloud | Fallback/demo LLM (Qwen) to show multi-cloud AI. |
| **AWS S3** | AWS | Primary receipt image storage. |
| **AliCloud OSS** | Alibaba Cloud | Cross-cloud image backup / demo storage. |
| **AWS ElastiCache Redis** | AWS | Session cache, OCR result caching. |

### 4.2 Multi-Cloud Demo Narrative for Judges

> *"Our backend uses AWS Bedrock for receipt OCR and Alibaba Cloud DashScope for the LLM bill-splitting. Images land in AWS S3 with a mirror in AliCloud OSS. This shows real multi-cloud resilience — if one provider has an outage, we can failover to the other."*

**For hackathon pragmatism**: The failover logic can be simple — if Bedrock errors, call DashScope. Show both providers responding in the network tab.

---

## 5. Tech Stack

| Layer | Choice | Cloud | Why |
|-------|--------|-------|-----|
| **Frontend** | React + Vite + Tailwind CSS | Vercel | PWA-capable, fast dev, one-click deploy. |
| **Backend** | Python + FastAPI | AWS Lambda + AliCloud FC | Fits both serverless platforms; team knows Python. |
| **OCR** | GPT-4o Vision via AWS Bedrock | AWS | Single API call, structured JSON output. |
| **LLM (Split)** | Claude 3.5 Sonnet (Bedrock) primary; Qwen (DashScope) fallback | AWS + AliCloud | Demonstrates multi-cloud AI. |
| **Image Storage** | AWS S3 primary, AliCloud OSS mirror | AWS + AliCloud | Multi-cloud storage demo. |
| **Cache** | AWS ElastiCache Redis | AWS | Session + OCR result caching. |
| **API Gateway** | AWS API Gateway + AliCloud API Gateway | AWS + AliCloud | Multi-cloud ingress. |

**Cost estimate for demo:**
- Hosting: $0 (free tiers / hackathon credits)
- AWS Bedrock: ~$2-5 for demo usage
- AliCloud DashScope: ~$1-3 for demo usage
- S3 + OSS: pennies for a few images

---

## 6. API Endpoints (MVP)

| Method | Path | Cloud | Body | Response |
|--------|------|-------|------|----------|
| `POST` | `/api/ocr` | AWS | `{ image: base64 }` | `{ restaurant, items: [{name, qty, price}], total, tax }` |
| `POST` | `/api/split/nlp` | AliCloud FC | `{ items[], people[], prompt }` | `{ assignments: [{person, items, amount}] }` |
| `POST` | `/api/split/manual` | AWS Lambda | `{ items[], assignments[] }` | `{ person_totals: [{person, amount}] }` |
| `POST` | `/api/message` | AWS Lambda | `{ from_name, to_name, amount, restaurant, phone }` | `{ message, tng_link }` |

---

## 7. Native Share Implementation

### 7.1 Frontend Share Logic (React)

```typescript
// src/utils/sharePaymentRequest.ts

export interface SharePayload {
  toName: string;
  fromName: string;
  amount: number;
  restaurant: string;
  phone: string;
  tngLink: string;
}

export async function sharePaymentRequest(payload: SharePayload): Promise<void> {
  const { toName, fromName, amount, restaurant, phone, tngLink } = payload;

  const formattedAmount = `RM${amount.toFixed(2)}`;
  const shareText = `Hey ${toName}! You were billed ${formattedAmount} for ${restaurant}.\nPay me back: ${tngLink}\n— ${fromName}`;
  const encodedText = encodeURIComponent(shareText);

  // Attempt 1: Web Share API (best for mobile)
  if (typeof navigator !== "undefined" && "share" in navigator) {
    try {
      await navigator.share({
        title: `Payment Request from ${fromName}`,
        text: shareText,
        url: tngLink,
      });
      return;
    } catch (err) {
      // User cancelled or share failed — fall through
      const error = err as Error;
      if (error.name === "AbortError") {
        return;
      }
    }
  }

  // Attempt 2: Copy to clipboard
  try {
    await navigator.clipboard.writeText(`${shareText}\n${tngLink}`);
    alert("Payment request copied to clipboard. Paste it to your friend!");
  } catch {
    // Final fallback: display prompt
    const textArea = document.createElement("textarea");
    textArea.value = `${shareText}\n${tngLink}`;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    alert("Payment request copied to clipboard. Paste it to your friend!");
  }
}
```

### 7.2 Backend Message Formatter

```python
# app/routers/message.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from urllib.parse import quote
import uuid

router = APIRouter(prefix="/api/message", tags=["message"])

class MessageRequest(BaseModel):
    from_name: str = Field(..., min_length=1, max_length=100)
    to_name: str = Field(..., min_length=1, max_length=100)
    amount: float = Field(..., gt=0)
    restaurant: str = Field(..., min_length=1, max_length=200)
    phone: str = Field(..., min_length=1, max_length=20)

class MessageResponse(BaseModel):
    message: str
    tng_link: str

@router.post("", response_model=MessageResponse)
def generate_payment_message(req: MessageRequest) -> MessageResponse:
    try:
        formatted_amount = f"RM{req.amount:.2f}"
        # Mock TNG payment link with a unique transaction reference
        txn_ref = str(uuid.uuid4())[:8]
        tng_link = (
            f"https://tngdigital.com.my/pay?"
            f"to={quote(req.from_name)}"
            f"&amount={req.amount:.2f}"
            f"&ref={txn_ref}"
            f"&memo={quote(f'Bill split for {req.restaurant}')}"
        )

        message_text = (
            f"Hey {req.to_name}! You were billed {formatted_amount} "
            f"for {req.restaurant}.\n"
            f"Pay me back: {tng_link}\n"
            f"— {req.from_name}"
        )

        return MessageResponse(
            message=message_text,
            tng_link=tng_link,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
```

---

## 8. BillSplitAgent — Single Agent Architecture

This is the core AI design. A single `BillSplitAgent` orchestrated by AWS Bedrock (Claude) coordinates receipt extraction, assignment, calculation, and payment sharing.

### 8.1 Agent Overview

The `BillSplitAgent` is a stateful orchestrator that:
1. Receives a receipt image and participant list.
2. Invokes tools in a deterministic sequence.
3. Validates tool outputs before state transitions.
4. Keeps monetary calculations outside the LLM for precision.
5. Returns finalized payment requests ready for native sharing.

Architecture:
```
User Input
    │
    ▼
┌─────────────────┐
│ Bedrock Claude  │ ← Orchestrator: plans tool calls, handles intent
│ (LLM)           │
└────────┬────────┘
         │
    ┌────┴────┬─────────┬──────────┬──────────┐
    ▼         ▼         ▼          ▼          ▼
 extract  resolve   parseNatural validate  calculate
Receipt    TNG       Split      Assignments Totals
    │         │         │          │          │
    └─────────┴─────────┴──────────┴──────────┘
                        │
                        ▼
              ┌─────────────────┐
              │  generateLinks  │
              │  shareRequests  │
              └─────────────────┘
```

### 8.2 Agent Tools

Each tool is exposed to Bedrock as a function definition. The LLM decides which tool to call based on the current state and user intent.

#### 1. extractReceipt(image: string)
- **Description**: Sends the receipt image to a vision model (GPT-4o / Claude) and returns structured receipt data.
- **Input**: `image` — Base64-encoded JPEG/PNG.
- **Output**:
  ```json
  {
    "restaurant": "Nasi Kandar Pelita",
    "items": [
      {"name": "Nasi Lemak Ayam", "qty": 1, "price": 8.00},
      {"name": "Teh Ice", "qty": 1, "price": 3.50}
    ],
    "subtotal": 11.50,
    "tax": 0.69,
    "serviceCharge": 1.15,
    "total": 13.34
  }
  ```

#### 2. getContacts(sessionId: string)
- **Description**: Retrieves the list of participants added by the user for the current session.
- **Input**: `sessionId` — UUID of the current session.
- **Output**:
  ```json
  [
    {"id": "p1", "name": "Calvin", "phone": "+6012-345-6789", "tngDisplayName": null},
    {"id": "p2", "name": "Jet", "phone": "+6019-876-5432", "tngDisplayName": null}
  ]
  ```

#### 3. resolveTngName(mobileNumber: string)
- **Description**: Looks up the TNG display name associated with a Malaysian mobile number. For the hackathon, this returns a mocked name or null.
- **Input**: `mobileNumber` — E.164 or local format string.
- **Output**:
  ```json
  {"mobileNumber": "+60123456789", "tngDisplayName": "Calvin T"}
  ```

#### 4. parseNaturalSplit(text: string, items: Item[], participants: Participant[])
- **Description**: Parses free-text descriptions like "Calvin had nasi lemak and teh ice, Jet had iced coffee, rojak shared" into structured item assignments.
- **Input**: `text`, `items` (from OCR), `participants` (from getContacts).
- **Output**:
  ```json
  {
    "assignments": [
      {"participantId": "p1", "itemName": "Nasi Lemak Ayam", "share": 1.0},
      {"participantId": "p1", "itemName": "Teh Ice", "share": 1.0},
      {"participantId": "p2", "itemName": "Iced Coffee", "share": 1.0},
      {"participantId": "p1", "itemName": "Rojak", "share": 0.5},
      {"participantId": "p2", "itemName": "Rojak", "share": 0.5}
    ]
  }
  ```

#### 5. validateAssignments(assignments: Assignment[], items: Item[])
- **Description**: Validates that every item is assigned, shares sum to 1.0 per item, and all participant IDs exist.
- **Input**: `assignments`, `items`.
- **Output**:
  ```json
  {"valid": true, "errors": []}
  ```
  or
  ```json
  {"valid": false, "errors": ["Item 'Rojak' total share is 0.5 (expected 1.0)"]}
  ```

#### 6. calculateTotals(assignments: Assignment[], tax: number, serviceCharge: number, subtotal: number)
- **Description**: Deterministically computes each person's subtotal, tax share, service charge share, and total.
- **Input**: `assignments`, `tax`, `serviceCharge`, `subtotal`.
- **Output**:
  ```json
  [
    {
      "participantId": "p1",
      "items": [{"name": "Nasi Lemak Ayam", "share": 1.0, "price": 8.00}],
      "subtotal": 11.50,
      "taxShare": 0.69,
      "serviceChargeShare": 1.15,
      "total": 13.34
    }
  ]
  ```

#### 7. generatePaymentLink(participant: Participant, amount: number, restaurant: string)
- **Description**: Generates a mock TNG payment link.
- **Input**: `participant`, `amount`, `restaurant`.
- **Output**:
  ```json
  {
    "tngLink": "https://tngdigital.com.my/pay?to=..."
  }
  ```

#### 8. shareRequest(channel: "native" | "copy", message: string, link: string)
- **Description**: Frontend-side helper that delegates to the Web Share API or clipboard. Not a backend tool — invoked by the frontend after receiving `generatePaymentLink` results.
- **Input**: `channel`, `message`, `link`.
- **Output**: `{ "success": true, "channel": "native" }`

### 8.3 Recommended Bedrock Architecture

| Layer | Component | Responsibility |
|-------|-----------|----------------|
| **LLM Orchestrator** | Amazon Bedrock (Claude 3.5 Sonnet) | Receives user intent, plans tool sequence, interprets unstructured input. |
| **Tool Layer** | AWS Lambda functions | Each tool is a Lambda. Bedrock calls them via function-calling API. |
| **Deterministic Calculator** | Pure Python function (no LLM) | `calculateTotals` runs exact arithmetic to avoid LLM hallucination on money. |
| **State Store** | AWS ElastiCache Redis (or in-memory dict for hackathon) | Session-scoped store: receipt, participants, assignments, generated links. |
| **Guardrails** | Pydantic validation + retry logic | Every tool output is validated. Invalid outputs trigger a retry with the LLM. |

### 8.4 Agent Conversation Flow

Full step-by-step tool invocation sequence:

```
Step 1: User uploads receipt image
├─► LLM decides: extractReceipt(image)
├─► Output: {restaurant, items, subtotal, tax, serviceCharge, total}
├─► State updated: receipt = {...}
└─► UI shows extracted items

Step 2: User adds participants
├─► Frontend stores: participants = [{id, name, phone}]
└─► State updated (no LLM call needed)

Step 3-A: User manually assigns items
├─► Frontend sends: assignments = [...]
├─► LLM decides: validateAssignments(assignments, items)
├─► If valid → calculateTotals(...)
└─► UI shows live totals

Step 3-B: User types natural language split
├─► LLM decides: parseNaturalSplit(text, items, participants)
├─► Output: rawAssignments
├─► Next: validateAssignments(rawAssignments, items)
├─► If valid → calculateTotals(...)
└─► UI updates dropdowns + totals

Step 4: User taps "Share Request" for a person
├─► LLM decides: generatePaymentLink(participant, amount, restaurant)
├─► Output: {tngLink}
├─► State updated: paymentRequests[participantId] = {...}
└─► Frontend invokes shareRequest(channel, message, link)

Step 5: Done
├─► UI shows "All set!" confirmation
└─► Session may be cleared or kept for review
```

### 8.5 Tool Definitions (Bedrock Format)

Below are the actual Bedrock tool definition JSON schemas passed to the model:

```json
{
  "tools": [
    {
      "toolSpec": {
        "name": "extractReceipt",
        "description": "Extract structured receipt data from an image using a vision model. Returns merchant name, line items, quantities, prices, tax, and total.",
        "inputSchema": {
          "json": {
            "type": "object",
            "properties": {
              "image": {
                "type": "string",
                "description": "Base64-encoded JPEG or PNG image of the receipt."
              }
            },
            "required": ["image"]
          }
        }
      }
    },
    {
      "toolSpec": {
        "name": "getContacts",
        "description": "Retrieve the list of participants added by the user for the current bill-splitting session.",
        "inputSchema": {
          "json": {
            "type": "object",
            "properties": {
              "sessionId": {
                "type": "string",
                "description": "UUID of the current session."
              }
            },
            "required": ["sessionId"]
          }
        }
      }
    },
    {
      "toolSpec": {
        "name": "resolveTngName",
        "description": "Look up the TNG display name for a given Malaysian mobile number. Returns the display name if found, otherwise null.",
        "inputSchema": {
          "json": {
            "type": "object",
            "properties": {
              "mobileNumber": {
                "type": "string",
                "description": "Mobile number in E.164 or local Malaysian format."
              }
            },
            "required": ["mobileNumber"]
          }
        }
      }
    },
    {
      "toolSpec": {
        "name": "parseNaturalSplit",
        "description": "Parse a natural language description of who ordered what into structured item assignments. Handles shared items.",
        "inputSchema": {
          "json": {
            "type": "object",
            "properties": {
              "text": {
                "type": "string",
                "description": "Natural language description, e.g. 'Calvin had nasi lemak, Jet had iced coffee, rojak shared'."
              },
              "items": {
                "type": "array",
                "description": "List of items extracted from the receipt.",
                "items": {
                  "type": "object",
                  "properties": {
                    "name": {"type": "string"},
                    "qty": {"type": "integer"},
                    "price": {"type": "number"}
                  },
                  "required": ["name", "qty", "price"]
                }
              },
              "participants": {
                "type": "array",
                "description": "List of participants.",
                "items": {
                  "type": "object",
                  "properties": {
                    "id": {"type": "string"},
                    "name": {"type": "string"},
                    "phone": {"type": "string"}
                  },
                  "required": ["id", "name", "phone"]
                }
              }
            },
            "required": ["text", "items", "participants"]
          }
        }
      }
    },
    {
      "toolSpec": {
        "name": "validateAssignments",
        "description": "Validate that all items are fully assigned, share ratios sum to 1.0 per item, and all participant IDs are known.",
        "inputSchema": {
          "json": {
            "type": "object",
            "properties": {
              "assignments": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "participantId": {"type": "string"},
                    "itemName": {"type": "string"},
                    "share": {"type": "number"}
                  },
                  "required": ["participantId", "itemName", "share"]
                }
              },
              "items": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "name": {"type": "string"},
                    "qty": {"type": "integer"},
                    "price": {"type": "number"}
                  },
                  "required": ["name", "qty", "price"]
                }
              }
            },
            "required": ["assignments", "items"]
          }
        }
      }
    },
    {
      "toolSpec": {
        "name": "calculateTotals",
        "description": "Deterministically calculate each participant's subtotal, tax share, service charge share, and grand total. Money math is kept outside the LLM.",
        "inputSchema": {
          "json": {
            "type": "object",
            "properties": {
              "assignments": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "participantId": {"type": "string"},
                    "itemName": {"type": "string"},
                    "share": {"type": "number"}
                  },
                  "required": ["participantId", "itemName", "share"]
                }
              },
              "tax": {"type": "number", "description": "Total tax amount from the receipt."},
              "serviceCharge": {"type": "number", "description": "Total service charge from the receipt."},
              "subtotal": {"type": "number", "description": "Subtotal before tax and service charge."}
            },
            "required": ["assignments", "tax", "serviceCharge", "subtotal"]
          }
        }
      }
    },
    {
      "toolSpec": {
        "name": "generatePaymentLink",
        "description": "Generate a mock TNG payment link for a single participant.",
        "inputSchema": {
          "json": {
            "type": "object",
            "properties": {
              "participant": {
                "type": "object",
                "properties": {
                  "id": {"type": "string"},
                  "name": {"type": "string"},
                  "phone": {"type": "string"}
                },
                "required": ["id", "name", "phone"]
              },
              "amount": {
                "type": "number",
                "description": "Total amount owed by this participant."
              },
              "restaurant": {
                "type": "string",
                "description": "Name of the restaurant from the receipt."
              }
            },
            "required": ["participant", "amount", "restaurant"]
          }
        }
      }
    }
  ]
}
```

---

## 9. Detailed Component Design

### 9.1 OCR Service (AWS Bedrock Vision)

**Prompt Template**

```text
You are a receipt extraction engine. Analyze the attached receipt image and return ONLY a JSON object matching the schema below. Do not include markdown fences or explanatory text.

Schema:
{
  "restaurant": "string — merchant or restaurant name",
  "items": [
    {
      "name": "string — item description",
      "qty": "integer — quantity, default 1",
      "price": "number — unit or line total price in MYR"
    }
  ],
  "subtotal": "number — sum of items before tax/service charge",
  "tax": "number — tax amount in MYR, 0 if absent",
  "serviceCharge": "number — service charge in MYR, 0 if absent",
  "total": "number — final amount payable"
}

Rules:
1. If tax is a percentage, compute the absolute amount from the subtotal.
2. If an item has no explicit quantity, assume qty = 1.
3. Use the line total price for each item (unit price * qty).
4. If the receipt is blurry or partially unreadable, set a "confidence" field with value "low" and extract whatever is legible.
5. Return ONLY valid JSON. No commentary.
```

**Expected JSON Output Schema**

```json
{
  "restaurant": "string",
  "items": [
    {"name": "string", "qty": 1, "price": 0.00}
  ],
  "subtotal": 0.00,
  "tax": 0.00,
  "serviceCharge": 0.00,
  "total": 0.00,
  "confidence": "high | medium | low"
}
```

**Error Handling for Blurry/Incomplete Receipts**

| Scenario | Behavior |
|----------|----------|
| Confidence < 0.6 | Show warning banner: "Some items may be incorrect. Please review and edit." |
| No readable text | Return `{ "error": "UNREADABLE", "message": "Could not read receipt. Try a clearer photo or enter manually." }` |
| Partial items readable | Extract legible items, flag missing totals, allow manual top-up. |
| Missing tax/service charge | Default to 0.00; UI allows user to add values manually. |

### 9.2 NLP Split Service (LLM)

**Prompt Template**

```text
You are a bill-splitting parser. Given a user's natural language description, map each item to the correct participant. Handle shared items by assigning fractional shares.

Participants: {{participants_json}}
Items: {{items_json}}

User description: "{{user_text}}"

Return ONLY a JSON object:
{
  "assignments": [
    {"participantId": "p1", "itemName": "Nasi Lemak Ayam", "share": 1.0},
    {"participantId": "p2", "itemName": "Rojak", "share": 0.5}
  ],
  "reasoning": "Brief explanation of how shares were derived."
}

Rules:
1. Every item must appear at least once across assignments.
2. The sum of shares per item must equal exactly 1.0.
3. Match item names fuzzily if the user's wording differs slightly from the receipt (e.g., "nasi lemak" matches "Nasi Lemak Ayam").
4. If a participant is mentioned without an explicit item, assume they shared all unassigned items equally with others mentioned similarly.
5. Return ONLY valid JSON.
```

**Entity Extraction: Names → Items Mapping**

- Use fuzzy string matching (Levenshtein distance) between user text and receipt item names.
- If a name is ambiguous (e.g., "Cal" could be "Calvin" or "Callum"), prefer the participant whose name starts with the prefix.
- For unmentioned items, default to equal split across all participants unless the user explicitly states otherwise.

**Handling of "Shared" Items**

| User Phrase | Interpretation |
|-------------|----------------|
| "rojak shared" | Equal split among all participants (e.g., 0.5 each for 2 people). |
| "shared between Calvin and Jet" | Equal split only among named participants. |
| "Calvin and Jet shared rojak" | Same as above. |
| "everyone shared rojak" | Equal split across all participants on the bill. |

**Validation Rules**

1. All `itemName` values must exist in the extracted receipt items.
2. For each item, `sum(share)` across all assignments must equal `1.0` (within 0.001 tolerance).
3. All `participantId` values must exist in the session's participant list.
4. No negative shares allowed.
5. If validation fails, the orchestrator retries the LLM call once with the error context.

### 9.3 Tax Pro-ration Calculator

**Formula**

```
person_subtotal = Σ(item_price * person_share_of_item)

person_tax = (person_subtotal / receipt_subtotal) * total_tax

person_service_charge = (person_subtotal / receipt_subtotal) * total_service_charge

person_total = person_subtotal + person_tax + person_service_charge
```

**Service Charge Handling**

- Service charge is treated as a flat percentage of subtotal (common in Malaysia: 10%).
- If the receipt does not list a service charge separately, the UI allows manual entry.
- Pro-ration uses the same ratio as tax: `person_service_charge = (person_subtotal / receipt_subtotal) * total_service_charge`.

**Rounding Strategy**

- All intermediate calculations use Python `Decimal` with 4 decimal places.
- Final per-person amounts are rounded to the nearest sen (`Decimal.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)`).
- To prevent a rounding mismatch where the sum of person totals does not equal the receipt total, the remainder (if any) is added to the participant with the highest subtotal.

```python
from decimal import Decimal, ROUND_HALF_UP

def round_myr(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

def distribute_remainder(totals: dict[str, Decimal], receipt_total: Decimal):
    """Add any rounding remainder to the person with the highest subtotal."""
    current_sum = sum(totals.values(), Decimal("0"))
    remainder = receipt_total - current_sum
    if remainder != 0:
        max_person = max(totals, key=lambda p: totals[p])
        totals[max_person] += remainder
    return totals
```

### 9.4 Message Generator

**Template for Payment Request Messages**

```
Hey {to_name}! You were billed RM{amount:.2f} for {restaurant}.
Pay me back: {tng_link}
— {from_name}
```

**Mock TNG Payment Link Format**

```
https://tngdigital.com.my/pay?to={encoded_payee_name}&amount={amount:.2f}&ref={txn_ref}&memo={encoded_memo}
```

- `txn_ref` is an 8-character truncated UUID to make each link unique for demo purposes.
- `memo` is URI-encoded text like `"Bill split for Nasi Kandar Pelita"`.

---

## 10. Data Models

### 10.1 Receipt (in-memory)

```json
{
  "restaurant": "string",
  "items": [{"name": "string", "qty": 1, "price": 0.00}],
  "subtotal": 0.00,
  "tax": 0.00,
  "serviceCharge": 0.00,
  "total": 0.00,
  "imageUrl": "string | null"
}
```

### 10.2 Participant

```json
{
  "id": "string",
  "name": "string",
  "phone": "string",
  "tngDisplayName": "string | null"
}
```

### 10.3 Assignment

```json
{
  "participantId": "string",
  "items": [{"name": "string", "share": 1.0}],
  "subtotal": 0.00,
  "taxShare": 0.00,
  "serviceChargeShare": 0.00,
  "total": 0.00
}
```

### 10.4 PaymentRequest

```json
{
  "participantId": "string",
  "amount": 0.00,
  "message": "string",
  "tngLink": "string",
  "status": "pending | shared | paid"
}
```

---

## 11. Frontend Component Tree

```
<App>
  <LandingPage />              — "Snap or upload"
  <ReceiptUpload />            — Camera / file picker
  <ExtractedReceipt />         — Items table + edit
  <AddPeople />                — Name + phone form
  <AssignItems>
    <ManualAssignment />       — Dropdowns per item
    <NLPAssignment />          — Text input + AI split button
  </AssignItems>
  <ReviewAndShare>
    <PersonCard />             — Amount + Share button per person
    <ShareButton />            — Web Share API + fallbacks
  </ReviewAndShare>
  <DonePage />                 — Confirmation
</App>
```

---

## 12. Hackathon Demo Checklist

This checklist is designed to fit within a single 10-hour hackathon day.

### Phase 1 — Scaffold & OCR (Hours 0–3)

| # | Task | Time | Owner |
|---|------|------|-------|
| 1 | Initialize React + Vite + Tailwind frontend; deploy to Vercel preview. | 30 min | Frontend |
| 2 | Initialize FastAPI backend; deploy to AWS Lambda (or local). | 30 min | Backend |
| 3 | Build `POST /api/ocr` endpoint with Bedrock vision integration. | 60 min | Backend |
| 4 | Build `ReceiptUpload` component (camera + file picker) and wire to `/api/ocr`. | 60 min | Frontend |
| 5 | Build `ExtractedReceipt` component to display OCR results in a table. | 30 min | Frontend |

### Phase 2 — People & Manual Assignment (Hours 3–5)

| # | Task | Time | Owner |
|---|------|------|-------|
| 6 | Build `AddPeople` component (name + phone form, add/remove). | 30 min | Frontend |
| 7 | Build `ManualAssignment` component (dropdown per item). | 45 min | Frontend |
| 8 | Implement `POST /api/split/manual` endpoint with tax pro-ration logic. | 45 min | Backend |
| 9 | Wire manual assignment to backend; display live totals per person. | 30 min | Frontend |

### Phase 3 — NLP Split & Multi-Cloud (Hours 5–7.5)

| # | Task | Time | Owner |
|---|------|------|-------|
| 10 | Build `NLPAssignment` component (text input + "AI Split" button). | 30 min | Frontend |
| 11 | Implement `POST /api/split/nlp` on AliCloud FC with DashScope (Qwen). | 60 min | Backend |
| 12 | Add fuzzy item matching and shared-item handling in NLP parser. | 30 min | Backend |
| 13 | Integrate NLP result into frontend: auto-populate dropdowns + totals. | 30 min | Frontend |
| 14 | Set up AliCloud API Gateway route and verify cross-cloud calls in browser network tab. | 30 min | Infra |

### Phase 4 — Share & Polish (Hours 7.5–9.5)

| # | Task | Time | Owner |
|---|------|------|-------|
| 15 | Implement `POST /api/message` endpoint (message + TNG link). | 30 min | Backend |
| 16 | Build `ShareButton` component with Web Share API + clipboard fallback. | 45 min | Frontend |
| 17 | Build `ReviewAndShare` page with per-person cards and totals. | 30 min | Frontend |
| 18 | Add `DonePage` confirmation screen. | 15 min | Frontend |

### Phase 5 — Demo Prep (Hours 9.5–10)

| # | Task | Time | Owner |
|---|------|------|-------|
| 19 | Pre-cache a demo receipt OCR JSON for offline fallback. | 10 min | Backend |
| 20 | End-to-end test on mobile (camera → OCR → assign → share). | 15 min | All |
| 21 | Prepare 2-minute pitch script emphasizing multi-cloud + AI assignment + native share. | 10 min | All |
| 22 | Screenshot architecture diagram for slides. | 5 min | All |

---

## 13. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Bedrock API quota/throttle | Pre-cache a demo receipt OCR result; fallback to hardcoded JSON. |
| LLM returns bad assignment | `validateAssignments()` catches and prompts retry. |
| Web Share API not available | Fallback chain: Web Share API → copy to clipboard. |
| Receipt image quality | Show "manual entry" fallback if OCR confidence is low. |
| Demo network issues | Bundle a pre-extracted receipt in the app for offline demo. |
| AliCloud FC cold start latency | Keep the function warm with a ping every few minutes during the event, or accept a 2–3 second delay and show a spinner. |
| Phone number formatting inconsistency | Normalize all phone inputs to E.164 in the frontend before sending to backend. |

---

*End of Document*
