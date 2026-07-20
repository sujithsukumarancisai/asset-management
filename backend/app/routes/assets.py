from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.asset import Asset
from app.models.assignment import Assignment
from app.models.asset_history import AssetHistory
from app.models.admin import Admin
from app.schemas import AssetCreate, AssetUpdate, AssetOut
from app.auth.dependencies import get_current_admin

router = APIRouter(prefix="/api/assets", tags=["assets"])


def _with_assignee(db: Session, asset: Asset) -> AssetOut:
    out = AssetOut.model_validate(asset)
    if asset.status == "Assigned":
        active = (
            db.query(Assignment)
            .filter(Assignment.asset_id == asset.id, Assignment.status == "Active")
            .first()
        )
        if active:
            out.assigned_to = active.employee.name
    return out


@router.get("", response_model=List[AssetOut])
def list_assets(
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: Admin = Depends(get_current_admin),
):
    q = db.query(Asset)
    if search:
        like = f"%{search}%"
        q = q.filter(
            or_(
                Asset.name.ilike(like),
                Asset.asset_code.ilike(like),
                Asset.brand.ilike(like),
                Asset.serial_number.ilike(like),
            )
        )
    if status_filter:
        q = q.filter(Asset.status == status_filter)
    if category:
        q = q.filter(Asset.category == category)
    assets = q.order_by(Asset.id.desc()).all()
    return [_with_assignee(db, a) for a in assets]


@router.get("/{asset_id}", response_model=AssetOut)
def get_asset(
    asset_id: int, db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return _with_assignee(db, asset)


@router.post("", response_model=AssetOut)
def create_asset(
    payload: AssetCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    if db.query(Asset).filter(Asset.asset_code == payload.asset_code).first():
        raise HTTPException(status_code=400, detail="Asset ID already exists")
    asset = Asset(**payload.model_dump())
    db.add(asset)
    db.commit()
    db.refresh(asset)

    db.add(
        AssetHistory(
            asset_id=asset.id,
            action="Created",
            notes=f"Asset added by {current_admin.username}",
        )
    )
    db.commit()
    return _with_assignee(db, asset)


@router.put("/{asset_id}", response_model=AssetOut)
def update_asset(
    asset_id: int,
    payload: AssetUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    updates = payload.model_dump(exclude_unset=True)
    old_status = asset.status
    for field, value in updates.items():
        setattr(asset, field, value)
    db.commit()
    db.refresh(asset)

    if "status" in updates and updates["status"] != old_status:
        action_map = {
            "Available": "Marked Available",
            "Maintenance": "Sent to Maintenance",
            "Lost": "Marked Lost",
            "Assigned": "Assigned",
        }
        db.add(
            AssetHistory(
                asset_id=asset.id,
                action=action_map.get(updates["status"], "Status Changed"),
                notes=f"Updated by {current_admin.username}",
            )
        )
        db.commit()

    return _with_assignee(db, asset)


@router.delete("/{asset_id}")
def delete_asset(
    asset_id: int, db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    if asset.status == "Assigned":
        raise HTTPException(
            status_code=400, detail="Cannot delete an asset that is currently assigned"
        )
    db.delete(asset)
    db.commit()
    return {"message": "Asset deleted"}


@router.get("/{asset_id}/history")
def get_asset_history(
    asset_id: int, db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)
):
    history = (
        db.query(AssetHistory)
        .filter(AssetHistory.asset_id == asset_id)
        .order_by(AssetHistory.date.desc())
        .all()
    )
    return [
        {
            "id": h.id,
            "action": h.action,
            "notes": h.notes,
            "date": h.date,
            "employee_name": h.employee.name if h.employee else None,
        }
        for h in history
    ]
