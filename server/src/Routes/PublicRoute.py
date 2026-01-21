from fastapi import APIRouter

route = APIRouter(prefix="/api/v1")

@route.get("/health")
def indexView():
    return {
        "msg" : "Server is running"
    }
