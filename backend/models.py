from pydantic import BaseModel, EmailStr, Field, model_validator
from typing import Optional, List
from enum import Enum

class UserRole(str, Enum):
    patient = "patient"
    doctor = "doctor"

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = UserRole.patient
    license_no: Optional[str] = None
    allergies: List[str] = []
    medications: List[str] = []
    data_usage_consent: bool = False

class UserProfileUpdate(BaseModel):
    allergies: Optional[List[str]] = None
    medications: Optional[List[str]] = None

class UserCreate(UserBase):
    password: str

    @model_validator(mode='after')
    def check_doctor_license(self):
        if self.role == UserRole.doctor and not self.license_no:
            raise ValueError('License number is required for doctors')
        if self.role == UserRole.patient:
            self.license_no = None
        # Validate consent
        if not self.data_usage_consent:
            raise ValueError('Data usage consent is required to create an account')
        return self

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserInDB(UserBase):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class WellnessGoal(BaseModel):
    steps: int
    sleep_hours: float

class DailyLog(BaseModel):
    user_id: str
    date: str  # ISO format date string (YYYY-MM-DD)
    steps: int
    water_intake_ml: int

