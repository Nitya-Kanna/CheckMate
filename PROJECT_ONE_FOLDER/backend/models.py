"""
Data models and type definitions for the Bill Splitter application
"""
from typing import TypedDict, List, Optional
from datetime import datetime


class ReceiptItem(TypedDict):
    """Individual item on a receipt"""
    name: str
    price: float
    quantity: Optional[int]


class Receipt(TypedDict):
    """Receipt data model"""
    receipt_id: str
    user_id: str
    restaurant_name: str
    date: str
    time: str
    items: List[ReceiptItem]
    subtotal: float
    tax: float
    service: float
    total: float
    items_count: int
    status: str  # ready_to_split, splitting, completed
    thumbnail: Optional[str]
    s3_receipt_url: Optional[str]
    created_at: str
    updated_at: Optional[str]


class User(TypedDict):
    """User/Contact data model"""
    user_id: str
    name: str
    email: str
    phone: str
    avatar: Optional[str]
    is_favorite: Optional[bool]
    last_split: Optional[str]
    total_splits: Optional[int]
    relationship: Optional[str]
    created_at: str
    updated_at: Optional[str]


class SplitItem(TypedDict):
    """Individual split allocation"""
    person: str
    item: str
    price: float
    contact: Optional[dict]


class SplitSession(TypedDict):
    """Bill splitting session"""
    split_id: str
    receipt_id: str
    user_id: str
    ai_input: str
    parsed_data: List[SplitItem]
    confirmed_data: List[SplitItem]
    status: str  # parsing, confirming, requesting, completed
    created_at: str
    updated_at: Optional[str]


class PaymentRequest(TypedDict):
    """Payment request to a contact"""
    payment_request_id: str
    split_id: str
    from_user_id: str
    to_user_id: str
    to_contact_name: str
    to_contact_email: Optional[str]
    to_contact_phone: Optional[str]
    item_name: str
    amount: float
    status: str  # pending, paid, failed, expired
    qr_code_url: Optional[str]
    created_at: str
    paid_at: Optional[str]
    expires_at: str


class Transaction(TypedDict):
    """Transaction history entry"""
    user_id: str
    timestamp: str
    transaction_id: str
    type: str  # payment_request_sent, payment_request_received, payment_made, payment_received
    description: str
    item_name: Optional[str]
    amount: float
    status: str  # pending, completed, failed
    related_payment_request_id: Optional[str]
    related_split_id: Optional[str]
    created_at: str


def generate_id(prefix: str) -> str:
    """Generate a unique ID with prefix"""
    timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S%f')
    return f"{prefix}_{timestamp}"


def get_current_timestamp() -> str:
    """Get current UTC timestamp in ISO format"""
    return datetime.utcnow().isoformat() + 'Z'

# Made with Bob
