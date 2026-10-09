import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

# Optional: Gemini AI integration if google-generativeai is installed and API key is set
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except (ImportError, ModuleNotFoundError):
    GEMINI_AVAILABLE = False

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for frontend access

# Load local legal data from JSON file
DATA_FILE_PATH = os.path.join(os.path.dirname(__file__), "legal_data.json")

def load_legal_data():
    """Utility function to load structured legal data."""
    if not os.path.exists(DATA_FILE_PATH):
        return []
    with open(DATA_FILE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/")
def health_check():
    return jsonify({
        "status": "online",
        "message": "RightsPocket API is running",
        "gemini_available": GEMINI_AVAILABLE
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)