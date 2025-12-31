from fastapi import FastAPI
from Routes.PublicRoute import route as PublicRoute
# CORS error fix
from fastapi.middleware.cors import CORSMiddleware
# Auth routes import
from Routes.AuthRoutes import router as AuthRouter

app = FastAPI()

# Middleware to handle CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(PublicRoute) 
app.include_router(AuthRouter)