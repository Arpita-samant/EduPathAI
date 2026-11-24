from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.seed_data import seed_database
from app.routers import (
    auth_router,
    profile_router,
    careers_router,
    assessment_router,
    roadmap_router,
    jobs_router,
    skill_gap_router,
    ats_router,
    resources_router,
    dashboard_router
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema
    Base.metadata.create_all(bind=engine)
    # Seed initial data
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# Enable CORS for local Vite dev and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth_router.router, prefix=settings.API_V1_STR)
app.include_router(profile_router.router, prefix=settings.API_V1_STR)
app.include_router(careers_router.router, prefix=settings.API_V1_STR)
app.include_router(assessment_router.router, prefix=settings.API_V1_STR)
app.include_router(roadmap_router.router, prefix=settings.API_V1_STR)
app.include_router(jobs_router.router, prefix=settings.API_V1_STR)
app.include_router(skill_gap_router.router, prefix=settings.API_V1_STR)
app.include_router(ats_router.router, prefix=settings.API_V1_STR)
app.include_router(resources_router.router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health():
    return {"status": "healthy", "service": "edupath-ai-backend"}
