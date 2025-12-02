from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import json
from pathlib import Path
import time
from prometheus_client import Counter, Histogram
import sentry_sdk

# Initialize Sentry (get real DSN from sentry.io)
# sentry_sdk.init(
#     dsn="https://your-real-dsn@sentry.io/project-id",
#     traces_sample_rate=1.0,
# )

from app.scoring import build_context_from_solved, grade_students_from_csv

# Setup paths
BASE_DIR = Path(__file__).resolve().parents[1]
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Initialize FastAPI
app = FastAPI(title="AI Answer Validator API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    return {"message": "AI Answer Validator API", "status": "running"}

@app.post('/upload/solved')
async def upload_solved(file: UploadFile = File(...)):
    dest = UPLOAD_DIR / 'solved_sheet.txt'
    content = await file.read()
    dest.write_bytes(content)
    build_context_from_solved(str(dest))
    return JSONResponse({'status':'ok', 'detail':'solved sheet uploaded and context built'})

@app.post('/upload/students')
async def upload_students(file: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    dest = UPLOAD_DIR / 'student_answers.csv'
    content = await file.read()
    dest.write_bytes(content)
    if background_tasks:
        background_tasks.add_task(grade_students_from_csv, str(dest), str(UPLOAD_DIR / 'results.json'))
        return JSONResponse({'status':'ok', 'detail':'student file uploaded; grading started'})
    else:
        grade_students_from_csv(str(dest), str(UPLOAD_DIR / 'results.json'))
        return JSONResponse({'status':'ok', 'detail':'graded synchronously'})

@app.get('/results')
async def get_results():
    r = UPLOAD_DIR / 'results.json'
    if not r.exists():
        return JSONResponse({'status':'no_results'})
    return JSONResponse(json.loads(r.read_text()))
```

---

## 3. Update requirements.txt

Add monitoring packages:
```
fastapi
uvicorn[standard]
sentence-transformers
pandas
scikit-learn
python-multipart
PyPDF2
openpyxl
python-docx
Pillow
pytest
httpx
prometheus-client
sentry-sdk[fastapi]