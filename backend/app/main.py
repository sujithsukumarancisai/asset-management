import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.database import Base, engine
from app import models  # noqa: F401 - ensures all models are registered on Base
from app.routes import auth, employees, assets, assignments, reports, dashboard

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Company Asset Management API", version="1.0.0")

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(employees.router)
app.include_router(assets.router)
app.include_router(assignments.router)
app.include_router(reports.router)
app.include_router(dashboard.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
