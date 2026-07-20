from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.employee import Employee
from app.models.assignment import Assignment
from app.models.admin import Admin
from app.schemas import EmployeeCreate, EmployeeUpdate, EmployeeOut, AssignmentOut
from app.auth.dependencies import get_current_admin

router = APIRouter(prefix="/api/employees", tags=["employees"])


def _with_asset_count(db: Session, employee: Employee) -> EmployeeOut:
    count = (
        db.query(Assignment)
        .filter(Assignment.employee_id == employee.id, Assignment.status == "Active")
        .count()
    )
    out = EmployeeOut.model_validate(employee)
    out.assets_assigned = count
    return out


@router.get("", response_model=List[EmployeeOut])
def list_employees(
    search: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: Admin = Depends(get_current_admin),
):
    q = db.query(Employee)
    if search:
        like = f"%{search}%"
        q = q.filter(
            or_(
                Employee.name.ilike(like),
                Employee.emp_code.ilike(like),
                Employee.email.ilike(like),
            )
        )
    if department:
        q = q.filter(Employee.department == department)
    employees = q.order_by(Employee.id.desc()).all()
    return [_with_asset_count(db, e) for e in employees]


@router.get("/{employee_id}", response_model=EmployeeOut)
def get_employee(
    employee_id: int, db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return _with_asset_count(db, employee)


@router.get("/{employee_id}/assignments", response_model=List[AssignmentOut])
def get_employee_assignments(
    employee_id: int, db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)
):
    assignments = (
        db.query(Assignment).filter(Assignment.employee_id == employee_id).all()
    )
    return [
        AssignmentOut(
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
        for a in assignments
    ]


@router.post("", response_model=EmployeeOut)
def create_employee(
    payload: EmployeeCreate,
    db: Session = Depends(get_db),
    _: Admin = Depends(get_current_admin),
):
    if db.query(Employee).filter(Employee.emp_code == payload.emp_code).first():
        raise HTTPException(status_code=400, detail="Employee ID already exists")
    employee = Employee(**payload.model_dump())
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return _with_asset_count(db, employee)


@router.put("/{employee_id}", response_model=EmployeeOut)
def update_employee(
    employee_id: int,
    payload: EmployeeUpdate,
    db: Session = Depends(get_db),
    _: Admin = Depends(get_current_admin),
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(employee, field, value)
    db.commit()
    db.refresh(employee)
    return _with_asset_count(db, employee)


@router.delete("/{employee_id}")
def delete_employee(
    employee_id: int, db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    active = (
        db.query(Assignment)
        .filter(Assignment.employee_id == employee_id, Assignment.status == "Active")
        .count()
    )
    if active > 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete employee with active asset assignments",
        )
    db.delete(employee)
    db.commit()
    return {"message": "Employee deleted"}
