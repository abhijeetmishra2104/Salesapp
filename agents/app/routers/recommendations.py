import uuid
from fastapi import APIRouter

from agents.recommendation_agent import RecommendationAgent
from agents.inventory_agent import InventoryAgent
from agents.base_agent import Task

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

recommendation_agent = RecommendationAgent()
inventory_agent = InventoryAgent()

@router.post("/cart")
def recommend_for_cart(body: dict):
    session_id = body.get("sessionId") or str(uuid.uuid4())

    task = Task(
        task_id=str(uuid.uuid4()),
        agent="recommendation",
        type="RECOMMEND_FOR_CART",
        session_id=session_id,
        customer_id=body.get("customerId"),
        payload={
            "cart": body.get("cart", []),
            "user_profile": body.get("userProfile", {}),
            "inventory_client": inventory_agent,
        },
    )

    result = recommendation_agent.handle(task)

    return {
        "status": result.status,
        "sessionId": session_id,
        "recommendations": result.payload.get("recommendations", []),
        "errors": [e.__dict__ for e in result.errors],
    }

