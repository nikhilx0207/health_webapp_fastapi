from fastapi import APIRouter, Depends, HTTPException, status, Request
from auth import get_current_user
from models import UserProfileUpdate, UserBase
from database import get_user_collection
from audit import log_audit

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/profile")
async def get_profile(request: Request, current_user: dict = Depends(get_current_user)):
    # Get client IP address
    client_ip = request.client.host if request.client else "unknown"
    
    # Log profile access
    await log_audit(current_user["email"], "profile_viewed", ip_address=client_ip)
    
    return {
        "full_name": current_user.get("full_name"),
        "email": current_user.get("email"),
        "role": current_user.get("role"),
        "allergies": current_user.get("allergies", []),
        "medications": current_user.get("medications", []),
        "license_no": current_user.get("license_no"),
        "data_usage_consent": current_user.get("data_usage_consent", False)
    }

@router.put("/profile")
async def update_profile(request: Request, profile_data: UserProfileUpdate, current_user: dict = Depends(get_current_user)):
    users_collection = get_user_collection()
    
    update_fields = {k: v for k, v in profile_data.dict().items() if v is not None}
    
    if not update_fields:
        return {"message": "No changes made"}
    
    # Get client IP address
    client_ip = request.client.host if request.client else "unknown"
    
    # Log profile update with details and IP
    await log_audit(
        current_user["email"], 
        "profile_updated", 
        ip_address=client_ip,
        details={"fields": list(update_fields.keys())}
    )
        
    await users_collection.update_one(
        {"email": current_user["email"]},
        {"$set": update_fields}
    )
    
    return {"message": "Profile updated successfully", "updated_fields": update_fields}
