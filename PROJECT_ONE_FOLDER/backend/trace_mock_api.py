from datetime import datetime, timezone
import uuid

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


app = FastAPI(title="Trace Mock API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TRACE = {}


def now_iso():
    return datetime.now(timezone.utc).isoformat()


class PosEventIn(BaseModel):
    transaction_id: str | None = None
    request_id: str | None = None
    merchant_name: str = "Restaurant"
    amount: float = 0
    recipient: str = "Unknown"
    item: str = "Item"


class TxOnlyIn(BaseModel):
    transaction_id: str


@app.post("/pos/events")
def pos_events(payload: PosEventIn):
    transaction_id = payload.transaction_id or f"tx_{uuid.uuid4().hex[:12]}"
    request_id = payload.request_id or f"req_{uuid.uuid4().hex[:12]}"
    ts = now_iso()

    TRACE[transaction_id] = {
        "transaction_id": transaction_id,
        "request_id": request_id,
        "created_at": ts,
        "updated_at": ts,
        "statuses": {
            "pos_event_created": True,
            "event_published": True,
            "app_received": False,
            "receipt_rendered": False,
        },
        "events": [
            {"event_type": "pos_event_created", "timestamp": ts, "source": "pos"},
            {"event_type": "event_published", "timestamp": ts, "source": "api"},
        ],
        "payload": payload.model_dump(),
    }

    return {
        "success": True,
        "transaction_id": transaction_id,
        "request_id": request_id,
        "statuses": TRACE[transaction_id]["statuses"],
    }


@app.post("/trace/received")
def trace_received(payload: TxOnlyIn):
    tx = TRACE.get(payload.transaction_id)
    if not tx:
        return {"success": False, "message": "transaction_id not found"}

    ts = now_iso()
    tx["updated_at"] = ts
    tx["statuses"]["app_received"] = True
    tx["events"].append({"event_type": "app_received", "timestamp": ts, "source": "payer-ui"})
    return {"success": True, "transaction_id": payload.transaction_id, "app_received": True}


@app.post("/trace/rendered")
def trace_rendered(payload: TxOnlyIn):
    tx = TRACE.get(payload.transaction_id)
    if not tx:
        return {"success": False, "message": "transaction_id not found"}

    ts = now_iso()
    tx["updated_at"] = ts
    tx["statuses"]["receipt_rendered"] = True
    tx["events"].append({"event_type": "receipt_rendered", "timestamp": ts, "source": "payer-ui"})
    return {"success": True, "transaction_id": payload.transaction_id, "receipt_rendered": True}


@app.get("/trace/{transaction_id}")
def get_trace(transaction_id: str):
    tx = TRACE.get(transaction_id)
    if not tx:
        return {
            "success": True,
            "transaction_id": transaction_id,
            "statuses": {
                "pos_event_created": False,
                "event_published": False,
                "app_received": False,
                "receipt_rendered": False,
            },
            "events": [],
        }
    return {"success": True, **tx}
