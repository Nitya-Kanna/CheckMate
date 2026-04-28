"""
DynamoDB repository - handles all database operations
"""
import boto3
import logging
from boto3.dynamodb.conditions import Key, Attr
from typing import List, Dict, Any, Optional
from models import Receipt, User, Transaction, generate_id, get_current_timestamp
from config import config

# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name=config.AWS_REGION)

logger.info(f"DynamoDB client initialized for region: {config.AWS_REGION}")

# Table references from config
users_table = dynamodb.Table(config.DYNAMODB_USERS_TABLE)
receipts_table = dynamodb.Table(config.DYNAMODB_RECEIPTS_TABLE)
split_sessions_table = dynamodb.Table(config.DYNAMODB_SPLIT_SESSIONS_TABLE)
payment_requests_table = dynamodb.Table(config.DYNAMODB_PAYMENT_REQUESTS_TABLE)
transaction_history_table = dynamodb.Table(config.DYNAMODB_TRANSACTION_HISTORY_TABLE)

logger.info(f"DynamoDB tables configured: Users={config.DYNAMODB_USERS_TABLE}, Receipts={config.DYNAMODB_RECEIPTS_TABLE}")


# ============================================================================
# RECEIPTS
# ============================================================================

def get_receipts_by_user(user_id: str, status: Optional[str] = None, limit: int = 20, offset: int = 0) -> List[Receipt]:
    """
    Get all receipts for a user, optionally filtered by status
    
    Args:
        user_id: User ID
        status: Optional status filter (ready_to_split, completed, etc.)
        limit: Maximum number of receipts to return
        offset: Pagination offset (note: DynamoDB doesn't support offset directly)
    
    Returns:
        List of receipt dictionaries
    """
    try:
        # Query using GSI: user_id-status-index
        if status:
            response = receipts_table.query(
                IndexName='user_id-status-index',
                KeyConditionExpression=Key('user_id').eq(user_id) & Key('status').eq(status),
                Limit=limit + offset  # Fetch more to handle offset
            )
        else:
            # Scan for all receipts by user (less efficient, but works)
            response = receipts_table.scan(
                FilterExpression=Attr('user_id').eq(user_id),
                Limit=limit + offset
            )
        
        items = response.get('Items', [])
        
        # Manual offset handling (not ideal for large datasets)
        return items[offset:offset + limit]
    
    except Exception as e:
        logger.error(f"Error getting receipts for user {user_id}: {str(e)}", exc_info=True)
        raise


def get_receipt_by_id(receipt_id: str, user_id: str) -> Optional[Receipt]:
    """
    Get a specific receipt by ID
    
    Args:
        receipt_id: Receipt ID
        user_id: User ID (part of composite key)
    
    Returns:
        Receipt dictionary or None if not found
    """
    try:
        response = receipts_table.get_item(
            Key={
                'receipt_id': receipt_id,
                'user_id': user_id
            }
        )
        return response.get('Item')
    
    except Exception as e:
        logger.error(f"Error getting receipt {receipt_id} for user {user_id}: {str(e)}", exc_info=True)
        raise


def create_receipt(receipt_data: Receipt) -> bool:
    """
    Create a new receipt
    
    Args:
        receipt_data: Receipt dictionary
    
    Returns:
        True if successful, False otherwise
    """
    try:
        receipts_table.put_item(Item=receipt_data)
        logger.info(f"Created receipt {receipt_data.get('receipt_id')}")
        return True
    except Exception as e:
        logger.error(f"Error creating receipt: {str(e)}", exc_info=True)
        raise


# ============================================================================
# USERS / CONTACTS
# ============================================================================

def get_all_users(limit: int = 50) -> List[User]:
    """
    Get all users (contacts)
    
    Args:
        limit: Maximum number of users to return
    
    Returns:
        List of user dictionaries
    """
    try:
        response = users_table.scan(Limit=limit)
        return response.get('Items', [])
    except Exception as e:
        logger.error(f"Error getting users: {str(e)}", exc_info=True)
        raise


