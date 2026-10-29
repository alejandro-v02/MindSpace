from fastapi import FastAPI

from app.routers import rag

app = FastAPI(title="Mindspace AI Service", version="0.1.0")
app.include_router(rag.router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
