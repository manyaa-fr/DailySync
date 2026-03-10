from pydantic import BaseModel, EmailStr

class RegisterRequest(BaseModel):
    fullName: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str
    confirm_password: str