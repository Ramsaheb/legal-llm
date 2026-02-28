import sys
import time
import traceback
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

# Add backend root so we can import LLM.llm
BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from LLM.llm import load_model, generate_response

# ---------- Paths ----------
FRONTEND_DIR = BACKEND_ROOT.parent / "frontend"
REACT_BUILD  = FRONTEND_DIR / "build"           # React production build
STATIC_HTML  = FRONTEND_DIR / "index.html"       # Standalone fallback

# Decide which frontend to serve: React build if available, else static HTML
if REACT_BUILD.exists() and (REACT_BUILD / "index.html").exists():
    SERVE_DIR  = REACT_BUILD
    INDEX_FILE = REACT_BUILD / "index.html"
    print(f"[frontend] Serving React build from: {SERVE_DIR}")
else:
    SERVE_DIR  = FRONTEND_DIR
    INDEX_FILE = STATIC_HTML
    print(f"[frontend] Serving static HTML from: {INDEX_FILE}")

# ---------- Lifespan: preload model at startup ----------
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[startup] Preloading model...")
    t0 = time.time()
    try:
        load_model()
        print(f"[startup] Model loaded in {time.time()-t0:.1f}s")
    except Exception as e:
        print(f"[startup] Model preload failed: {e}")
        print("[startup] Model will load on first request instead.")
    yield
    print("[shutdown] Server stopping.")

app = FastAPI(title="Legal LLM Backend", lifespan=lifespan)

# CORS – allow all origins (needed for Colab ngrok / localtunnel / dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- API Routes (defined BEFORE static mount) ----------
class QueryRequest(BaseModel):
    query: str
    max_tokens: int = 512

@app.get("/api/health")
def health():
    return {"status": "ok", "message": "Legal LLM Backend running"}

@app.post("/api/inference")
async def inference(request: QueryRequest):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    try:
        t0 = time.time()
        output = generate_response(request.query, max_tokens=request.max_tokens)
        elapsed = round(time.time() - t0, 2)
        return {"response": output, "time_sec": elapsed}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ---------- Serve Frontend ----------
# Serve the root index
@app.get("/")
def serve_index():
    if INDEX_FILE.exists():
        return FileResponse(str(INDEX_FILE))
    return JSONResponse(
        {"message": "Frontend not found. Run 'npm run build' in frontend/ or place index.html there."},
        status_code=404,
    )

# Mount static assets (React build puts JS/CSS in build/static/)
if SERVE_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(SERVE_DIR / "static") if (SERVE_DIR / "static").exists() else str(SERVE_DIR)), name="static")

    # Also serve other root-level build assets (manifest.json, favicon, etc.)
    @app.get("/{filename:path}")
    def serve_spa(filename: str):
        """
        SPA catch-all: try to serve the file from SERVE_DIR,
        otherwise return index.html so React Router works.
        """
        # Don't intercept /api routes
        if filename.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not found")

        file_path = SERVE_DIR / filename
        if file_path.is_file():
            return FileResponse(str(file_path))

        # SPA fallback: return index.html for all unknown routes
        if INDEX_FILE.exists():
            return FileResponse(str(INDEX_FILE))
        raise HTTPException(status_code=404, detail="Not found")
