from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import json
from pathlib import Path
from app.scoring import build_context_from_solved, grade_students_from_csv

BASE_DIR = Path(__file__).resolve().parents[1]
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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