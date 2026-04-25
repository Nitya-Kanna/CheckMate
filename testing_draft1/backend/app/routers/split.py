from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    NlpSplitRequest,
    NlpSplitResponse,
    ManualSplitRequest,
    ManualSplitResponse,
)
from app.services.split_service import nlp_split, manual_split

router = APIRouter()


@router.post("/split/nlp", response_model=NlpSplitResponse)
async def nlp_split_endpoint(request: NlpSplitRequest):
    """Use LLM (Bedrock) to parse natural language and assign items to people."""
    try:
        result = await nlp_split(request.items, request.contacts, request.prompt)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NLP split failed: {str(e)}")


@router.post("/split/manual", response_model=ManualSplitResponse)
async def manual_split_endpoint(request: ManualSplitRequest):
    """Calculate totals from manual item assignments."""
    try:
        result = manual_split(request.items, request.assignments)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Manual split failed: {str(e)}")
