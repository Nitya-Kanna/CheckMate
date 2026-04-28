"""
Lambda handler for POST /split-sessions
Create a new bill split session
"""
import json
import uuid
from datetime import datetime
from decimal import Decimal
from repository import dynamodb, split_sessions_table, receipts_table
from utils import success_response, error_response


def lambda_handler(event, context):
    """
    Create a new split session
    
    Request body:
    {
        "receipt_id": "rcpt_001",
        "created_by": "user_123",
        "participants": [
            {
                "user_id": "user_456",
                "name": "Lisa Wong",
                "items": ["Pizza"],
                "amount": 25.00
            }
        ]
    }
    
    Response:
    {
        "session_id": "split_abc123",
        "receipt_id": "rcpt_001",
        "created_by": "user_123",
        "participants": [...],
        "total_amount": 25.00,
        "status": "active",
        "created_at": "2024-01-15T12:35:00Z"
    }
    """
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        receipt_id = body.get('receipt_id')
        created_by = body.get('created_by')
        participants = body.get('participants', [])
        
        # Validate required fields
        if not receipt_id:
            return error_response(400, 'Missing receipt_id')
        
        if not created_by:
            return error_response(400, 'Missing created_by')
        
        if not participants or len(participants) == 0:
            return error_response(400, 'Missing participants')
        
        # Verify receipt exists
        try:
            receipt_response = receipts_table.get_item(
                Key={'receipt_id': receipt_id}
            )
            if 'Item' not in receipt_response:
                return error_response(404, f'Receipt {receipt_id} not found')
            
            receipt = receipt_response['Item']
        except Exception as e:
            print(f"Error fetching receipt: {str(e)}")
            return error_response(500, 'Error verifying receipt')
        
        # Calculate total amount from participants
        total_amount = Decimal('0')
        for participant in participants:
            amount = participant.get('amount', 0)
            total_amount += Decimal(str(amount))
            
            # Set default status for each participant
            if 'status' not in participant:
                participant['status'] = 'pending'
        
        # Generate session ID
        session_id = f"split_{uuid.uuid4().hex[:12]}"
        
        # Create timestamp
        created_at = datetime.utcnow().isoformat() + 'Z'
        
        # Create split session item
        session_item = {
            'session_id': session_id,
            'receipt_id': receipt_id,
            'created_by': created_by,
            'participants': participants,
            'total_amount': total_amount,
            'status': 'active',
            'created_at': created_at
        }
        
        # Save to DynamoDB
        split_sessions_table.put_item(Item=session_item)
        
        # Update receipt status to 'split'
        receipts_table.update_item(
            Key={'receipt_id': receipt_id},
            UpdateExpression='SET #status = :status',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':status': 'split'}
        )
        
        print(f"Created split session: {session_id}")
        
        return success_response({
            'session': session_item,
            'message': 'Split session created successfully'
        }, 201)
        
    except json.JSONDecodeError:
        return error_response(400, 'Invalid JSON in request body')
    except Exception as e:
        print(f"Error creating split session: {str(e)}")
        return error_response(500, f'Internal server error: {str(e)}')

# Made with Bob
