FROM python:3.11-slim

# Set environment variables to reduce memory
ENV PYTHONUNBUFFERED=1
ENV TRANSFORMERS_CACHE=/tmp/transformers_cache
ENV HF_HOME=/tmp/huggingface

WORKDIR /app

# Copy requirements first (for caching)
COPY requirements.txt .

# Install dependencies with memory optimization
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . /app

# Expose port
EXPOSE 8000

# Run with reduced workers to save memory
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]