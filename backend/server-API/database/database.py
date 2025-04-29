from pymongo.mongo_client import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

client =  MongoClient(MONGO_URI)

db = client.posts_db
posts_collection = db["posts_collection"]
