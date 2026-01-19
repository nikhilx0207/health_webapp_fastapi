from fastapi import FastAPI, Request
from dotenv import load_dotenv
import os
from database import client
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from routes.patient import router as patient_router
from routes.doctor import router as doctor_router
from routes.users import router as users_router

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://your-frontend-name.onrender.com"  # Replace with your actual Render frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Incoming request: {request.method} {request.url}")
    print(f"Headers: {request.headers.get('authorization')}")
    response = await call_next(request)
    return response

app.include_router(patient_router)
app.include_router(doctor_router)
app.include_router(users_router)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"Validation Error: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
    )

@app.on_event("startup")
async def startup_db_client():
    try:
        await client.admin.command('ping')
        print("Successfully connected to MongoDB!")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Health Portal API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

from fastapi import HTTPException, status
from models import UserCreate, UserLogin, Token, UserInDB
from auth import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from database import get_user_collection
from datetime import timedelta

@app.post("/register", response_model=Token)
async def register(user: UserCreate):
    users_collection = get_user_collection()
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user.password)
    user_in_db = UserInDB(**user.dict(), hashed_password=hashed_password)
    
    await users_collection.insert_one(user_in_db.dict())
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/login", response_model=Token)
async def login(user: UserLogin):
    print(f"DEBUG: Login Request Body: {user.dict()}")
    users_collection = get_user_collection()
    user_record = await users_collection.find_one({"email": user.email})
    if user_record:
         print(f"DEBUG: Found user: {user_record['email']}")
         # print(f"DEBUG: Hashed Pwd in DB: {user_record['hashed_password']}") # Be careful logging hashes
    else:
         print("DEBUG: User not found")

    if not user_record or not verify_password(user.password, user_record["hashed_password"]):
        print("DEBUG: Password verification failed")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user_record["role"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
