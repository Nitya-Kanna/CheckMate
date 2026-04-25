"""
Message Service — Generate shareable payment request messages.

Generates pre-formatted messages with TNG deep links and WhatsApp links.
"""

from urllib.parse import quote

from app.models.schemas import MessageResponse


def generate_payment_message(
    from_name: str,
    to_name: str,
    amount: float,
    restaurant: str,
    phone: str,
) -> MessageResponse:
    """Generate a payment request message with TNG and WhatsApp links."""
    
    message = (
        f"Hey {to_name}! You were billed RM{amount:.2f} for {restaurant}. "
        f"Pay {from_name} back via TNG: https://tngdigital.com.my/pay?to=DEMO&amount={amount:.2f}"
    )
    
    # Mock TNG deep link (replace with real TNG API in production)
    tng_link = f"https://tngdigital.com.my/pay?to=DEMO&amount={amount:.2f}&ref={restaurant}"
    
    # WhatsApp deep link
    clean_phone = phone.replace("-", "").replace(" ", "").replace("+", "")
    wa_me_link = f"https://wa.me/{clean_phone}?text={quote(message)}"
    
    return MessageResponse(
        message=message,
        tng_link=tng_link,
        wa_me_link=wa_me_link,
    )
