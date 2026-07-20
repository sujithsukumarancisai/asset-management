"""
Run once to create the first superadmin account:

    cd backend
    python seed.py

Then log in with the username/password printed below (change it immediately
via the Settings page or the /api/auth/register endpoint).
"""
from app.database import Base, engine, SessionLocal
from app import models  # noqa: F401
from app.models.admin import Admin
from app.auth.security import hash_password

Base.metadata.create_all(bind=engine)

db = SessionLocal()

DEFAULT_USERNAME = "admin"
DEFAULT_EMAIL = "admin@company.com"
DEFAULT_PASSWORD = "ChangeMe123!"

existing = db.query(Admin).filter(Admin.username == DEFAULT_USERNAME).first()
if existing:
    print(f"Admin '{DEFAULT_USERNAME}' already exists. Nothing to do.")
else:
    admin = Admin(
        username=DEFAULT_USERNAME,
        email=DEFAULT_EMAIL,
        hashed_password=hash_password(DEFAULT_PASSWORD),
        role="superadmin",
    )
    db.add(admin)
    db.commit()
    print("Created superadmin account:")
    print(f"  username: {DEFAULT_USERNAME}")
    print(f"  password: {DEFAULT_PASSWORD}")
    print("Change this password after first login.")

db.close()
