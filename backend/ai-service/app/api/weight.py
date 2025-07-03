"""Weight tracking API endpoints."""
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from ..services.supabase_service import supabase_service
from ..middleware.auth import auth_bearer, get_current_user_id

router = APIRouter()


class WeightRecordRequest(BaseModel):
    weight: float
    unit: str = "kg"  # kg or lbs


class WeightRecordResponse(BaseModel):
    id: Optional[int] = None
    user_id: str
    weight: float
    unit: str
    recorded_at: str


class WeightHistoryResponse(BaseModel):
    records: List[WeightRecordResponse]
    count: int


@router.post("/record", response_model=WeightRecordResponse, dependencies=[Depends(auth_bearer)])
async def record_weight(request: WeightRecordRequest, req: Request):
    """
    Record a new weight entry for the current user
    """
    try:
        user_id = get_current_user_id(req)
        
        # Convert to kg if needed
        weight_kg = request.weight
        if request.unit == "lbs":
            weight_kg = request.weight * 0.453592
        
        # Record weight
        result = await supabase_service.record_weight(
            user_id=user_id,
            weight=weight_kg,
            unit="kg"
        )
        
        if not result:
            raise HTTPException(status_code=500, detail="Failed to record weight")
        
        return WeightRecordResponse(
            id=result.get("id"),
            user_id=result.get("user_id"),
            weight=result.get("weight"),
            unit=result.get("unit"),
            recorded_at=result.get("recorded_at")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record weight: {str(e)}")


@router.get("/history", response_model=WeightHistoryResponse, dependencies=[Depends(auth_bearer)])
async def get_weight_history(req: Request, limit: int = 30):
    """
    Get weight history for the current user
    
    Args:
        limit: Maximum number of records to return (default 30)
    """
    try:
        user_id = get_current_user_id(req)
        
        # Get weight history
        records = await supabase_service.get_weight_history(user_id, limit)
        
        # Convert to response format
        response_records = [
            WeightRecordResponse(
                id=record.get("id"),
                user_id=record.get("user_id"),
                weight=record.get("weight"),
                unit=record.get("unit"),
                recorded_at=record.get("recorded_at")
            )
            for record in records
        ]
        
        return WeightHistoryResponse(
            records=response_records,
            count=len(response_records)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get weight history: {str(e)}")


@router.get("/latest", response_model=WeightRecordResponse, dependencies=[Depends(auth_bearer)])
async def get_latest_weight(req: Request):
    """
    Get the latest weight entry for the current user
    """
    try:
        user_id = get_current_user_id(req)
        
        # Get latest weight
        result = await supabase_service.get_latest_weight(user_id)
        
        if not result:
            raise HTTPException(status_code=404, detail="No weight records found")
        
        return WeightRecordResponse(
            id=result.get("id"),
            user_id=result.get("user_id"),
            weight=result.get("weight"),
            unit=result.get("unit"),
            recorded_at=result.get("recorded_at")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get latest weight: {str(e)}")


@router.get("/stats", dependencies=[Depends(auth_bearer)])
async def get_weight_stats(req: Request):
    """
    Get weight statistics for the current user
    """
    try:
        user_id = get_current_user_id(req)
        
        # Get weight history
        records = await supabase_service.get_weight_history(user_id, limit=90)  # Last 90 days
        
        if not records:
            return {
                "total_records": 0,
                "current_weight": None,
                "starting_weight": None,
                "total_change": None,
                "average_weekly_change": None
            }
        
        # Calculate statistics
        current_weight = records[0].get("weight")  # Most recent
        starting_weight = records[-1].get("weight")  # Oldest
        total_change = current_weight - starting_weight
        
        # Calculate weekly average change
        if len(records) > 1:
            first_date = datetime.fromisoformat(records[-1].get("recorded_at").replace("Z", "+00:00"))
            last_date = datetime.fromisoformat(records[0].get("recorded_at").replace("Z", "+00:00"))
            days_diff = (last_date - first_date).days
            weeks_diff = max(days_diff / 7, 1)
            average_weekly_change = total_change / weeks_diff
        else:
            average_weekly_change = 0
        
        return {
            "total_records": len(records),
            "current_weight": current_weight,
            "starting_weight": starting_weight,
            "total_change": round(total_change, 2),
            "average_weekly_change": round(average_weekly_change, 2),
            "unit": "kg"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get weight stats: {str(e)}")