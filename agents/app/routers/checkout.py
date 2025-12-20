from fastapi import APIRouter, HTTPException
from agents.app.orchestrator.sales_orchestrator import SalesOrchestrator

router = APIRouter(tags=["Checkout"])

orchestrator = SalesOrchestrator()

@router.post("/checkout")
def checkout(payload: dict):
    try:
        return orchestrator.checkout_flow(
            cart=payload["cart"],
            customer_id=payload["customer_id"],
            payment_payload=payload["payment"],
            address=payload.get("address", {}),
        )
    except KeyError:
        raise HTTPException(400, "Missing required fields")
