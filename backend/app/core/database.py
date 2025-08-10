from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

# Global database instance
client = None
database = None

def get_database():
    """Get database instance for dependency injection"""
    global client, database
    if database is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        database = client[settings.DATABASE_NAME]
    return database

async def connect_to_database():
    """Initialize database connection"""
    global client, database
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    database = client[settings.DATABASE_NAME]

async def close_database_connection():
    """Close database connection"""
    global client
    if client:
        client.close()