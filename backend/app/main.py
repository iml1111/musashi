from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api.v1.api import api_router
from app.core.database import get_database
from app.services.user import UserService
import os


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to database and initialize admin user
    try:
        from app.core.database import connect_to_database, close_database_connection

        # Connect to database
        await connect_to_database()
        print("✅ Database connection established")

        # Initialize admin user
        db = get_database()  # Now synchronous
        user_service = UserService(db)
        await user_service.init_admin_user()
        print("✅ Admin user initialization completed")
    except Exception as e:
        print(f"❌ Error during startup: {e}")

    yield

    # Shutdown: Close database connection
    try:
        await close_database_connection()
        print("🔄 Database connection closed")
    except Exception as e:
        print(f"❌ Error during shutdown: {e}")
    print("🔄 Application shutting down")


app = FastAPI(
    title="Musashi API",
    description="AI Agent Workflow Design Tool - Cut the code. Shape the flow.",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

# Mount static files (built frontend)
static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
if os.path.exists(static_dir):
    # Mount assets for Vite-built app
    assets_dir = os.path.join(static_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # Also keep /static mount for backward compatibility
    app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/")
async def root():
    # Check if frontend is available
    static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
    index_path = os.path.join(static_dir, "index.html")

    if os.path.exists(index_path):
        return FileResponse(index_path)
    else:
        return {"message": "Musashi API - Cut the code. Shape the flow.", "frontend": "not_built"}


# SPA route handler for non-API paths
# Note: This must be the LAST route defined to avoid interfering with API routes
@app.exception_handler(404)
async def not_found_handler(request, exc):
    # Only serve SPA for non-API and non-static routes
    if (
        request.url.path.startswith("/api/")
        or request.url.path.startswith("/assets/")
        or request.url.path.startswith("/static/")
    ):
        return JSONResponse(status_code=404, content={"detail": "Not Found"})

    # Serve frontend for all other 404s (SPA routing)
    static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    else:
        return JSONResponse(status_code=404, content={"message": "Frontend not built yet"})


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/api/v1/health")
async def api_health_check():
    return {"status": "healthy", "api": "v1"}
