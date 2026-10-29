from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/rag", tags=["rag"])


class EmbedRequest(BaseModel):
    text: str


class EmbedResponse(BaseModel):
    embedding: list[float]
    dims: int


@router.post("/embed", response_model=EmbedResponse)
async def embed(payload: EmbedRequest) -> EmbedResponse:
    # Placeholder until the embeddings provider is wired up.
    return EmbedResponse(embedding=[], dims=0)
