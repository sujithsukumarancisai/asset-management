from sqlalchemy import Column, Integer, ForeignKey, DateTime, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    assigned_date = Column(DateTime(timezone=True), server_default=func.now())
    returned_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(20), default="Active")  # Active | Returned
    notes = Column(String(255), nullable=True)

    employee = relationship("Employee", back_populates="assignments")
    asset = relationship("Asset", back_populates="assignments")
