"""
Backend stub for ROOMIE.

ROOMIE follows a Supabase-first serverless architecture: all data, auth, and
business logic live in Supabase (PostgreSQL + Auth + future Edge Functions).

This FastAPI service exists only to satisfy the supervisor process expected by
the hosting environment and to expose a lightweight health endpoint. It must
NOT be used for authentication or core business logic.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Roomie Backend Health", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/")
async def root():
    return {
        "service": "roomie-backend",
        "status": "ok",
        "architecture": "supabase-first",
    }


@app.get("/api/health")
async def health():
    return {"status": "healthy"}
