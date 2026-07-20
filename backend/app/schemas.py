from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict


# ---------- Auth ----------

class AdminLogin(BaseModel):
    username: str
    password: str


class AdminCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "admin"


class AdminOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    email: EmailStr
    role: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: AdminOut


# ---------- Employee ----------

class EmployeeBase(BaseModel):
    emp_code: str
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    department: str
    designation: Optional[str] = None
    status: str = "Active"


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    status: Optional[str] = None


class EmployeeOut(EmployeeBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    assets_assigned: int = 0


# ---------- Asset ----------

class AssetBase(BaseModel):
    asset_code: str
    name: str
    category: str
    brand: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    purchase_date: Optional[date] = None
    warranty_expiry: Optional[date] = None
    vendor: Optional[str] = None
    condition: str = "New"
    status: str = "Available"


class AssetCreate(AssetBase):
    pass


class AssetUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    purchase_date: Optional[date] = None
    warranty_expiry: Optional[date] = None
    vendor: Optional[str] = None
    condition: Optional[str] = None
    status: Optional[str] = None


class AssetOut(AssetBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    assigned_to: Optional[str] = None  # employee name, if currently assigned


# ---------- Assignment ----------

class AssignmentCreate(BaseModel):
    employee_id: int
    asset_id: int
    notes: Optional[str] = None


class AssignmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    employee_id: int
    asset_id: int
    employee_name: str
    asset_name: str
    asset_code: str
    assigned_date: datetime
    returned_date: Optional[datetime] = None
    status: str
    notes: Optional[str] = None


# ---------- Asset History ----------

class AssetHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    asset_id: int
    employee_id: Optional[int] = None
    employee_name: Optional[str] = None
    action: str
    notes: Optional[str] = None
    date: datetime


# ---------- Dashboard ----------

class DashboardStats(BaseModel):
    total_employees: int
    total_assets: int
    assigned: int
    available: int
    maintenance: int
    lost: int
