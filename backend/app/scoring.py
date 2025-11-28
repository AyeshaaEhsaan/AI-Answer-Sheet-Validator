from sentence_transformers import SentenceTransformer
import numpy as np
import pandas as pd
import json
import re
import os
from sklearn.metrics.pairwise import cosine_similarity
from pathlib import Path
import PyPDF2
import docx

MODEL_NAME = 'paraphrase-MiniLM-L6-v2'
_model = None
_context_embeddings = None
_context_data = None


def _load_model():
    global _model
    if _model is None:
        _model = SentenceTransformer(MODEL_NAME)
    return _model


def extract_text_from_file(file_path):
    """Extract text from various file formats"""
    file_ext = Path(file_path).suffix.lower()
    
    if file_ext == '.txt':
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    
    elif file_ext == '.pdf':
        text = ""
        try:
            with open(file_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    text += page.extract_text() + "\n"
        except Exception as e:
            raise ValueError(f"Error reading PDF: {str(e)}")
        return text
    
    elif file_ext == '.docx':
        try:
            doc = docx.Document(file_path)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        except Exception as e:
            raise ValueError(f"Error reading DOCX: {str(e)}")
        return text
    
    else:
        raise ValueError(f"Unsupported file format: {file_ext}. Supported: .txt, .pdf, .docx")


def build_context_from_solved(path_to_file):
    """Build context from solved answer sheet (supports .txt, .pdf, .docx)"""
    global _context_embeddings, _context_data
    model = _load_model()
    
    # Extract text based on file type
    text = extract_text_from_file(path_to_file).strip()
    
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    questions = []
    
    for l in lines:
        if ':' in l:
            # Extract: "Q1 [5 marks]: answer text"
            match = re.match(r'(.+?)\s*\[(\d+)\s*marks?\]\s*:\s*(.+)', l)
            if match:
                q_name = match.group(1).strip()
                max_marks = int(match.group(2))
                answer = match.group(3).strip()
            else:
                # Fallback if no marks specified - default to 5
                q_name, answer = l.split(':', 1)
                q_name = q_name.strip()
                answer = answer.strip()
                max_marks = 5
            
            questions.append({
                'question': q_name,
                'answer': answer,
                'max_marks': max_marks
            })
    
    if not questions:
        raise ValueError("No questions found in the file. Make sure format is: 'Q1 [5 marks]: answer'")
    
    # Get embeddings for all answers
    texts = [q['answer'] for q in questions]
    emb = model.encode(texts, convert_to_numpy=True)
    
    _context_embeddings = emb
    _context_data = questions
    
    # Calculate total possible marks
    total_marks = sum(q['max_marks'] for q in questions)
    
    # Create uploads directory if it doesn't exist
    os.makedirs('backend/uploads', exist_ok=True)
    
    # Save context
    json.dump({
        'questions': questions,
        'total_marks': total_marks
    }, open('backend/uploads/context.json','w',encoding='utf-8'), indent=2)
    
    print(f"Context built: {len(questions)} questions, Total marks: {total_marks}")
    return {'questions': len(questions), 'total_marks': total_marks}


def read_student_answers(file_path):
    """Read student answers from CSV or Excel"""
    file_ext = Path(file_path).suffix.lower()
    
    try:
        if file_ext == '.csv':
            df = pd.read_csv(file_path)
        elif file_ext in ['.xlsx', '.xls']:
            df = pd.read_excel(file_path)
        else:
            raise ValueError(f"Unsupported format: {file_ext}. Supported: .csv, .xlsx, .xls")
        
        if df.empty:
            raise ValueError("File is empty")
        
        return df
    
    except Exception as e:
        raise ValueError(f"Error reading student file: {str(e)}")


def assign_ranks(results):
    """
    Assign ranks with proper handling of ties.
    Students with same score get same rank.
    Next rank skips accordingly (e.g., two students at rank 1, next is rank 3)
    """
    # Sort by total_score descending
    results_sorted = sorted(results, key=lambda x: x['total_score'], reverse=True)
    
    current_rank = 1
    for i, student in enumerate(results_sorted):
        if i > 0 and student['total_score'] < results_sorted[i-1]['total_score']:
            # Score is different from previous, update rank
            current_rank = i + 1
        student['rank'] = current_rank
    
    return results_sorted


def grade_students_from_csv(path_to_file, output_json):
    """Grade students from CSV or Excel file with proper ranking"""
    global _context_embeddings, _context_data
    model = _load_model()
    
    if _context_embeddings is None:
        # Load saved context
        if os.path.exists('backend/uploads/context.json'):
            c = json.load(open('backend/uploads/context.json',encoding='utf-8'))
            _context_data = c['questions']
            texts = [item['answer'] for item in _context_data]
            _context_embeddings = model.encode(texts, convert_to_numpy=True)
        else:
            raise RuntimeError('context not built. upload solved sheet first')
    
    # Read student answers (supports CSV and Excel)
    df = read_student_answers(path_to_file)
    total_possible_marks = sum(q['max_marks'] for q in _context_data)
    
    results = []
    for idx, row in df.iterrows():
        sid = row['student_id'] if 'student_id' in row else str(idx)
        total_score = 0.0
        per_q = []
        
        for i, q_data in enumerate(_context_data):
            q_name = q_data['question']
            max_marks = q_data['max_marks']
            
            # Get student answer
            ans = row.get(q_name, '') if q_name in row else row.get(f'Q{i+1}', '')
            if not isinstance(ans, str):
                ans = str(ans)
            
            # Skip if empty
            if not ans or ans.lower() in ['nan', 'none', '']:
                marks = 0
                sim = 0.0
            else:
                # Calculate similarity
                emb = model.encode([ans], convert_to_numpy=True)
                sim = cosine_similarity(emb, _context_embeddings[i:i+1])[0,0]
                
                # Award marks proportional to similarity and max_marks
                if sim >= 0.90:
                    marks = max_marks
                elif sim >= 0.80:
                    marks = max_marks * 0.9
                elif sim >= 0.70:
                    marks = max_marks * 0.7
                elif sim >= 0.60:
                    marks = max_marks * 0.5
                elif sim >= 0.50:
                    marks = max_marks * 0.3
                else:
                    marks = 0
            
            marks = round(marks, 1)
            total_score += marks
            
            per_q.append({
                'question': q_name,
                'max_marks': max_marks,
                'marks_obtained': marks,
                'similarity': round(float(sim), 3),
                'percentage': round((marks/max_marks)*100, 1) if max_marks > 0 else 0
            })
        
        results.append({
            'student_id': sid,
            'total_score': round(total_score, 1),
            'total_possible': total_possible_marks,
            'percentage': round((total_score/total_possible_marks)*100, 1) if total_possible_marks > 0 else 0,
            'per_question': per_q
        })
    
    # Assign ranks with proper tie handling
    results_ranked = assign_ranks(results)
    
    out = {
        'total_students': len(results_ranked),
        'total_marks': total_possible_marks,
        'results': results_ranked
    }
    
    open(output_json,'w',encoding='utf-8').write(json.dumps(out, indent=2))
    return out