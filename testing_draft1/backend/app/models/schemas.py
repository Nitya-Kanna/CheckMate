from pydantic import BaseModel


# ── OCR ──

class OcrRequest(BaseModel):
    image: str  # base64 encoded image


class ReceiptItemResponse(BaseModel):
    name: str
    quantity: int = 1
    unit_price: float
    total_price: float


class OcrResponse(BaseModel):
    restaurant: str | None = None
    items: list[ReceiptItemResponse]
    tax: float = 0.0
    total: float = 0.0
    currency: str = "MYR"


# ── Split ──

class ContactInfo(BaseModel):
    id: str
    name: str
    phone: str


class ItemAssignment(BaseModel):
    item_index: int
    share_ratio: float = 1.0


class NlpSplitRequest(BaseModel):
    items: list[ReceiptItemResponse]
    contacts: list[ContactInfo]
    prompt: str


class DiscoveredPerson(BaseModel):
    name: str
    match_status: str  # "found" | "new"
    matched_contact_id: str | None = None
    suggested_phone: str | None = None


class PersonAssignment(BaseModel):
    person: str
    items: list[ItemAssignment]
    amount: float


class NlpSplitResponse(BaseModel):
    discovered_people: list[DiscoveredPerson]
    assignments: list[PersonAssignment]


class ManualAssignment(BaseModel):
    person: str
    item_indices: list[int]


class ManualSplitRequest(BaseModel):
    items: list[ReceiptItemResponse]
    assignments: list[ManualAssignment]


class PersonTotal(BaseModel):
    person: str
    amount: float


class ManualSplitResponse(BaseModel):
    person_totals: list[PersonTotal]


# ── Message ──

class MessageRequest(BaseModel):
    from_name: str
    to_name: str
    amount: float
    restaurant: str
    phone: str


class MessageResponse(BaseModel):
    message: str
    tng_link: str
    wa_me_link: str
