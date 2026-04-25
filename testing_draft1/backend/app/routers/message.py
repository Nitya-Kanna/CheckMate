from fastapi import APIRouter

from app.models.schemas import MessageRequest, MessageResponse
from app.services.message_service import generate_payment_message

router = APIRouter()


@router.post("/message", response_model=MessageResponse)
async def message_endpoint(request: MessageRequest):
    """Generate a shareable payment request message with TNG + WhatsApp links."""
    result = generate_payment_message(
        from_name=request.from_name,
        to_name=request.to_name,
        amount=request.amount,
        restaurant=request.restaurant,
        phone=request.phone,
    )
    return result
