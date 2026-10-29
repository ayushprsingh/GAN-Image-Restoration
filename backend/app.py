import os
import sys
import uuid
import urllib.request
from pathlib import Path

import cv2
import numpy as np
import torch
import yaml
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from PIL import Image

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "deblur_deployment"
sys.path.insert(0, str(MODEL_DIR))

from aug import get_normalize
from models.networks import get_generator

app = Flask(__name__)
CORS(app)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024
UPLOAD_FOLDER = BASE_DIR / "uploads"
OUTPUT_FOLDER = BASE_DIR / "outputs"
WEIGHTS_PATH = MODEL_DIR / "pretrained" / "fpn_inception.h5"
CONFIG_PATH = MODEL_DIR / "config" / "config.yaml"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
NORMALIZE_FN = get_normalize()
UPLOAD_FOLDER.mkdir(exist_ok=True)
OUTPUT_FOLDER.mkdir(exist_ok=True)


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def ensure_backbone_weights():
    cache_dir = Path.home() / ".cache" / "torch" / "hub" / "checkpoints"
    cache_dir.mkdir(parents=True, exist_ok=True)
    backbone = cache_dir / "inceptionresnetv2-520b38e4.pth"
    if not backbone.exists() or backbone.stat().st_size < 100_000_000:
        url = "https://huggingface.co/jscanvic/mirror/resolve/main/inceptionresnetv2-520b38e4.pth"
        temp = backbone.with_suffix(".download")
        print("Downloading InceptionResNet-v2 backbone; this happens only once...")
        urllib.request.urlretrieve(url, temp)
        if temp.stat().st_size < 100_000_000:
            temp.unlink(missing_ok=True)
            raise RuntimeError("Backbone download is incomplete; remove the .download file and retry.")
        temp.replace(backbone)
    return backbone


def load_generator():
    if not WEIGHTS_PATH.is_file() or not CONFIG_PATH.is_file():
        raise FileNotFoundError("Model files missing. Check backend/deblur_deployment folder.")
    ensure_backbone_weights()
    with CONFIG_PATH.open("r", encoding="utf-8") as f:
        model_config = yaml.safe_load(f)["model"]
    checkpoint = torch.load(WEIGHTS_PATH, map_location="cpu", weights_only=False)
    model = get_generator(model_config)
    model.load_state_dict(checkpoint["model"], strict=True)
    model = model.to(DEVICE)
    print(f"DeblurGAN-v2 loaded on {DEVICE}")
    return model


print("Loading pretrained DeblurGAN-v2. First startup may take a few minutes...")
generator = load_generator()


def restore_image(input_path, output_path):
    image = np.array(Image.open(input_path).convert("RGB"))
    height, width = image.shape[:2]
    normalized, _ = NORMALIZE_FN(image, image)
    pad_h = (height // 32 + 1) * 32 - height
    pad_w = (width // 32 + 1) * 32 - width
    normalized = cv2.copyMakeBorder(normalized, 0, pad_h, 0, pad_w, cv2.BORDER_CONSTANT, value=0)
    tensor = torch.from_numpy(normalized.transpose(2, 0, 1)).unsqueeze(0).float().to(DEVICE)
    # This follows the official DeblurGAN-v2 inference behavior used in the tested notebook.
    generator.train(True)
    with torch.no_grad():
        prediction = generator(tensor)
    if isinstance(prediction, (tuple, list)):
        prediction = prediction[0]
    restored = prediction[0].detach().cpu().float().permute(1, 2, 0).numpy()
    restored = np.clip((restored + 1.0) * 127.5, 0, 255).astype(np.uint8)[:height, :width]
    softened = cv2.GaussianBlur(restored, (0, 0), 2)
    sharpened = cv2.addWeighted(restored, 1.5, softened, -0.5, 0)
    Image.fromarray(sharpened).save(output_path, format="PNG")


@app.route("/", methods=["GET"])
def home():
    return jsonify({"success": True, "message": "GAN Image Deblurring Flask Backend is running."})


@app.route("/api/deblur", methods=["POST"])
def deblur_image():
    if "image" not in request.files:
        return jsonify({"success": False, "error": "No image was uploaded."}), 400
    file = request.files["image"]
    if not file.filename:
        return jsonify({"success": False, "error": "No image was selected."}), 400
    if not allowed_file(file.filename):
        return jsonify({"success": False, "error": "Unsupported image format. Use JPG, JPEG, PNG or WEBP."}), 400
    file_id = uuid.uuid4().hex
    extension = file.filename.rsplit(".", 1)[1].lower()
    input_filename = f"{file_id}.{extension}"
    output_filename = f"{file_id}_restored.png"
    input_path = UPLOAD_FOLDER / input_filename
    output_path = OUTPUT_FOLDER / output_filename
    try:
        file.save(input_path)
        # Verify the upload is a readable image before inference.
        with Image.open(input_path) as img:
            img.verify()
        restore_image(input_path, output_path)
        return jsonify({"success": True, "message": "Image processed successfully.",
                        "original_image": f"/api/uploads/{input_filename}",
                        "restored_image": f"/api/outputs/{output_filename}"})
    except Exception:
        app.logger.exception("Image deblurring failed")
        input_path.unlink(missing_ok=True)
        output_path.unlink(missing_ok=True)
        return jsonify({"success": False, "error": "Something went wrong while processing the image."}), 500


@app.route("/api/uploads/<filename>", methods=["GET"])
def get_uploaded_image(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


@app.route("/api/outputs/<filename>", methods=["GET"])
def get_output_image(filename):
    return send_from_directory(OUTPUT_FOLDER, filename)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
