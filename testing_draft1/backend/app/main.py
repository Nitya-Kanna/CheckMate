from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import ocr, split, message

app = FastAPI(
    title="AI Bill Splitter API",
    description="Hackathon MVP — Receipt OCR, AI Split, Payment Sharing",
    version="0.1.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(ocr.router, prefix="/api", tags=["OCR"])
app.include_router(split.router, prefix="/api", tags=["Split"])
app.include_router(message.router, prefix="/api", tags=["Message"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "ai-bill-splitter"}
