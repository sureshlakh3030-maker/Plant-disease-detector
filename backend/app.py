import os
import torch
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io
from disease_info import DISEASE_INFO, DEFAULT_INFO
from transformers import EfficientNetImageProcessor, EfficientNetForImageClassification

app = Flask(__name__)
CORS(app)

# Load Model
# Point this at the "final" folder produced by training
# (contains config.json, model.safetensors, preprocessor_config.json)
MODEL_DIR = os.environ.get(
    "MODEL_DIR",
    r"D:\PLant Diesease Prediction\efficientnet-b3-plant-disease\final",
)

model = None
processor = None
device = "cuda" if torch.cuda.is_available() else "cpu"


def load_model_assets():
    global model, processor
    try:
        if os.path.isdir(MODEL_DIR):
            processor = EfficientNetImageProcessor.from_pretrained(MODEL_DIR)
            model = EfficientNetForImageClassification.from_pretrained(MODEL_DIR)
            model.to(device)
            model.eval()
            print(f"Model loaded successfully from {MODEL_DIR} on {device}.")
        else:
            print(f"Warning: Model dir {MODEL_DIR} not found. Running in MOCK mode.")
    except Exception as e:
        print(f"Error loading model: {e}")


load_model_assets()


def preprocess_and_predict(image_bytes):
    """Runs the real model and returns (label, confidence)."""
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    inputs = processor(image, return_tensors="pt").to(device)

    with torch.no_grad():
        logits = model(**inputs).logits

    probs = torch.softmax(logits, dim=-1)[0]
    confidence, idx = torch.max(probs, dim=-1)
    label = model.config.id2label[idx.item()]
    return label, confidence.item()


@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    try:
        image_bytes = file.read()

        if model is not None:
            # Real prediction
            disease_key, confidence = preprocess_and_predict(image_bytes)
        else:
            # Mock prediction for prototype demonstration if model not loaded
            import random

            disease_key = random.choice(list(DISEASE_INFO.keys()))
            confidence = random.uniform(0.85, 0.99)
            print(f"MOCK Prediction: {disease_key}")

        # Get detailed info
        info = DISEASE_INFO.get(disease_key, DEFAULT_INFO)

        return jsonify(
            {
                "disease": disease_key.replace("_", " "),
                "confidence": f"{confidence * 100:.1f}%",
                "status": info["status"],
                "description": info["description"],
                "treatment": info["treatment"],
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "model_loaded": model is not None})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
