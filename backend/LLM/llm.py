import os
from pathlib import Path
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

# Resolve model path relative to the backend/ directory
BACKEND_ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = str(BACKEND_ROOT / "model_artifacts" / "phi3-legal-lora")

model = None
tokenizer = None


def load_model():
    """
    Load the fine-tuned Phi-3 Legal model from a local folder.
    - Colab T4 (15 GB): loads in float16 on GPU
    - Small GPU (<6 GB): loads in 4-bit quantization
    - No GPU: loads in float32 on CPU
    """
    global model, tokenizer

    if model is not None:
        return model, tokenizer

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"MODEL_PATH does not exist: {MODEL_PATH}")

    if not os.listdir(MODEL_PATH):
        raise ValueError(f"MODEL_PATH is empty: {MODEL_PATH}")

    print(f"Loading fine-tuned legal Phi-3 from: {MODEL_PATH}")

    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)

    if torch.cuda.is_available():
        vram_gb = torch.cuda.get_device_properties(0).total_memory / 1024**3
        print(f"GPU: {torch.cuda.get_device_name(0)} | VRAM: {vram_gb:.1f} GB")

        if vram_gb >= 8:
            # Colab T4 / decent GPU → float16, fits comfortably
            model = AutoModelForCausalLM.from_pretrained(
                MODEL_PATH,
                torch_dtype=torch.float16,
                device_map="auto",
            )
        else:
            # Small GPU (e.g. GTX 1650 4 GB) → 4-bit quantization
            from transformers import BitsAndBytesConfig
            bnb_config = BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_quant_type="nf4",
                bnb_4bit_compute_dtype=torch.float16,
                bnb_4bit_use_double_quant=True,
            )
            model = AutoModelForCausalLM.from_pretrained(
                MODEL_PATH,
                quantization_config=bnb_config,
                device_map={"": 0},
            )
    else:
        # CPU fallback
        model = AutoModelForCausalLM.from_pretrained(
            MODEL_PATH,
            torch_dtype=torch.float32,
        )

    print("Model loaded successfully.")
    return model, tokenizer


def generate_response(prompt: str, max_tokens: int = 512):
    """
    Generate a legal response using the fine-tuned model.
    """
    model, tokenizer = load_model()

    device = next(model.parameters()).device
    inputs = tokenizer(prompt, return_tensors="pt").to(device)

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=max_tokens,
            temperature=0.7,
            do_sample=True,
            top_p=0.9,
            repetition_penalty=1.2,
            pad_token_id=tokenizer.eos_token_id,
        )

    # Only return the newly generated tokens (strip the prompt)
    new_tokens = outputs[0][inputs["input_ids"].shape[-1]:]
    return tokenizer.decode(new_tokens, skip_special_tokens=True)
