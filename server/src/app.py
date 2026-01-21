import os
from fastapi import FastAPI
from Routes.PublicRoute import route as PublicRoute
# CORS error fix
from fastapi.middleware.cors import CORSMiddleware
from Routes.AuthRoutes import auth_router
from Routes.AuthRoutes import github_router
from middleware.AuthMiddleware import AuthMiddleware
from Routes.Dashboard import router as get_dashboard
from Routes.Github import router as manual_github_sync
from Routes.TimeRoutes import router as time_router

app = FastAPI()

# Middleware to handle CORS
# We merge env vars with hardcoded production domains to ensure it works out of the box
env_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
allowed_origins = list(set(env_origins.split(",") + [
    "https://daily-sync-one.vercel.app",
    "https://daily-sync-one.vercel.app/"
]))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(AuthMiddleware)

app.include_router(PublicRoute) 
app.include_router(auth_router)
app.include_router(github_router)
app.include_router(get_dashboard)
app.include_router(manual_github_sync)
app.include_router(time_router)
