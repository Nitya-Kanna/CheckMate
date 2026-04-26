"""
Lambda handler for POST /payment-requests
Send payment requests to participants
"""
import json
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from db import dynamodb
from utils import success_response, error_response

# DynamoDB tables
payment_requests_table = dynamodb.Table('PaymentRequests')
split_sessions_table = dynamodb.Table('SplitSessions')
transaction_history_table = dynamodb.Table('TransactionHistory')


def lambda_handler(event, context):
    """
    Create payment requests for split session participants
    
    Request body:
    {
        "session_id": "split_abc123",
        "from_user_id": "user_123",
        "requests": [
            {
                "to_user_id": "user_456",
                "to_user_name": "Lisa Wong",
                "amount": 25.00,
                "items": ["Pizza"]
            }
        ]
    }
    
    Response:
    {
        "requests": [
            {
                "request_id": "req_xyz789",
                "session_id": "split_abc123",
                "from_user_id": "user_123",
                "to_user_id": "user_456",
                "to_user_name": "Lisa Wong",
                "amount": 25.00,
                "items": ["Pizza"],
                "status": "pending",
                "created_at": "2024-01-15T12:35:00Z",
                "expires_at": "2024-01-22T12:35:00Z"
            }
        ],
        "total_requests": 1
    }
    """
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        session_id = body.get('session_id')
        from_user_id = body.get('from_user_id')
        requests = body.get('requests', [])
        
        # Validate required fields
        if not session_id:
            return error_response(400, 'Missing session_id')
        
        if not from_user_id:
            return error_response(400, 'Missing from_user_id')
        
        if not requests or len(requests) == 0:
            return error_response(400, 'Missing requests')
        
        # Verify split session exists
        try:
            session_response = split_sessions_table.get_item(
                Key={'session_id': session_id}
            )
            if 'Item' not in session_response:
                return error_response(404, f'Split session {session_id} not found')
            
            session = session_response['Item']
        except Exception as e:
            print(f"Error fetching split session: {str(e)}")
            return error_response(500, 'Error verifying split session')
        
        # Create payment requests
        created_requests = []
        current_time = datetime.utcnow()
        expires_at = current_time + timedelta(days=7)  # Expire in 7 days
        
        for request in requests:
            to_user_id = request.get('to_user_id')
            to_user_name = request.get('to_user_name', 'Unknown')
            amount = request.get('amount', 0)
            items = request.get('items', [])
            
            if not to_user_id:
                continue
            
            # Generate request ID
            request_id = f"req_{uuid.uuid4().hex[:12]}"
            
            # Create payment request item
            request_item = {
                'request_id': request_id,
                'session_id': session_id,
                'from_user_id': from_user_id,
                'to_user_id': to_user_id,
                'to_user_name': to_user_name,
                'amount': Decimal(str(amount)),
                'items': items,
                'status': 'pending',
                'created_at': current_time.isoformat() + 'Z',
                'expires_at': expires_at.isoformat() + 'Z'
            }
            
            # Save to DynamoDB
            payment_requests_table.put_item(Item=request_item)
            
            # Create transaction history entry
            transaction_id = f"txn_{uuid.uuid4().hex[:12]}"
            transaction_item = {
                'transaction_id': transaction_id,
                'user_id': to_user_id,
                'type': 'payment_request_received',
                'amount': Decimal(str(amount)),
                'description': f'Payment request from {from_user_id}',
                'related_request_id': request_id,
                'status': 'pending',
                'created_at': current_time.isoformat() + 'Z'
            }
            transaction_history_table.put_item(Item=transaction_item)
            
            created_requests.append(request_item)
            print(f"Created payment request: {request_id}")
        
        if len(created_requests) == 0:
            return error_response(400, 'No valid payment requests created')
        
        return success_response({
            'requests': created_requests,
            'total_requests': len(created_requests),
            'message': f'Successfully created {len(created_requests)} payment request(s)'
        }, 201)
        
    except json.JSONDecodeError:
        return error_response(400, 'Invalid JSON in request body')
    except Exception as e:
        print(f"Error creating payment requests: {str(e)}")
        return error_response(500, f'Internal server error: {str(e)}')

# Made with Bob
