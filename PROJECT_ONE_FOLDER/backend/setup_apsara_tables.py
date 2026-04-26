"""
Setup ApsaraDB MongoDB Collections and Indexes
Run this script to create all collections with proper indexes
"""
from pymongo import MongoClient, ASCENDING, DESCENDING
import os
import sys

def setup_database():
    """Create collections and indexes in ApsaraDB MongoDB"""
    
    # Get MongoDB URI from environment
    MONGODB_URI = os.environ.get('MONGODB_URI')
    
    if not MONGODB_URI:
        print("❌ Error: MONGODB_URI environment variable not set")
        print("\nSet it with:")
        print('export MONGODB_URI="mongodb://username:password@host:port/bill_splitter"')
        sys.exit(1)
    
    print("🔌 Connecting to ApsaraDB MongoDB...")
    try:
        client = MongoClient(MONGODB_URI)
        db = client['bill_splitter']
        
        # Test connection
        client.admin.command('ping')
        print("✅ Connected successfully!\n")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        sys.exit(1)
    
    # Collection 1: Users
    print("📋 Creating 'users' collection...")
    users = db['users']
    users.create_index([("user_id", ASCENDING)], unique=True)
    users.create_index([("phone", ASCENDING)])
    users.create_index([("email", ASCENDING)])
    print("✅ Users collection created with 3 indexes")
    
    # Collection 2: Receipts
    print("\n📋 Creating 'receipts' collection...")
    receipts = db['receipts']
    receipts.create_index([("receipt_id", ASCENDING)], unique=True)
    receipts.create_index([("user_id", ASCENDING)])
    receipts.create_index([("created_at", DESCENDING)])
    receipts.create_index([("status", ASCENDING)])
    print("✅ Receipts collection created with 4 indexes")
    
    # Collection 3: Split Sessions
    print("\n📋 Creating 'split_sessions' collection...")
    split_sessions = db['split_sessions']
    split_sessions.create_index([("session_id", ASCENDING)], unique=True)
    split_sessions.create_index([("receipt_id", ASCENDING)])
    split_sessions.create_index([("created_by", ASCENDING)])
    split_sessions.create_index([("participants.user_id", ASCENDING)])
    print("✅ Split Sessions collection created with 4 indexes")
    
    # Collection 4: Payment Requests
    print("\n📋 Creating 'payment_requests' collection...")
    payment_requests = db['payment_requests']
    payment_requests.create_index([("request_id", ASCENDING)], unique=True)
    payment_requests.create_index([("session_id", ASCENDING)])
    payment_requests.create_index([("from_user_id", ASCENDING)])
    payment_requests.create_index([("to_user_id", ASCENDING)])
    payment_requests.create_index([("status", ASCENDING)])
    payment_requests.create_index([("created_at", DESCENDING)])
    print("✅ Payment Requests collection created with 6 indexes")
    
    # Collection 5: Transaction History
    print("\n📋 Creating 'transaction_history' collection...")
    transaction_history = db['transaction_history']
    transaction_history.create_index([("transaction_id", ASCENDING)], unique=True)
    transaction_history.create_index([("user_id", ASCENDING)])
    transaction_history.create_index([("created_at", DESCENDING)])
    transaction_history.create_index([("type", ASCENDING)])
    transaction_history.create_index([("status", ASCENDING)])
    print("✅ Transaction History collection created with 5 indexes")
    
    # Summary
    print("\n" + "="*60)
    print("🎉 Database setup complete!")
    print("="*60)
    print("\n📊 Collections created:")
    print("  1. users (3 indexes)")
    print("  2. receipts (4 indexes)")
    print("  3. split_sessions (4 indexes)")
    print("  4. payment_requests (6 indexes)")
    print("  5. transaction_history (5 indexes)")
    print("\n✅ Total: 5 collections, 22 indexes")
    
    # List all collections
    print("\n📋 Verifying collections:")
    collections = db.list_collection_names()
    for coll in collections:
        indexes = db[coll].list_indexes()
        index_count = len(list(indexes))
        print(f"  ✓ {coll}: {index_count} indexes")
    
    client.close()
    print("\n✅ Setup complete! You can now run the migration script.")

if __name__ == "__main__":
    setup_database()

# Made with Bob
