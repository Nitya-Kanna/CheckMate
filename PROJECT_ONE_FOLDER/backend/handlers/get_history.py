"""
Lambda handler for GET /history endpoint
Returns transaction history for a user (TNG-style history page)
"""
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils import success_response, error_response, parse_query_params, validate_required_params
from db import get_transaction_history
from datetime import datetime, timedelta


def handler(event, context):
    """
    Lambda function to get transaction history for a user
    
    Query Parameters:
    - user_id: User ID (required)
    - limit: Number of transactions to return (default: 50, max: 100)
    """
    try:
        # Parse query parameters
        params = parse_query_params(event)
        user_id = params.get('user_id')
        limit = int(params.get('limit', 50))
        
        # Validate required parameters
        is_valid, missing = validate_required_params(params, ['user_id'])
        if not is_valid:
            return error_response(400, f"Missing required parameters: {', '.join(missing)}")
        
        # Validate limit
        if limit > 100:
            limit = 100
        
        # Get transaction history from DynamoDB
        # For now, use mock data until DynamoDB is fully integrated
        # TODO: Uncomment when DynamoDB permissions are set up
        # transactions = get_transaction_history(user_id, limit=limit)
        
        # TEMPORARY: Use mock data
        transactions = generate_mock_transactions(user_id)[:limit]
        
        return success_response({
            "transactions": transactions,
            "total_count": len(transactions),
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat() + 'Z'
        })
        
    except Exception as e:
        return error_response(500, f"Internal server error: {str(e)}")


def generate_mock_transactions(user_id: str):
    """Generate mock transaction history data for testing"""
    base_date = datetime.now()
    
    transactions = [
        {
            "user_id": user_id,
            "timestamp": (base_date - timedelta(hours=2)).isoformat() + 'Z',
            "transaction_id": "txn_001",
            "type": "payment_request_sent",
            "description": "Request to Zin Ahmad",
            "item_name": "Nasi Lemak",
            "amount": 12.00,
            "status": "pending",
            "related_payment_request_id": "pr_001",
            "related_split_id": "split_001",
            "created_at": (base_date - timedelta(hours=2)).isoformat() + 'Z'
        },
        {
            "user_id": user_id,
            "timestamp": (base_date - timedelta(hours=2, minutes=1)).isoformat() + 'Z',
            "transaction_id": "txn_002",
            "type": "payment_request_sent",
            "description": "Request to Zin Tan",
            "item_name": "Pizza (Large)",
            "amount": 35.00,
            "status": "pending",
            "related_payment_request_id": "pr_002",
            "related_split_id": "split_001",
            "created_at": (base_date - timedelta(hours=2, minutes=1)).isoformat() + 'Z'
        },
        {
            "user_id": user_id,
            "timestamp": (base_date - timedelta(days=1, hours=5)).isoformat() + 'Z',
            "transaction_id": "txn_003",
            "type": "payment_received",
            "description": "Received from Lisa Wong",
            "item_name": "Cappuccino",
            "amount": 8.50,
            "status": "completed",
            "related_payment_request_id": "pr_003",
            "related_split_id": "split_002",
            "created_at": (base_date - timedelta(days=1, hours=5)).isoformat() + 'Z'
        },
        {
            "user_id": user_id,
            "timestamp": (base_date - timedelta(days=2, hours=3)).isoformat() + 'Z',
            "transaction_id": "txn_004",
            "type": "payment_request_sent",
            "description": "Request to John Lee",
            "item_name": "Salmon Sashimi",
            "amount": 28.00,
            "status": "completed",
            "related_payment_request_id": "pr_004",
            "related_split_id": "split_003",
            "created_at": (base_date - timedelta(days=2, hours=3)).isoformat() + 'Z'
        },
        {
            "user_id": user_id,
            "timestamp": (base_date - timedelta(days=3, hours=7)).isoformat() + 'Z',
            "transaction_id": "txn_005",
            "type": "payment_request_received",
            "description": "Request from Sarah Chen",
            "item_name": "Classic Burger",
            "amount": 15.00,
            "status": "pending",
            "related_payment_request_id": "pr_005",
            "related_split_id": "split_004",
            "created_at": (base_date - timedelta(days=3, hours=7)).isoformat() + 'Z'
        },
        {
            "user_id": user_id,
            "timestamp": (base_date - timedelta(days=5, hours=12)).isoformat() + 'Z',
            "transaction_id": "txn_006",
            "type": "payment_made",
            "description": "Paid to Zin Ahmad",
            "item_name": "Miso Soup",
            "amount": 5.00,
            "status": "completed",
            "related_payment_request_id": "pr_006",
            "related_split_id": "split_005",
            "created_at": (base_date - timedelta(days=5, hours=12)).isoformat() + 'Z'
        }
    ]
    
    return transactions

# Made with Bob
