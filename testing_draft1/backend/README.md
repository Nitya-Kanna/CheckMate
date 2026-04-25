# AI Bill Splitter — Backend

Hackathon MVP backend built with Python + FastAPI.

## Quick Start

```bash
cd testing_draft1/backend
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/ocr | Receipt image → extracted items (Textract + VLM) |
| POST | /api/split/nlp | Natural language → item assignments (Bedrock LLM) |
| POST | /api/split/manual | Manual assignments → per-person totals |
| POST | /api/message | Generate payment share message + links |
| GET | /health | Health check |

## Tech Stack

- **Framework**: FastAPI
- **OCR**: Amazon Textract + VLM
- **LLM**: Amazon Bedrock (Claude/Llama)
- **Storage**: Alicloud OSS
- **Database**: Alicloud DB
