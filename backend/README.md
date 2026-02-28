# Backend — Legal LLM API Server

FastAPI backend that serves the fine-tuned Phi-3 Legal model.

## Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate    # Linux/Mac
# venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Add your Hugging Face token to .env
```

## Run

```bash
uvicorn Api.main:app --host 0.0.0.0 --port 8000 --reload
```

## Structure

```
backend/
├── Api/main.py          # FastAPI routes + SPA serving
├── LLM/llm.py           # Model loading (float16 / 4-bit / CPU)
├── rag/                  # RAG pipeline (extensible)
├── mlops/                # MLOps modules (extensible)
├── model_artifacts/      # Place fine-tuned model here (gitignored)
├── data/                 # Embeddings & logs
├── requirements.txt
└── .env.example
```

## API

| Method | Endpoint         | Description          |
|--------|------------------|----------------------|
| GET    | `/api/health`    | Server health check  |
| POST   | `/api/inference` | Legal query → answer |
