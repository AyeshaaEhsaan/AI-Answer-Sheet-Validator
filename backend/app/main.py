
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, Response
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import json
from pathlib import Path
import time
from prometheus_client import Counter, Histogram
from app.scoring import build_context_from_solved, grade_students_from_csv

BASE_DIR = Path(__file__).resolve().parents[1]
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Initialize FastAPI
app = FastAPI(title="AI Answer Validator API")

# Add CORS middleware
origins = [
    "https://ai-answer-sheet-validator-final-att.vercel.app",  # Vercel frontend
    "http://localhost:3000"  # for local development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Explicit OPTIONS routes for CORS preflight
@app.options("/upload/solved")
async def options_solved():
    return Response(status_code=204, headers={
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Headers": "*"
    })

@app.options("/upload/students")
async def options_students():
    return Response(status_code=204, headers={
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Headers": "*"
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
    return JSONResponse({"message": "AI Answer Validator API", "status": "running"}, headers={"Access-Control-Allow-Origin": "*"})

@app.post('/upload/solved')
async def upload_solved(file: UploadFile = File(...)):
    dest = UPLOAD_DIR / 'solved_sheet.txt'
    content = await file.read()
    dest.write_bytes(content)
    build_context_from_solved(str(dest))
    return JSONResponse({'status':'ok', 'detail':'solved sheet uploaded and context built'}, headers={"Access-Control-Allow-Origin": "*"})

@app.post('/upload/students')
async def upload_students(file: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    dest = UPLOAD_DIR / 'student_answers.csv'
    content = await file.read()
    dest.write_bytes(content)
    if background_tasks:
        background_tasks.add_task(grade_students_from_csv, str(dest), str(UPLOAD_DIR / 'results.json'))
        return JSONResponse({'status':'ok', 'detail':'student file uploaded; grading started'}, headers={"Access-Control-Allow-Origin": "*"})
    else:
        grade_students_from_csv(str(dest), str(UPLOAD_DIR / 'results.json'))
        return JSONResponse({'status':'ok', 'detail':'graded synchronously'}, headers={"Access-Control-Allow-Origin": "*"})

@app.get('/results')
async def get_results():
    r = UPLOAD_DIR / 'results.json'
    if not r.exists():
        return JSONResponse({'status':'no_results'}, headers={"Access-Control-Allow-Origin": "*"})
    return JSONResponse(json.loads(r.read_text()), headers={"Access-Control-Allow-Origin": "*"})