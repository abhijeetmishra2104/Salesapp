from fastapi import FastAPI
from agents.app.routers import recommendations, checkout

app = FastAPI(title="Sales Orchestrator")

app.include_router(recommendations.router, prefix="/api")
app.include_router(checkout.router)
