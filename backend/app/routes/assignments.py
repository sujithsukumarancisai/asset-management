from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.assignment import Assignment
from app.models.asset import Asset
from app.models.employee import Employee
from app.models.asset_history import AssetHistory
from app.models.admin import Admin
from app.schemas import AssignmentCreate, AssignmentOut
from app.auth.dependencies import get_current_admin

router = APIRouter(prefix="/api/assignments", tags=["assignments"])


def _to_out(a: Assignment) -> AssignmentOut:
    return AssignmentOut(
        id=a.id,
        employee_id=a.employee_id,
        asset_id=a.asset_id,
        employee_name=a.employee.name,
        asset_name=a.asset.name,
        asset_code=a.asset.asset_code,
        assigned_date=a.assigned_date,
        returned_date=a.returned_date,
        status=a.status,
        notes=a.notes,
    )


@router.get("", response_model=List[AssignmentOut])
def list_assignments(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    _: Admin = Depends(get_current_admin),
):
    q = db.query(Assignment)
    if status_filter:
        q = q.filter(Assignment.status == status_filter)
    assignments = q.order_by(Assignment.id.desc()).all()
    return [_to_out(a) for a in assignments]


@router.post("", response_model=AssignmentOut)
def assign_asset(
    payload: AssignmentCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    employee = db.query(Employee).filter(Employee.id == payload.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    asset = db.query(Asset).filter(Asset.id == payload.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    if asset.status != "Available":
        raise HTTPException(
            status_code=400, detail=f"Asset is currently {asset.status}, not available"
        )

    assignment = Assignment(
        employee_id=employee.id,
        asset_id=asset.id,
        status="Active",
        notes=payload.notes,
    )
    db.add(assignment)

    asset.status = "Assigned"

    db.add(
        AssetHistory(
            asset_id=asset.id,
            employee_id=employee.id,
            action="Assigned",
            notes=f"Assigned to {employee.name} by {current_admin.username}",
        )
    )

    db.commit()
    db.refresh(assignment)
    return _to_out(assignment)


@router.post("/{assignment_id}/return", response_model=AssignmentOut)
def return_asset(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if assignment.status == "Returned":
        raise HTTPException(status_code=400, detail="Asset already returned")

    assignment.status = "Returned"
    assignment.returned_date = datetime.now(timezone.utc)

    asset = db.query(Asset).filter(Asset.id == assignment.asset_id).first()
    asset.status = "Available"

    db.add(
        AssetHistory(
            asset_id=asset.id,
            employee_id=assignment.employee_id,
            action="Returned",
            notes=f"Returned, processed by {current_admin.username}",
        )
    )

    db.commit()
    db.refresh(assignment)
    return _to_out(assignment)
