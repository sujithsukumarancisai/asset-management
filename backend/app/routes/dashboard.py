from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.employee import Employee
from app.models.asset import Asset
from app.models.admin import Admin
from app.schemas import DashboardStats
from app.auth.dependencies import get_current_admin

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_stats(db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)):
    total_employees = db.query(Employee).count()
    total_assets = db.query(Asset).count()
    assigned = db.query(Asset).filter(Asset.status == "Assigned").count()
    available = db.query(Asset).filter(Asset.status == "Available").count()
    maintenance = db.query(Asset).filter(Asset.status == "Maintenance").count()
    lost = db.query(Asset).filter(Asset.status == "Lost").count()

    return DashboardStats(
        total_employees=total_employees,
        total_assets=total_assets,
        assigned=assigned,
        available=available,
        maintenance=maintenance,
        lost=lost,
    )
