import os
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import jwt
from jwt import ExpiredSignatureError, InvalidTokenError

JWT_SECRET = os.getenv("JWT_SECRET_KEY")

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request.state.user_id = None
        request.state.user_email = None

        token = request.cookies.get("access_token")

        if token:
            try:
                payload = jwt.decode(
                    token,
                    JWT_SECRET,
                    algorithms=["HS256"],
                )

                request.state.user_id = payload.get("sub")
                request.state.user_email = payload.get("email")

            except ExpiredSignatureError:
                return JSONResponse(
                    status_code=401,
                    content={"detail": "Session expired"},
                )
            except InvalidTokenError:
                return JSONResponse(
                    status_code=401,
                    content={"detail": "Invalid authentication token"},
                )

        response = await call_next(request)
        return response