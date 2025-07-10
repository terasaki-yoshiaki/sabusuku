from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
import uuid

app = FastAPI()

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

user_settings = {
    "terms_accepted": False,
    "setup_completed": False
}

subscription_services = {}
payment_overrides = {}

class SubscriptionService(BaseModel):
    id: Optional[str] = None
    service_name: str
    withdrawal_date: int  # Day of month (1-31)
    amount: float

class PaymentOverride(BaseModel):
    service_id: str
    date: str  # YYYY-MM-DD format
    service_name: Optional[str] = None
    amount: Optional[float] = None
    withdrawal_date: Optional[int] = None

class SaveScope(BaseModel):
    scope: str  # "day_only", "all_service", "manual_months"
    months: Optional[List[str]] = None  # For manual_months scope, format: YYYY-MM

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.get("/api/user/settings")
async def get_user_settings():
    return user_settings

@app.post("/api/user/accept-terms")
async def accept_terms():
    user_settings["terms_accepted"] = True
    return {"success": True}

@app.post("/api/user/complete-setup")
async def complete_setup():
    user_settings["setup_completed"] = True
    return {"success": True}

@app.get("/api/services")
async def get_services():
    return list(subscription_services.values())

@app.post("/api/services")
async def create_service(service: SubscriptionService):
    service_id = str(uuid.uuid4())
    service.id = service_id
    subscription_services[service_id] = service.dict()
    return subscription_services[service_id]

@app.put("/api/services/{service_id}")
async def update_service(service_id: str, service: SubscriptionService):
    if service_id not in subscription_services:
        raise HTTPException(status_code=404, detail="Service not found")
    service.id = service_id
    subscription_services[service_id] = service.dict()
    return subscription_services[service_id]

@app.delete("/api/services/{service_id}")
async def delete_service(service_id: str):
    if service_id not in subscription_services:
        raise HTTPException(status_code=404, detail="Service not found")
    del subscription_services[service_id]
    return {"success": True}

@app.get("/api/payments/{date}")
async def get_payments_for_date(date: str):
    day_of_month = int(date.split('-')[2])
    regular_payments = []
    
    for service in subscription_services.values():
        if service["withdrawal_date"] == day_of_month:
            regular_payments.append({
                "id": service["id"],
                "service_name": service["service_name"],
                "amount": service["amount"],
                "withdrawal_date": service["withdrawal_date"],
                "is_override": False
            })
    
    override_key = date
    if override_key in payment_overrides:
        override = payment_overrides[override_key]
        for i, payment in enumerate(regular_payments):
            if payment["id"] == override["service_id"]:
                regular_payments[i].update({
                    "service_name": override.get("service_name", payment["service_name"]),
                    "amount": override.get("amount", payment["amount"]),
                    "withdrawal_date": override.get("withdrawal_date", payment["withdrawal_date"]),
                    "is_override": True
                })
                break
    
    return regular_payments

@app.post("/api/payments/save")
async def save_payment_changes(
    service_id: str,
    date: str,
    service_name: Optional[str] = None,
    amount: Optional[float] = None,
    withdrawal_date: Optional[int] = None,
    scope: str = "day_only",
    months: Optional[List[str]] = None
):
    if scope == "day_only":
        payment_overrides[date] = {
            "service_id": service_id,
            "service_name": service_name,
            "amount": amount,
            "withdrawal_date": withdrawal_date
        }
    elif scope == "all_service":
        if service_id in subscription_services:
            if service_name is not None:
                subscription_services[service_id]["service_name"] = service_name
            if amount is not None:
                subscription_services[service_id]["amount"] = amount
            if withdrawal_date is not None:
                subscription_services[service_id]["withdrawal_date"] = withdrawal_date
    elif scope == "manual_months" and months:
        original_day = int(date.split('-')[2])
        new_day = withdrawal_date if withdrawal_date is not None else original_day
        
        for month in months:
            override_date = f"{month}-{new_day:02d}"
            payment_overrides[override_date] = {
                "service_id": service_id,
                "service_name": service_name,
                "amount": amount,
                "withdrawal_date": withdrawal_date
            }
    
    return {"success": True}

@app.get("/api/calendar/{year}/{month}")
async def get_calendar_data(year: int, month: int):
    payment_dates = []
    
    for service in subscription_services.values():
        day = service["withdrawal_date"]
        if 1 <= day <= 31:  # Basic validation
            payment_dates.append(day)
    
    month_prefix = f"{year}-{month:02d}"
    for date_key in payment_overrides:
        if date_key.startswith(month_prefix):
            day = int(date_key.split('-')[2])
            if day not in payment_dates:
                payment_dates.append(day)
    
    return {"payment_dates": sorted(list(set(payment_dates)))}
