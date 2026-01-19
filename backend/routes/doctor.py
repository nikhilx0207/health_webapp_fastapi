from fastapi import APIRouter, Depends, HTTPException, status
from auth import get_current_user
from models import UserRole
from database import client, get_user_collection
from datetime import datetime

router = APIRouter(prefix="/doctor", tags=["doctor"])
db = client.get_database("healthportal")
goals_collection = db["wellness_goals"]
daily_logs_collection = db["daily_logs"]

@router.get("/patients")
async def get_patients(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.doctor:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    users_collection = get_user_collection()
    patients_cursor = users_collection.find({"role": UserRole.patient})
    patients_list = await patients_cursor.to_list(length=100)
    
    today = datetime.utcnow().date().isoformat()
    result = []
    
    for patient in patients_list:
        # Fetch today's daily log for compliance
        daily_log = await daily_logs_collection.find_one({
            "user_id": patient["email"],
            "date": today
        })
        
        steps = daily_log["steps"] if daily_log else 0
        compliance = "Goal Met" if steps >= 5000 else "Missed Preventive Checkup"
        
        result.append({
            "name": patient.get("full_name", "Unknown"),
            "email": patient["email"],
            "latest_wellness_goal_status": f"{steps} steps today",
            "compliance_status": compliance
        })
        
    return result

@router.get("/patient/{patient_email}")
async def get_patient_detail(patient_email: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.doctor:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    users_collection = get_user_collection()
    patient = await users_collection.find_one({"email": patient_email})
    
    if not patient or patient.get("role") != UserRole.patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Fetch recent daily logs (last 7 days)
    recent_logs_cursor = daily_logs_collection.find(
        {"user_id": patient_email}
    ).sort("date", -1).limit(7)
    recent_logs = await recent_logs_cursor.to_list(length=7)
    
    # Fetch current goals
    goal = await goals_collection.find_one({"email": patient_email})
    
    return {
        "name": patient.get("full_name", "Unknown"),
        "email": patient["email"],
        "allergies": patient.get("allergies", []),
        "medications": patient.get("medications", []),
        "recent_logs": recent_logs,
        "current_goals": {
            "steps": goal["steps"] if goal else 0,
            "sleep_hours": goal["sleep_hours"] if goal else 0
        } if goal else None
    }
