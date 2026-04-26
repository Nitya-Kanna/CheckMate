"""
Seed script to populate DynamoDB tables with test data
Run: python backend/seed_data.py
"""
import boto3
from decimal import Decimal
from datetime import datetime, timedelta
from models import generate_id, get_current_timestamp

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-1')

# Table references
users_table = dynamodb.Table('BillSplitter-Users')
receipts_table = dynamodb.Table('BillSplitter-Receipts')
transaction_history_table = dynamodb.Table('BillSplitter-TransactionHistory')


def convert_floats_to_decimal(obj):
    """Recursively convert all floats in a dict/list to Decimal for DynamoDB"""
    if isinstance(obj, list):
        return [convert_floats_to_decimal(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: convert_floats_to_decimal(value) for key, value in obj.items()}
    elif isinstance(obj, float):
        return Decimal(str(obj))
    else:
        return obj


def seed_users():
    """Seed Users table with 5 test contacts"""
    print("Seeding Users table...")
    
    users = [
        {
            'user_id': 'user_001',
            'name': 'Zin Ahmad',
            'email': 'zin.ahmad@email.com',
            'phone': '+60123456789',
            'avatar': 'https://ui-avatars.com/api/?name=Zin+Ahmad&background=0066CC&color=fff',
            'is_favorite': True,
            'last_split': '2026-04-20',
            'total_splits': 15,
            'relationship': 'friend',
            'created_at': get_current_timestamp()
        },
        {
            'user_id': 'user_002',
            'name': 'Zin Tan',
            'email': 'zin.tan@email.com',
            'phone': '+60129876543',
            'avatar': 'https://ui-avatars.com/api/?name=Zin+Tan&background=FF6B9D&color=fff',
            'is_favorite': True,
            'last_split': '2026-04-22',
            'total_splits': 23,
            'relationship': 'friend',
            'created_at': get_current_timestamp()
        },
        {
            'user_id': 'user_003',
            'name': 'Lisa Wong',
            'email': 'lisa.wong@email.com',
            'phone': '+60187654321',
            'avatar': 'https://ui-avatars.com/api/?name=Lisa+Wong&background=4CAF50&color=fff',
            'is_favorite': False,
            'last_split': '2026-04-15',
            'total_splits': 8,
            'relationship': 'colleague',
            'created_at': get_current_timestamp()
        },
        {
            'user_id': 'user_004',
            'name': 'John Lee',
            'email': 'john.lee@email.com',
            'phone': '+60162345678',
            'avatar': 'https://ui-avatars.com/api/?name=John+Lee&background=9C27B0&color=fff',
            'is_favorite': True,
            'last_split': '2026-04-18',
            'total_splits': 12,
            'relationship': 'family',
            'created_at': get_current_timestamp()
        },
        {
            'user_id': 'user_005',
            'name': 'Sarah Chen',
            'email': 'sarah.chen@email.com',
            'phone': '+60198765432',
            'avatar': 'https://ui-avatars.com/api/?name=Sarah+Chen&background=FF9800&color=fff',
            'is_favorite': False,
            'last_split': '2026-04-10',
            'total_splits': 5,
            'relationship': 'friend',
            'created_at': get_current_timestamp()
        }
    ]
    
    for user in users:
        try:
            users_table.put_item(Item=user)
            print(f"✓ Added user: {user['name']}")
        except Exception as e:
            print(f"✗ Error adding {user['name']}: {str(e)}")
    
    print(f"Seeded {len(users)} users\n")


def seed_receipts():
    """Seed Receipts table with 4 test receipts"""
    print("Seeding Receipts table...")
    
    base_date = datetime.now()
    
    receipts = [
        {
            'receipt_id': 'rcpt_001',
            'user_id': 'user_123',
            'restaurant_name': 'RESTAURANT ABC',
            'date': (base_date - timedelta(days=0)).strftime("%Y-%m-%d"),
            'time': '15:30',
            'items': [
                {'name': 'Nasi Lemak', 'price': 12.00},
                {'name': 'Pizza (Large)', 'price': 35.00},
                {'name': 'Iced Tea x2', 'price': 8.00},
                {'name': 'Chicken Burger', 'price': 18.00},
                {'name': 'French Fries', 'price': 10.00},
                {'name': 'Mango Smoothie', 'price': 12.00}
            ],
            'subtotal': 95.00,
            'tax': 6.27,
            'service': 9.50,
            'total': 110.77,
            'items_count': 6,
            'status': 'ready_to_split',
            'thumbnail': 'https://via.placeholder.com/150',
            'created_at': (base_date - timedelta(days=0)).isoformat() + 'Z'
        },
        {
            'receipt_id': 'rcpt_002',
            'user_id': 'user_123',
            'restaurant_name': 'Cafe XYZ',
            'date': (base_date - timedelta(days=1)).strftime("%Y-%m-%d"),
            'time': '12:15',
            'items': [
                {'name': 'Cappuccino', 'price': 8.50},
                {'name': 'Croissant', 'price': 6.00},
                {'name': 'Caesar Salad', 'price': 15.00}
            ],
            'subtotal': 29.50,
            'tax': 1.95,
            'service': 2.95,
            'total': 34.40,
            'items_count': 3,
            'status': 'completed',
            'thumbnail': 'https://via.placeholder.com/150',
            'created_at': (base_date - timedelta(days=1)).isoformat() + 'Z'
        },
        {
            'receipt_id': 'rcpt_003',
            'user_id': 'user_123',
            'restaurant_name': 'Sushi House',
            'date': (base_date - timedelta(days=2)).strftime("%Y-%m-%d"),
            'time': '19:45',
            'items': [
                {'name': 'Salmon Sashimi', 'price': 28.00},
                {'name': 'California Roll', 'price': 18.00},
                {'name': 'Miso Soup', 'price': 5.00},
                {'name': 'Green Tea', 'price': 4.00}
            ],
            'subtotal': 55.00,
            'tax': 3.63,
            'service': 5.50,
            'total': 64.13,
            'items_count': 4,
            'status': 'ready_to_split',
            'thumbnail': 'https://via.placeholder.com/150',
            'created_at': (base_date - timedelta(days=2)).isoformat() + 'Z'
        },
        {
            'receipt_id': 'rcpt_004',
            'user_id': 'user_123',
            'restaurant_name': 'Burger Joint',
            'date': (base_date - timedelta(days=3)).strftime("%Y-%m-%d"),
            'time': '13:20',
            'items': [
                {'name': 'Classic Burger', 'price': 15.00},
                {'name': 'Cheese Fries', 'price': 8.00},
                {'name': 'Milkshake', 'price': 7.00}
            ],
            'subtotal': 30.00,
            'tax': 1.98,
            'service': 3.00,
            'total': 34.98,
            'items_count': 3,
            'status': 'completed',
            'thumbnail': 'https://via.placeholder.com/150',
            'created_at': (base_date - timedelta(days=3)).isoformat() + 'Z'
        }
    ]
    
    for receipt in receipts:
        try:
            receipt_decimal = convert_floats_to_decimal(receipt)
            receipts_table.put_item(Item=receipt_decimal)
            print(f"✓ Added receipt: {receipt['restaurant_name']}")
        except Exception as e:
            print(f"✗ Error adding {receipt['restaurant_name']}: {str(e)}")
    
    print(f"Seeded {len(receipts)} receipts\n")


def seed_transaction_history():
    """Seed TransactionHistory table with sample transactions"""
    print("Seeding TransactionHistory table...")
    
    base_date = datetime.now()
    user_id = 'user_123'
    
    transactions = [
        {
            'user_id': user_id,
            'timestamp': (base_date - timedelta(hours=2)).isoformat() + 'Z',
            'transaction_id': 'txn_001',
            'type': 'payment_request_sent',
            'description': 'Request to Zin Ahmad',
            'item_name': 'Nasi Lemak',
            'amount': 12.00,
            'status': 'pending',
            'related_payment_request_id': 'pr_001',
            'related_split_id': 'split_001',
            'created_at': (base_date - timedelta(hours=2)).isoformat() + 'Z'
        },
        {
            'user_id': user_id,
            'timestamp': (base_date - timedelta(hours=2, minutes=1)).isoformat() + 'Z',
            'transaction_id': 'txn_002',
            'type': 'payment_request_sent',
            'description': 'Request to Zin Tan',
            'item_name': 'Pizza (Large)',
            'amount': 35.00,
            'status': 'pending',
            'related_payment_request_id': 'pr_002',
            'related_split_id': 'split_001',
            'created_at': (base_date - timedelta(hours=2, minutes=1)).isoformat() + 'Z'
        },
        {
            'user_id': user_id,
            'timestamp': (base_date - timedelta(days=1, hours=5)).isoformat() + 'Z',
            'transaction_id': 'txn_003',
            'type': 'payment_received',
            'description': 'Received from Lisa Wong',
            'item_name': 'Cappuccino',
            'amount': 8.50,
            'status': 'completed',
            'related_payment_request_id': 'pr_003',
            'related_split_id': 'split_002',
            'created_at': (base_date - timedelta(days=1, hours=5)).isoformat() + 'Z'
        },
        {
            'user_id': user_id,
            'timestamp': (base_date - timedelta(days=2, hours=3)).isoformat() + 'Z',
            'transaction_id': 'txn_004',
            'type': 'payment_request_sent',
            'description': 'Request to John Lee',
            'item_name': 'Salmon Sashimi',
            'amount': 28.00,
            'status': 'completed',
            'related_payment_request_id': 'pr_004',
            'related_split_id': 'split_003',
            'created_at': (base_date - timedelta(days=2, hours=3)).isoformat() + 'Z'
        },
        {
            'user_id': user_id,
            'timestamp': (base_date - timedelta(days=3, hours=7)).isoformat() + 'Z',
            'transaction_id': 'txn_005',
            'type': 'payment_request_received',
            'description': 'Request from Sarah Chen',
            'item_name': 'Classic Burger',
            'amount': 15.00,
            'status': 'pending',
            'related_payment_request_id': 'pr_005',
            'related_split_id': 'split_004',
            'created_at': (base_date - timedelta(days=3, hours=7)).isoformat() + 'Z'
        },
        {
            'user_id': user_id,
            'timestamp': (base_date - timedelta(days=5, hours=12)).isoformat() + 'Z',
            'transaction_id': 'txn_006',
            'type': 'payment_made',
            'description': 'Paid to Zin Ahmad',
            'item_name': 'Miso Soup',
            'amount': 5.00,
            'status': 'completed',
            'related_payment_request_id': 'pr_006',
            'related_split_id': 'split_005',
            'created_at': (base_date - timedelta(days=5, hours=12)).isoformat() + 'Z'
        }
    ]
    
    for transaction in transactions:
        try:
            transaction_decimal = convert_floats_to_decimal(transaction)
            transaction_history_table.put_item(Item=transaction_decimal)
            print(f"✓ Added transaction: {transaction['description']}")
        except Exception as e:
            print(f"✗ Error adding transaction: {str(e)}")
    
    print(f"Seeded {len(transactions)} transactions\n")


def main():
    """Run all seed functions"""
    print("=" * 60)
    print("SEEDING DYNAMODB TABLES")
    print("=" * 60)
    print()
    
    try:
        seed_users()
        seed_receipts()
        seed_transaction_history()
        
        print("=" * 60)
        print("✅ SEEDING COMPLETE!")
        print("=" * 60)
        print()
        print("Summary:")
        print("- 5 users added to BillSplitter-Users")
        print("- 4 receipts added to BillSplitter-Receipts")
        print("- 6 transactions added to BillSplitter-TransactionHistory")
        print()
        print("You can now test your Lambda functions with real data!")
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {str(e)}")
        print("Make sure:")
        print("1. AWS credentials are configured")
        print("2. DynamoDB tables exist")
        print("3. You have write permissions")


if __name__ == '__main__':
    main()

# Made with Bob
