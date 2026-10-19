# Full-Stack AI Chatbot Application

A modern, containerized, full-stack AI chat application built with **FastAPI**, **React (Vite)**, and **Docker Compose**. It features real-time response streaming using **Groq** (LLaMA 3) with an OpenAI-compatible interface and automatic fallback to mock streaming when no API key is provided.

---

## Features

- **Real-Time Token Streaming**: Streams responses chunk-by-chunk using FastAPI's `StreamingResponse`.
- **Groq Integration**: Powered by Groq's high-speed inference API running `llama-3.1-8b-instant`.
- **Modern UI**: Clean React + Vite chat interface with auto-scrolling and real-time message updates.
- **Dockerized Architecture**: Multi-container setup orchestrated with Docker Compose for consistent local development.
- **Graceful Fallbacks**: Automatically falls back to a simulated streaming response if an API key is missing.

---

## Tech Stack

- **Backend**: Python, FastAPI, Uvicorn, OpenAI SDK (`AsyncOpenAI`)
- **Frontend**: React, TypeScript, Vite
- **Infrastructure**: Docker, Docker Compose
- **LLM Provider**: Groq API

---

## Prerequisites

Before starting, ensure you have the following installed on your system:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)
- A free **Groq API Key** from [console.groq.com](https://console.groq.com/)

---

## Project Structure
