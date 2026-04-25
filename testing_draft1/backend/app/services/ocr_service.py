"""
OCR Service — Amazon Textract + VLM (Vision Language Model)

For hackathon MVP: uses a mock/stub that returns sample data.
Production: integrate Amazon Textract AnalyzeExpense API + Bedrock VLM.
"""

from app.models.schemas import OcrResponse, ReceiptItemResponse


async def extract_receipt(image_base64: str) -> OcrResponse:
    """
    Extract receipt data from a base64-encoded image.
    
    TODO: Integrate Amazon Textract AnalyzeExpense API
    TODO: Add VLM fallback for noisy receipts via Bedrock
    """
    # ── MOCK RESPONSE for development ──
    # Replace with real Textract + Bedrock calls
    return OcrResponse(
        restaurant="Nasi Kandar Pelita",
        items=[
            ReceiptItemResponse(name="Nasi Lemak", quantity=1, unit_price=8.00, total_price=8.00),
            ReceiptItemResponse(name="Teh Ice", quantity=1, unit_price=3.50, total_price=3.50),
            ReceiptItemResponse(name="Iced Coffee", quantity=1, unit_price=6.00, total_price=6.00),
            ReceiptItemResponse(name="Rojak", quantity=1, unit_price=10.00, total_price=10.00),
        ],
        tax=1.65,
        total=29.15,
        currency="MYR",
    )
