#!/usr/bin/env python3
"""
Stable Diffusion Image Generator API using DreamShaper model
"""
import os
import base64
import logging
from io import BytesIO

from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from diffusers import StableDiffusionPipeline
from PIL import Image, ImageDraw, ImageFont

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

class ImageGenerator:
    def __init__(self, model_name="Lykon/DreamShaper"):
        """Initialize the image generator with specified model."""
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_name = model_name
        self.pipe = None
        self.model_loaded = False
        self.force_placeholder = os.getenv("CV_PLACEHOLDER_MODE", "0") == "1"

        if self.force_placeholder:
            logger.info("Placeholder mode enabled; skipping model load.")
        else:
            self.load_model()

    def load_model(self):
        """Load the Stable Diffusion model."""
        logger.info(f"Loading model {self.model_name} on {self.device}...")
        torch_dtype = torch.float16 if self.device == "cuda" else torch.float32
        try:
            self.pipe = StableDiffusionPipeline.from_pretrained(
                self.model_name,
                torch_dtype=torch_dtype,
                safety_checker=None,
                requires_safety_checker=False
            ).to(self.device)
            self.model_loaded = True
            logger.info("Model loaded successfully.")
        except Exception as exc:
            logger.warning(
                "Falling back to placeholder image generation: %s", exc
            )
            self.pipe = None
            self.model_loaded = False
        # Optimizations
        if self.device == "cuda":
            # self.pipe.enable_xformers_memory_efficient_attention()  # xformers is not installed
            self.pipe.enable_attention_slicing()

    def generate_image(self, prompt):
        """Generate an image from text prompt and return base64 string."""
        logger.info(f"Generating image for prompt: '{prompt}'")
        if self.force_placeholder or not self.model_loaded:
            image = self._generate_placeholder(prompt)
        else:
            try:
                image = self.pipe(prompt).images[0]
            except Exception as exc:
                logger.warning(
                    "Falling back to placeholder after pipeline failure: %s",
                    exc
                )
                image = self._generate_placeholder(prompt)

        buffered = BytesIO()
        image.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode("utf-8")

    def _generate_placeholder(self, prompt, size=(512, 512)):
        """Return a simple placeholder image embedding the prompt text."""
        image = Image.new("RGB", size, color=(32, 32, 32))
        draw = ImageDraw.Draw(image)
        font = ImageFont.load_default()
        wrapped_prompt = "\n".join(self._wrap_text(prompt, 40))
        draw.text((20, 20), "Offline Mode", fill=(200, 200, 200), font=font)
        draw.text((20, 60), wrapped_prompt or "No prompt provided", fill=(180, 180, 180), font=font)
        return image

    @staticmethod
    def _wrap_text(text, max_chars):
        words = text.split()
        line, lines = [], []
        for word in words:
            if sum(len(w) for w in line) + len(line) + len(word) <= max_chars:
                line.append(word)
            else:
                lines.append(" ".join(line))
                line = [word]
        if line:
            lines.append(" ".join(line))
        return lines or [text[:max_chars]]

# Initialize generator when starting the server
generator = ImageGenerator()

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    prompt = data.get('prompt')
    
    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400
    
    try:
        image_data = generator.generate_image(prompt)
        return jsonify({"image": image_data})
    except Exception as e:
        logger.error(f"Generation failed: {str(e)}")
        return jsonify({"error": "Image generation failed"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
