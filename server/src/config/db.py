import motor.motor_asyncio
import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env from src/.env
env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=env_path)

DB_NAME = os.getenv("DB_NAME")
MONGODB_URI = os.getenv("MONGODB_URI")

print("DB_NAME =", DB_NAME)
print("MONGODB_URI =", MONGODB_URI)

if not DB_NAME or not MONGODB_URI:
    raise RuntimeError("❌ Environment variables not loaded")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URI)
db = client[DB_NAME]