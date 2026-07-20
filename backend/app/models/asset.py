from sqlalchemy import Column, Integer, String, DateTime, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    asset_code = Column(String(20), unique=True, index=True, nullable=False)  # e.g. LAP001
    name = Column(String(120), nullable=False)  # e.g. Laptop
    category = Column(String(80), nullable=False)  # Laptop, Monitor, Keyboard...
    brand = Column(String(80), nullable=True)
    model = Column(String(120), nullable=True)
    serial_number = Column(String(120), unique=True, index=True, nullable=True)
    purchase_date = Column(Date, nullable=True)
    warranty_expiry = Column(Date, nullable=True)
    vendor = Column(String(120), nullable=True)
    condition = Column(String(20), default="New")  # New | Good | Fair | Poor
    status = Column(String(20), default="Available", index=True)
    # Available | Assigned | Maintenance | Lost
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    assignments = relationship("Assignment", back_populates="asset")
    history = relationship("AssetHistory", back_populates="asset")
