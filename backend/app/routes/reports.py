from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.admin import Admin
from app.auth.dependencies import get_current_admin
from app.services.report_service import generate_excel, generate_pdf, REPORT_TITLES

router = APIRouter(prefix="/api/reports", tags=["reports"])

VALID_TYPES = set(REPORT_TITLES.keys())


@router.get("/{report_type}/excel")
def export_excel(
    report_type: str, db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)
):
    if report_type not in VALID_TYPES:
        raise HTTPException(status_code=404, detail="Unknown report type")
    buf = generate_excel(report_type, db)
    filename = f"{report_type}_report.xlsx"
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/{report_type}/pdf")
def export_pdf(
    report_type: str, db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)
):
    if report_type not in VALID_TYPES:
        raise HTTPException(status_code=404, detail="Unknown report type")
    buf = generate_pdf(report_type, db)
    filename = f"{report_type}_report.pdf"
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("")
def list_report_types(_: Admin = Depends(get_current_admin)):
    return [{"key": k, "label": v} for k, v in REPORT_TITLES.items()]
