from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class Database:
    client: AsyncIOMotorClient = None
    database = None

database = Database()

async def get_database():
    return database.database

async def connect_to_database():
    database.client = AsyncIOMotorClient(settings.MONGODB_URL)
    database.database = database.client[settings.DATABASE_NAME]

async def close_database_connection():
    if database.client:
        database.client.close()