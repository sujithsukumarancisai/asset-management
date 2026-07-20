from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.admin import Admin
from app.schemas import AdminOut, Token, AdminCreate
from app.auth.security import verify_password, create_access_token, hash_password
from app.auth.dependencies import get_current_admin, require_superadmin

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.username == form_data.username).first()
    if not admin or not verify_password(form_data.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    token = create_access_token({"sub": str(admin.id)})
    return Token(access_token=token, admin=AdminOut.model_validate(admin))


@router.get("/me", response_model=AdminOut)
def me(current_admin: Admin = Depends(get_current_admin)):
    return current_admin


@router.post("/register", response_model=AdminOut)
def register_admin(
    payload: AdminCreate,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_superadmin),
):
    """Only an existing superadmin can create new admin accounts."""
    if db.query(Admin).filter(Admin.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    admin = Admin(
        username=payload.username,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin
