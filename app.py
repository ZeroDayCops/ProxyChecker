import uvicorn
from backend_api.main import app

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)
