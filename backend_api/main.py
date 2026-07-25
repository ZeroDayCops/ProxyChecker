from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend_api.routes import upload, sessions, control, export, history
from backend_api.ws import live

app = FastAPI(title="ZeroDayCops ProxyChecker Backend API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(sessions.router)
app.include_router(control.router)
app.include_router(export.router)
app.include_router(history.router)
app.include_router(live.router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "ProxyChecker API"}
