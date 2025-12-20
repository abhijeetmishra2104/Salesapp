import uuid
from agents.inventory_agent import InventoryAgent
from agents.recommendation_agent import RecommendationAgent
from agents.payment_agent import PaymentAgent
from agents.fulfillment_agent import FulfillmentAgent
from agents.loyalty_agent import LoyaltyAgent
from agents.post_purchase_agent import PostPurchaseAgent
from agents.base_agent import Task


class SalesOrchestrator:
    def __init__(self):
        self.inventory = InventoryAgent()
        self.recommendation = RecommendationAgent()
        self.payment = PaymentAgent()
        self.fulfillment = FulfillmentAgent()
        self.loyalty = LoyaltyAgent()
        self.post_purchase = PostPurchaseAgent()

    def checkout_flow(self, cart, customer_id, payment_payload, address, prefer_store=None):
        session_id = str(uuid.uuid4())
        order_id = f"order_{uuid.uuid4().hex[:8]}"

        inv_task = Task(
            task_id=str(uuid.uuid4()),
            agent="inventory",
            type="INVENTORY_CHECK",
            session_id=session_id,
            customer_id=customer_id,
            payload={"items": cart},
        )
        inv_res = self.inventory.handle(inv_task)
        if inv_res.status != "success":
            return {"status": "failed", "reason": "inventory_unavailable"}

        rec_task = Task(
            task_id=str(uuid.uuid4()),
            agent="recommendation",
            type="RECOMMEND_FOR_CART",
            session_id=session_id,
            customer_id=customer_id,
            payload={
                "cart": cart,
                "user_profile": {},
                "inventory_client": self.inventory,
            },
        )
        rec_res = self.recommendation.handle(rec_task)

        return {
            "status": "success",
            "order_id": order_id,
            "recommendations": rec_res.payload if rec_res.status == "success" else {},
        }
