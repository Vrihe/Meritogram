from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
from .config import get_settings

settings = get_settings()
client = None
db = None


async def connect_db():
    """Connect to MongoDB"""
    global client, db
    try:
        client = MongoClient(settings.MONGO_URL, serverSelectionTimeoutMS=5000)
        # Test connection
        client.admin.command('ping')
        db = client[settings.MONGO_DB_NAME]
        print("✓ Connected to MongoDB successfully")
    except ServerSelectionTimeoutError as e:
        print(f"✗ Failed to connect to MongoDB: {e}")
        raise


async def close_db():
    """Close MongoDB connection"""
    global client
    if client:
        client.close()
        print("✓ Disconnected from MongoDB")


def get_db():
    """Get database instance"""
    global db
    if db is None:
        raise RuntimeError("Database not connected. Call connect_db() first.")
    return db
