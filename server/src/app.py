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

app = FastAPI()

# Middleware to handle CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

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