from datetime import datetime
from database import client

db = client.get_database("healthportal")
audit_logs_collection = db["audit_logs"]

async def log_audit(user_id: str, action: str, ip_address: str = None, details: dict = None):
    """
    Log an audit event to the audit_logs collection.
    
    Args:
        user_id: The user's email or ID
        action: Description of the action (e.g., "profile_viewed", "profile_updated")
        ip_address: The IP address of the request
        details: Optional dictionary with additional context
    """
    audit_entry = {
        "user_id": user_id,
        "action": action,
        "timestamp": datetime.utcnow(),
        "ip_address": ip_address,
        "details": details or {}
    }
    await audit_logs_collection.insert_one(audit_entry)

