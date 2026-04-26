"""
Lambda handler for GET /contacts endpoint
Returns user contacts for bill splitting
"""
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils import success_response, error_response, parse_query_params, validate_required_params
from db import get_all_users, search_users
from datetime import datetime


def handler(event, context):
    """
    Lambda function to get user contacts for bill splitting
    
    Query Parameters:
    - user_id: User ID (required)
    - search: Search query to filter contacts (optional)
    - limit: Number of contacts to return (default: 10, max: 50)
    """
    try:
        # Parse query parameters
        params = parse_query_params(event)
        user_id = params.get('user_id')
        search_query = params.get('search', '').lower()
        limit = int(params.get('limit', 10))
        
        # Validate required parameters
        is_valid, missing = validate_required_params(params, ['user_id'])
        if not is_valid:
            return error_response(400, f"Missing required parameters: {', '.join(missing)}")
        
        # Validate limit
        if limit > 50:
            limit = 50
        
        # Get contacts from DynamoDB
        if search_query:
            filtered_contacts = search_users(search_query, limit=limit)
        else:
            filtered_contacts = get_all_users(limit=limit)
        
        # Apply limit
        contacts = filtered_contacts[:limit]
        
        return success_response({
            "contacts": contacts,
            "total_count": len(filtered_contacts),
            "returned_count": len(contacts),
            "search_query": search_query if search_query else None,
            "timestamp": datetime.utcnow().isoformat() + 'Z'
        })
        
    except Exception as e:
        return error_response(500, f"Internal server error: {str(e)}")

# Made with Bob
