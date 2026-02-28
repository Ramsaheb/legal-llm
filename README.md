<p align="center">
  <img src="https://img.icons8.com/fluency/96/law.png" alt="Legal LLM Logo" width="96"/>
</p>

<h1 align="center">Legal LLM — Indian Legal AI Assistant</h1>

<p align="center">
  <strong>A fine-tuned LLM-powered chatbot for Indian legal queries</strong><br/>
  Built with Phi-3 + LoRA &bull; FastAPI Backend &bull; React Frontend &bull; RAG Pipeline
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/PyTorch-2.0+-EE4C2C?logo=pytorch&logoColor=white" alt="PyTorch"/>
  <img src="https://img.shields.io/badge/HuggingFace-Transformers-FFD21E?logo=huggingface&logoColor=black" alt="HuggingFace"/>
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License"/>
</p>

---

## Overview

**Legal LLM** is an end-to-end AI system that answers questions about **Indian law** — covering the Indian Penal Code (IPC), Constitution of India, CrPC, Contract Act, IT Act, and more.

The project fine-tunes **Microsoft's Phi-3 Mini** with **QLoRA** on a custom-generated dataset of 10,000+ Indian legal Q&A pairs, then serves it through a production-ready FastAPI backend with a modern React chat interface.

### Key Features

- **Fine-tuned on Indian Law** — trained on IPC sections, Constitutional articles, CrPC, Contract Act, IT Act, NDPS Act, and more
- **Smart Chat Interface** — multi-chat sessions, chat history, quick prompts, copy responses, mobile-responsive
- **Adaptive Model Loading** — auto-detects GPU VRAM and loads in float16, 4-bit quantized, or CPU mode
- **RAG Pipeline (Extensible)** — scaffolded retrieval-augmented generation for document-grounded answers
- **MLOps Ready** — scaffolded modules for evaluation, monitoring, model versioning, and logging
- **Colab Support** — train and deploy directly from Google Colab with ngrok tunneling

---

## Project Structure

```
legal-llm/
├── backend/                    # FastAPI server + ML pipeline
│   ├── Api/
│   │   └── main.py             # FastAPI app, routes, SPA serving
│   ├── LLM/
│   │   └── llm.py              # Model loading & inference (Phi-3 + LoRA)
│   ├── rag/                    # RAG pipeline (embedder, retriever, vectorstore)
│   ├── mlops/                  # MLOps modules (config, evaluator, logger, monitoring)
│   ├── data/                   # Embeddings & logs storage
│   ├── requirements.txt
│   └── .env.example            # Environment variable template
│
├── frontend/                   # React chat application
│   ├── src/
│   │   ├── App.js              # Main app with chat management
│   │   ├── api.js              # API client (health check, inference)
│   │   ├── components/
│   │   │   ├── ChatArea.js     # Chat UI with example cards & typing indicator
│   │   │   └── Sidebar.js      # Chat history, quick prompts, status
│   │   └── App.css             # Complete dark-theme stylesheet
│   └── package.json
│
├── data/
│   ├── data_creation.py        # Dataset generator (10K+ legal Q&A pairs)
│   └── legal_finetune_dataset.json
│
├── Leagal LLM.ipynb            # Training notebook (Colab, QLoRA fine-tuning)
├── Legal_LLM_Colab.ipynb       # Deployment notebook (Colab + ngrok)
├── legal_finetune_dataset.json # Generated training dataset
└── .gitignore
```

---

## Quick Start

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** (for frontend)
- **CUDA GPU** recommended (works on CPU too, slower)
- **Hugging Face account** ([get a token](https://huggingface.co/settings/tokens))

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/legal-llm.git
cd legal-llm
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Linux/Mac
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your Hugging Face token
```

### 3. Train the Model (or use pre-trained)

**Option A — Train on Google Colab (recommended):**
1. Open `Leagal LLM.ipynb` in Google Colab
2. Add your HF token when prompted
3. Run all cells — fine-tunes Phi-3 with QLoRA (~2 hours on T4 GPU)
4. Download the model artifacts to `backend/model_artifacts/phi3-legal-lora/`

**Option B — Use pre-trained weights:**
Place your fine-tuned model files in:
```
backend/model_artifacts/phi3-legal-lora/
```

### 4. Start the Backend

```bash
cd backend
uvicorn Api.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`

### 5. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Development mode (proxies to backend)
npm start

# OR build for production (served by FastAPI)
npm run build
```

Open `http://localhost:3000` (dev) or `http://localhost:8000` (production build).

---

## API Endpoints

| Method | Endpoint          | Description                     |
|--------|-------------------|---------------------------------|
| GET    | `/api/health`     | Health check — returns server status |
| POST   | `/api/inference`  | Send a legal query and get AI response |

### Example Request

```bash
curl -X POST http://localhost:8000/api/inference \
  -H "Content-Type: application/json" \
  -d '{"query": "What is Section 420 of IPC?", "max_tokens": 512}'
```

### Example Response

```json
{
  "response": "Section 420 of the Indian Penal Code relates to cheating and dishonestly inducing delivery of property. The prescribed consequence is imprisonment up to 7 years and fine.",
  "time_sec": 2.34
}
```

---

## Training Details

| Parameter         | Value                                |
|-------------------|--------------------------------------|
| Base Model        | Microsoft Phi-3 Mini (3.8B)          |
| Fine-tuning       | QLoRA (4-bit quantization + LoRA)    |
| Dataset           | 10,000+ custom Indian legal Q&A pairs|
| Epochs            | 2                                    |
| Batch Size        | 1 (gradient accumulation: 16)        |
| Learning Rate     | 2e-4                                 |
| Optimizer         | Paged AdamW 8-bit                    |
| Hardware          | Google Colab T4 GPU (15 GB VRAM)     |

### Dataset Categories

- **Statutory Interpretation** — Q&A on IPC, Constitution, CrPC, Contract Act, IT Act, NDPS Act
- **Penalty Calculation** — Math-based legal computation problems
- **Clause Extraction** — Legal document clause identification

---

## Deploy on Google Colab

Use `Legal_LLM_Colab.ipynb` for a complete Colab deployment:

1. Trains/loads the model on Google Colab T4 GPU
2. Serves FastAPI backend via ngrok tunnel
3. Provides a public URL accessible from anywhere

---

## Tech Stack

| Layer      | Technology                                     |
|------------|------------------------------------------------|
| LLM        | Microsoft Phi-3 Mini + QLoRA fine-tuning       |
| Backend    | FastAPI, Uvicorn, PyTorch, Transformers, PEFT  |
| Frontend   | React 18, Vanilla CSS (dark theme)             |
| Data       | Custom dataset generator (Python)              |
| MLOps      | Evaluation, monitoring, versioning (scaffolded)|
| Deployment | Google Colab + ngrok, or local server          |

---

## Screenshots

<p align="center">
  <em>Dark-themed chat interface with example cards, quick prompts, and multi-chat support</em>
</p>

> **Tip:** Add screenshots by placing them in a `docs/` folder and referencing them here:
> ```markdown
> ![Chat Interface](docs/screenshots/chat.png)
> ```

---

## Environment Variables

| Variable   | Description                          | Required |
|------------|--------------------------------------|----------|
| `HF_TOKEN` | Hugging Face API token               | Yes      |

Copy `.env.example` to `.env` in the `backend/` directory and fill in your values.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Disclaimer

> This AI provides **general legal information** about Indian law for educational purposes only. It does **not** constitute legal advice. Always consult a qualified lawyer for specific legal matters.

---

<p align="center">
  Made with ❤️ for Indian Legal Tech
</p>