def search_users(search_query: str, limit: int = 10) -> List[User]:
    """
    Search users by name, email, or phone
    
    Args:
        search_query: Search string
        limit: Maximum number of results
    
    Returns:
        List of matching user dictionaries
    """
    try:
        # DynamoDB doesn't support full-text search, so we scan and filter
        logger.info(f"Searching users with query: {search_query}")
        response = users_table.scan(
            FilterExpression=Attr('name').contains(search_query) |
                           Attr('email').contains(search_query) |
                           Attr('phone').contains(search_query),
            Limit=limit
        )
        return response.get('Items', [])
    except Exception as e:
        logger.error(f"Error searching users: {str(e)}", exc_info=True)
        raise


def get_user_by_id(user_id: str) -> Optional[User]:
    """
    Get a specific user by ID
    
    Args:
        user_id: User ID
    
    Returns:
        User dictionary or None if not found
    """
    try:
        response = users_table.get_item(Key={'user_id': user_id})
        return response.get('Item')
    except Exception as e:
        logger.error(f"Error getting user {user_id}: {str(e)}", exc_info=True)
        raise


def create_user(user_data: User) -> bool:
    """
    Create a new user
    
    Args:
        user_data: User dictionary
    
    Returns:
        True if successful, False otherwise
    """
    try:
        users_table.put_item(Item=user_data)
        logger.info(f"Created user {user_data.get('user_id')}")
        return True
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}", exc_info=True)
        raise


# ============================================================================
# TRANSACTION HISTORY
# ============================================================================

def get_transaction_history(user_id: str, limit: int = 50) -> List[Transaction]:
    """
    Get transaction history for a user
    
    Args:
        user_id: User ID
        limit: Maximum number of transactions to return
    
    Returns:
        List of transaction dictionaries, sorted by timestamp (newest first)
    """
    try:
        response = transaction_history_table.query(
            KeyConditionExpression=Key('user_id').eq(user_id),
            ScanIndexForward=False,  # Sort descending (newest first)
            Limit=limit
        )
        return response.get('Items', [])
    except Exception as e:
        logger.error(f"Error getting transaction history for user {user_id}: {str(e)}", exc_info=True)
        raise


def create_transaction(transaction_data: Transaction) -> bool:
    """
    Create a new transaction history entry
    
    Args:
        transaction_data: Transaction dictionary
    
    Returns:
        True if successful, False otherwise
    """
    try:
        transaction_history_table.put_item(Item=transaction_data)
        logger.info(f"Created transaction {transaction_data.get('transaction_id')}")
        return True
    except Exception as e:
        logger.error(f"Error creating transaction: {str(e)}", exc_info=True)
        raise


# ============================================================================
# PAYMENT REQUESTS
# ============================================================================

def get_payment_requests_by_split(split_id: str) -> List[Dict[str, Any]]:
    """
    Get all payment requests for a split session
    
    Args:
        split_id: Split session ID
    
    Returns:
        List of payment request dictionaries
    """
    try:
        response = payment_requests_table.query(
            IndexName='split_id-index',
            KeyConditionExpression=Key('split_id').eq(split_id)
        )
        return response.get('Items', [])
    except Exception as e:
        logger.error(f"Error getting payment requests for split {split_id}: {str(e)}", exc_info=True)
        raise


def create_payment_request(payment_data: Dict[str, Any]) -> bool:
    """
    Create a new payment request
    
    Args:
        payment_data: Payment request dictionary
    
    Returns:
        True if successful, False otherwise
    """
    try:
        payment_requests_table.put_item(Item=payment_data)
        logger.info(f"Created payment request {payment_data.get('request_id')}")
        return True
    except Exception as e:
        logger.error(f"Error creating payment request: {str(e)}", exc_info=True)
        raise

# Made with Bob
