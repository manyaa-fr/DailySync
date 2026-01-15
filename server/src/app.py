from fastapi import FastAPI
from Routes.PublicRoute import route as PublicRoute
# CORS error fix
from fastapi.middleware.cors import CORSMiddleware
from Routes.AuthRoutes import auth_router
from Routes.AuthRoutes import github_router

app = FastAPI()

# Middleware to handle CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(PublicRoute) 
app.include_router(auth_router)
app.include_router(github_router)