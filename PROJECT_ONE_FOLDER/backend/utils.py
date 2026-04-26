"""
Utility functions for Lambda handlers
"""
import json
from decimal import Decimal
from typing import Dict, Any


def decimal_to_float(obj):
    """
    Convert Decimal objects to float for JSON serialization
    """
    if isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, dict):
        return {k: decimal_to_float(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [decimal_to_float(item) for item in obj]
    return obj


def success_response(data: Dict[str, Any], status_code: int = 200) -> Dict[str, Any]:
    """
    Return a successful API response
    
    Args:
        data: Response data dictionary
        status_code: HTTP status code (default: 200)
    
    Returns:
        Lambda response dictionary with CORS headers
    """
    # Convert Decimal objects to float for JSON serialization
    data = decimal_to_float(data)
    
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
        "body": json.dumps({
            "success": True,
            **data
        })
    }


def error_response(status_code: int, message: str) -> Dict[str, Any]:
    """
    Return an error API response
    
    Args:
        status_code: HTTP status code
        message: Error message
    
    Returns:
        Lambda response dictionary with CORS headers
    """
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
        "body": json.dumps({
            "success": False,
            "error": message
        })
    }


def validate_required_params(params: Dict[str, Any], required: list) -> tuple:
    """
    Validate that required parameters are present
    
    Args:
        params: Dictionary of parameters
        required: List of required parameter names
    
    Returns:
        Tuple of (is_valid: bool, missing_params: list)
    """
    missing = [param for param in required if not params.get(param)]
    return (len(missing) == 0, missing)


def parse_query_params(event: Dict[str, Any]) -> Dict[str, Any]:
    """
    Parse query string parameters from Lambda event
    
    Args:
        event: Lambda event dictionary
    
    Returns:
        Dictionary of query parameters (empty dict if none)
    """
    return event.get('queryStringParameters', {}) or {}


def parse_body(event: Dict[str, Any]) -> Dict[str, Any]:
    """
    Parse JSON body from Lambda event
    
    Args:
        event: Lambda event dictionary
    
    Returns:
        Dictionary of body data (empty dict if none or invalid)
    """
    body = event.get('body', '{}')
    if isinstance(body, str):
        try:
            return json.loads(body)
        except json.JSONDecodeError:
            return {}
    return body or {}

# Made with Bob
