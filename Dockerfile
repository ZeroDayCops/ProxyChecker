FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . /app

# Expose default port (7860 for Hugging Face Spaces, 8000 for local/Render)
EXPOSE 7860

# Run FastAPI backend using uvicorn
CMD ["uvicorn", "backend_api.main:app", "--host", "0.0.0.0", "--port", "7860"]
