from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    emp_code = Column(String(20), unique=True, index=True, nullable=False)  # e.g. EMP001
    name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=True)
    phone = Column(String(20), nullable=True)
    department = Column(String(80), nullable=False)
    designation = Column(String(80), nullable=True)
    status = Column(String(20), default="Active")  # Active | Inactive
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    assignments = relationship("Assignment", back_populates="employee")
    history = relationship("AssetHistory", back_populates="employee")
