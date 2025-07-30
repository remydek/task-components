from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Task Models
class Task(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str
    x: float = 100
    y: float = 100
    width: float = 350
    height: float = 200
    priority: str = "LOW"  # LOW or HIGH
    color: str = "red"  # red, teal, blue, green, yellow, pink, lightblue, purple
    date: Optional[str] = None
    completed: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TaskCreate(BaseModel):
    text: str
    x: float = 100
    y: float = 100
    priority: str = "LOW"
    color: str = "red"
    date: Optional[str] = None

class TaskUpdate(BaseModel):
    text: Optional[str] = None
    x: Optional[float] = None
    y: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    priority: Optional[str] = None
    color: Optional[str] = None
    date: Optional[str] = None
    completed: Optional[bool] = None


# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "CHAOS - The Anti-Task Manager API"}

@api_router.post("/tasks", response_model=Task)
async def create_task(task: TaskCreate):
    task_dict = task.dict()
    task_obj = Task(**task_dict)
    await db.tasks.insert_one(task_obj.dict())
    return task_obj

@api_router.get("/tasks", response_model=List[Task])
async def get_tasks():
    tasks = await db.tasks.find({"completed": False}).sort("created_at", -1).to_list(1000)
    return [Task(**task) for task in tasks]

@api_router.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, task_update: TaskUpdate):
    update_data = {k: v for k, v in task_update.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    result = await db.tasks.update_one(
        {"id": task_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    updated_task = await db.tasks.find_one({"id": task_id})
    return Task(**updated_task)

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    result = await db.tasks.delete_one({"id": task_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {"message": "Task deleted successfully"}

@api_router.post("/tasks/{task_id}/complete")
async def complete_task(task_id: str):
    result = await db.tasks.update_one(
        {"id": task_id},
        {"$set": {"completed": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {"message": "Task completed successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()