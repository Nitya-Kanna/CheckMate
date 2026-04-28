"""
Utility functions for Lambda handlers
"""
import json
import logging
from decimal import Decimal
from typing import Dict, Any

# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


def decimal_to_float(obj):
    """
    Convert Decimal objects to float for JSON serialization
    
    Args:
        obj: Object that may contain Decimal values
    
    Returns:
        Object with Decimals converted to floats
    """
    if isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, dict):
        return {k: decimal_to_float(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [decimal_to_float(item) for item in obj]
    return obj


def float_to_decimal(obj):
    """
    Convert float objects to Decimal for DynamoDB storage
    
    Args:
        obj: Object that may contain float values
    
    Returns:
        Object with floats converted to Decimals
    """
    if isinstance(obj, float):
        return Decimal(str(obj))
    elif isinstance(obj, dict):
        return {k: float_to_decimal(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [float_to_decimal(item) for item in obj]
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


def validate_string(value: Any, field_name: str, min_length: int = 1, max_length: int = 255) -> tuple:
    """
    Validate string field
    
    Args:
        value: Value to validate
        field_name: Name of the field (for error messages)
        min_length: Minimum length (default: 1)
        max_length: Maximum length (default: 255)
    
    Returns:
        Tuple of (is_valid: bool, error_message: str)
    """
    if not isinstance(value, str):
        return (False, f"{field_name} must be a string")
    
    if len(value) < min_length:
        return (False, f"{field_name} must be at least {min_length} characters")
    
    if len(value) > max_length:
        return (False, f"{field_name} must be at most {max_length} characters")
    
    return (True, "")


def validate_number(value: Any, field_name: str, min_value: float = 0, max_value: float = None) -> tuple:
    """
    Validate numeric field
    
    Args:
        value: Value to validate
        field_name: Name of the field (for error messages)
        min_value: Minimum value (default: 0)
        max_value: Maximum value (optional)
    
    Returns:
        Tuple of (is_valid: bool, error_message: str)
    """
    try:
        num_value = float(value)
    except (TypeError, ValueError):
        return (False, f"{field_name} must be a number")
    
    if num_value < min_value:
        return (False, f"{field_name} must be at least {min_value}")
    
    if max_value is not None and num_value > max_value:
        return (False, f"{field_name} must be at most {max_value}")
    
    return (True, "")


def validate_list(value: Any, field_name: str, min_items: int = 0, max_items: int = None) -> tuple:
    """
    Validate list field
    
    Args:
        value: Value to validate
        field_name: Name of the field (for error messages)
        min_items: Minimum number of items (default: 0)
        max_items: Maximum number of items (optional)
    
    Returns:
        Tuple of (is_valid: bool, error_message: str)
    """
    if not isinstance(value, list):
        return (False, f"{field_name} must be a list")
    
    if len(value) < min_items:
        return (False, f"{field_name} must have at least {min_items} items")
    
    if max_items is not None and len(value) > max_items:
        return (False, f"{field_name} must have at most {max_items} items")
    
    return (True, "")


def sanitize_string(value: str) -> str:
    """
    Sanitize string input by removing potentially dangerous characters
    
    Args:
        value: String to sanitize
    
    Returns:
        Sanitized string
    """
    if not isinstance(value, str):
        return ""
    
    # Remove null bytes and control characters
    sanitized = value.replace('\x00', '').strip()
    
    # Limit length to prevent DoS
    return sanitized[:1000]


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

