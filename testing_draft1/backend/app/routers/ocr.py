from fastapi import APIRouter, HTTPException

from app.models.schemas import OcrRequest, OcrResponse
from app.services.ocr_service import extract_receipt

router = APIRouter()


@router.post("/ocr", response_model=OcrResponse)
async def ocr_endpoint(request: OcrRequest):
    """Upload a receipt image (base64) and extract items via Amazon Textract + VLM."""
    try:
        result = await extract_receipt(request.image)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR extraction failed: {str(e)}")
