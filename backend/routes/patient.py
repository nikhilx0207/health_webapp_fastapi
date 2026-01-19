from fastapi import APIRouter, Depends, HTTPException, status
from auth import get_current_user
from models import WellnessGoal, UserRole, DailyLog
from database import client
from datetime import datetime

router = APIRouter(prefix="/patient", tags=["patient"])
db = client.get_database("healthportal")
goals_collection = db["wellness_goals"]
daily_logs_collection = db["daily_logs"]

@router.get("/dashboard")
async def get_patient_dashboard(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.patient:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Fetch goals
    goal = await goals_collection.find_one({"email": current_user["email"]})
    
    # Fetch today's log if exists
    today = datetime.utcnow().date().isoformat()
    daily_log = await daily_logs_collection.find_one({
        "user_id": current_user["email"],
        "date": today
    })
    
    return {
        "user": current_user["full_name"],
        "goals": {
            "steps": daily_log["steps"] if daily_log else (goal["steps"] if goal else 0),
            "sleep_hours": goal["sleep_hours"] if goal else 0
        },
        "daily_log": {
            "steps": daily_log["steps"] if daily_log else 0,
            "water_intake_ml": daily_log["water_intake_ml"] if daily_log else 0
        } if daily_log else None,
        "reminders": [
            "Drink 8 glasses of water",
            "Take a 10 min walk",
            "Screening due next month"
        ]
    }

@router.post("/goals")
async def update_patient_goals(goal: WellnessGoal, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.patient:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await goals_collection.update_one(
        {"email": current_user["email"]},
        {"$set": goal.dict()},
        upsert=True
    )
    return {"message": "Goals updated successfully"}

@router.post("/daily-log")
async def log_daily_progress(log_data: DailyLog, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.patient:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Use current date if not provided
    today = datetime.utcnow().date().isoformat()
    
    log_entry = {
        "user_id": current_user["email"],
        "date": today,
        "steps": log_data.steps,
        "water_intake_ml": log_data.water_intake_ml
    }
    
    # Update or insert today's log
    await daily_logs_collection.update_one(
        {"user_id": current_user["email"], "date": today},
        {"$set": log_entry},
        upsert=True
    )
    
    return {"message": "Daily log saved successfully", "data": log_entry}
