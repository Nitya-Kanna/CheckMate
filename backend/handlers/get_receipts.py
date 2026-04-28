"""
Lambda handler for GET /receipts endpoint
Returns all receipts for a user with optional filtering
"""
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils import success_response, error_response, parse_query_params, validate_required_params
from repository import get_receipts_by_user


def handler(event, context):
    """
    Lambda function to get all receipts for a user
    
    Query Parameters:
    - user_id: User ID (required)
    - limit: Number of receipts to return (default: 20)
    - offset: Pagination offset (default: 0)
    - status: Filter by status (optional: all|ready_to_split|completed)
    """
    try:
        # Parse query parameters
        params = parse_query_params(event)
        user_id = params.get('user_id')
        limit = int(params.get('limit', 20))
        offset = int(params.get('offset', 0))
        status_filter = params.get('status', 'all')
        
        # Validate required parameters
        is_valid, missing = validate_required_params(params, ['user_id'])
        if not is_valid:
            return error_response(400, f"Missing required parameters: {', '.join(missing)}")
        
        # Get receipts from DynamoDB
        if status_filter != 'all':
            all_receipts = get_receipts_by_user(user_id, status=status_filter, limit=limit+offset)
        else:
            all_receipts = get_receipts_by_user(user_id, limit=limit+offset)
        
        # Pagination
        total_count = len(all_receipts)
        receipts = all_receipts[offset:offset + limit]
        has_more = (offset + limit) < total_count
        
        return success_response({
            "receipts": receipts,
            "total_count": total_count,
            "has_more": has_more,
            "limit": limit,
            "offset": offset
        })
        
    except Exception as e:
        return error_response(500, f"Internal server error: {str(e)}")

