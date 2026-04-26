# Bill Splitter Backend

AWS Lambda-based backend for the Bill Splitter application.

## Structure

```
backend/
├── handlers/           # Lambda function handlers
│   ├── get_receipts.py    # GET /receipts
│   ├── get_contacts.py    # GET /contacts
│   └── get_history.py     # GET /history
├── db.py              # DynamoDB client and queries
├── models.py          # Data models (TypedDicts)
├── utils.py           # Utility functions (responses, validation)
├── requirements.txt   # Python dependencies
└── README.md         # This file
```

## Lambda Functions

### 1. GET /receipts
**Handler**: `handlers/get_receipts.py`
**Function**: Get all receipts for a user with optional filtering

**Query Parameters**:
- `user_id` (required): User ID
- `limit` (optional): Number of receipts (default: 20)
- `offset` (optional): Pagination offset (default: 0)
- `status` (optional): Filter by status (all|ready_to_split|completed)

**Response**:
```json
{
  "success": true,
  "receipts": [...],
  "total_count": 4,
  "has_more": false,
  "limit": 20,
  "offset": 0
}
```

### 2. GET /contacts
**Handler**: `handlers/get_contacts.py`
**Function**: Get user contacts for bill splitting

**Query Parameters**:
- `user_id` (required): User ID
- `search` (optional): Search query
- `limit` (optional): Number of contacts (default: 10, max: 50)

**Response**:
```json
{
  "success": true,
  "contacts": [...],
  "total_count": 5,
  "returned_count": 5,
  "search_query": null,
  "timestamp": "2026-04-25T12:00:00Z"
}
```

### 3. GET /history
**Handler**: `handlers/get_history.py`
**Function**: Get transaction history for a user

**Query Parameters**:
- `user_id` (required): User ID
- `limit` (optional): Number of transactions (default: 50, max: 100)

**Response**:
```json
{
  "success": true,
  "transactions": [...],
  "total_count": 6,
  "user_id": "user_123",
  "timestamp": "2026-04-25T12:00:00Z"
}
```

## DynamoDB Tables

- **BillSplitter-Users**: User profiles and contacts
- **BillSplitter-Receipts**: Receipt metadata and line items
- **BillSplitter-SplitSessions**: Bill splitting sessions
- **BillSplitter-PaymentRequests**: Individual payment requests
- **BillSplitter-TransactionHistory**: Transaction timeline

## Deployment

### Prerequisites
- AWS CLI configured
- Python 3.9+
- boto3 installed

### Deploy a Lambda Function

1. **Package the function**:
```bash
cd backend
zip -r function.zip handlers/get_receipts.py utils.py models.py db.py
```

2. **Update Lambda**:
```bash
aws lambda update-function-code \
  --function-name get-receipts-function \
  --zip-file fileb://function.zip \
  --region ap-southeast-1
```

3. **Repeat for other functions**:
- `get-contacts-function`
- `get-history-function` (new)

### Add DynamoDB Permissions

Update Lambda execution role to include:
```json
{
  "Effect": "Allow",
  "Action": [
    "dynamodb:GetItem",
    "dynamodb:Query",
    "dynamodb:Scan",
    "dynamodb:PutItem",
    "dynamodb:UpdateItem"
  ],
  "Resource": [
    "arn:aws:dynamodb:ap-southeast-1:*:table/BillSplitter-*"
  ]
}
```

## Development

### Local Testing
```bash
# Install dependencies
pip install -r requirements.txt

# Test a handler locally
python -c "from handlers.get_receipts import handler; print(handler({'queryStringParameters': {'user_id': 'user_123'}}, {}))"
```

### Current Status
- ✅ Handlers created with mock data
- ✅ DynamoDB tables deployed
- ⏳ DynamoDB integration (TODO: uncomment db.py calls in handlers)
- ⏳ IAM permissions (TODO: add DynamoDB access to Lambda roles)

## Next Steps

1. **Add DynamoDB permissions** to Lambda execution roles
2. **Seed test data** into DynamoDB tables
3. **Update handlers** to use real DynamoDB queries (uncomment TODO sections)
4. **Deploy updated functions** to AWS Lambda
5. **Test end-to-end** with React frontend