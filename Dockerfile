FROM python:3.11-slim

WORKDIR /app

# Copy all files to workdir
COPY . /app/

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Default port exposure
EXPOSE 8000

# Run FastAPI backend using uvicorn with dynamic $PORT support for Render
CMD exec uvicorn backend_api.main:app --host 0.0.0.0 --port ${PORT:-8000}
