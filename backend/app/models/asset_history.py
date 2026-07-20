from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class AssetHistory(Base):
    __tablename__ = "asset_history"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    action = Column(String(30), nullable=False)
    # Assigned | Returned | Sent to Maintenance | Marked Available | Marked Lost | Created
    notes = Column(String(255), nullable=True)
    date = Column(DateTime(timezone=True), server_default=func.now())

    asset = relationship("Asset", back_populates="history")
    employee = relationship("Employee", back_populates="history")
