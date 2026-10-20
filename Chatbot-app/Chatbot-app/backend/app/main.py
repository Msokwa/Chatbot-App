import asyncio
import os
from collections.abc import AsyncIterator

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

app = FastAPI(
    title="Chatbot API",
    description="Backend API for the chatbot application.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str


def _mock_response(message: str) -> str:
    return f"You said: {message}"


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


async def stream_mock_response(message: str) -> AsyncIterator[str]:
    words = _mock_response(message).split(" ")

    for index, word in enumerate(words):
        if index:
            yield " "
        yield word
        await asyncio.sleep(0.04)


async def stream_openai_response(message: str) -> AsyncIterator[str]:
    try:
        from openai import AsyncOpenAI
    except ImportError as import_error:
        raise RuntimeError("The openai package is not installed.") from import_error

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured.")

    base_url = os.getenv("OPENAI_BASE_URL")
    client = AsyncOpenAI(api_key=api_key, base_url=base_url)
    model = os.getenv("OPENAI_MODEL", "llama-3.1-8b-instant")

    stream = await client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": "You are a concise, helpful assistant for a chatbot demo.",
            },
            {"role": "user", "content": message},
        ],
        stream=True,
    )

    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta


async def stream_response(message: str) -> AsyncIterator[str]:
    if os.getenv("OPENAI_API_KEY"):
        async for chunk in stream_openai_response(message):
            yield chunk
        return

    async for chunk in stream_mock_response(message):
        yield chunk


@app.post("/chat")
async def chat(request: ChatRequest) -> StreamingResponse:
    message = request.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    return StreamingResponse(
        stream_response(message),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
