from fastapi import FastAPI, UploadFile, File, BackgroundTasks, Response, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import json
from pathlib import Path
import time
from prometheus_client import Counter, Histogram
from app.scoring import build_context_from_solved, grade_students_from_csv
import os
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, EmailStr
from datetime import timedelta
from .auth import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from .database import get_user_by_email, create_user, init_database

BASE_DIR = Path(__file__).resolve().parents[1]
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

app = FastAPI(title="AI Answer Validator API")

# CORS settings
origins = [
    "https://ai-answer-sheet-validator-final-att.vercel.app",  # Vercel frontend
    "http://localhost:3000"  # local dev
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Explicit OPTIONS routes for preflight requests
@app.options("/upload/solved")
async def options_solved(request: Request):
    origin = request.headers.get("origin")
    return Response(status_code=204, headers={
        "Access-Control-Allow-Origin": origin if origin else "",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Credentials": "true"
    })

@app.options("/upload/students")
async def options_students(request: Request):
    origin = request.headers.get("origin")
    return Response(status_code=204, headers={
        "Access-Control-Allow-Origin": origin if origin else "",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Credentials": "true"
    })

# Monitoring metrics
REQUEST_COUNT = Counter('app_requests_total', 'Total requests')
REQUEST_LATENCY = Histogram('app_request_latency_seconds', 'Request latency')

@app.middleware("http")
async def monitor_requests(request, call_next):
    REQUEST_COUNT.inc()
    start = time.time()
    response = await call_next(request)
    REQUEST_LATENCY.observe(time.time() - start)
    return response

# API Endpoints
@app.get("/")
async def root():
    return JSONResponse({"message": "AI Answer Validator API", "status": "running"}, 
                        headers={"Access-Control-Allow-Origin": "*"})

@app.post('/upload/solved')
async def upload_solved(file: UploadFile = File(...)):
    dest = UPLOAD_DIR / 'solved_sheet.txt'
    content = await file.read()
    dest.write_bytes(content)
    build_context_from_solved(str(dest))
    return JSONResponse({'status':'ok', 'detail':'solved sheet uploaded and context built'}, 
                        headers={"Access-Control-Allow-Origin": "*"})

@app.post('/upload/students')
async def upload_students(file: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    dest = UPLOAD_DIR / 'student_answers.csv'
    content = await file.read()
    dest.write_bytes(content)
    if background_tasks:
        background_tasks.add_task(grade_students_from_csv, str(dest), str(UPLOAD_DIR / 'results.json'))
        return JSONResponse({'status':'ok', 'detail':'student file uploaded; grading started'}, 
                            headers={"Access-Control-Allow-Origin": "*"})
    else:
        grade_students_from_csv(str(dest), str(UPLOAD_DIR / 'results.json'))
        return JSONResponse({'status':'ok', 'detail':'graded synchronously'}, 
                            headers={"Access-Control-Allow-Origin": "*"})

@app.get('/results')
async def get_results():
    r = UPLOAD_DIR / 'results.json'
    if not r.exists():
        return JSONResponse({'status':'no_results'}, headers={"Access-Control-Allow-Origin": "*"})
    return JSONResponse(json.loads(r.read_text()), headers={"Access-Control-Allow-Origin": "*"})

# ============================================
# FILE 3: backend/app/main.py (UPDATE EXISTING)
# Add these imports and routes to your existing main.py
# ============================================

# Add these imports at the top of your existing main.py:
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from datetime import timedelta
from .auth import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from .database import get_user_by_email, create_user, init_database

# Initialize database on startup
init_database()

# Request/Response Models
class UserSignUp(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    email: str

# Add these routes to your existing FastAPI app:

@app.post("/auth/signup", response_model=Token)
async def signup(user: UserSignUp):
    """Register a new user"""
    # Validate input
    if len(user.username) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username must be at least 3 characters long"
        )
    
    if len(user.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long"
        )
    
    # Check if user already exists
    if get_user_by_email(user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password and create user
    hashed_password = get_password_hash(user.password)
    new_user = create_user(user.email, user.username, hashed_password)
    
    if not new_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username,
        "email": user.email
    }

@app.post("/auth/login", response_model=Token)
async def login(user: UserLogin):
    """Login an existing user"""
    # Get user from database
    db_user = get_user_by_email(user.email)
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": db_user["username"],
        "email": db_user["email"]
    }

@app.get("/auth/me")
async def get_current_user():
    """Get current user info (for testing)"""
    # This is a simple version - you'd normally verify the JWT token here
    return {"message": "User endpoint - add JWT verification for production"}



# Run server (local or Render)
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
