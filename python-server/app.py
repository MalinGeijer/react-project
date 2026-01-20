import os

# Flask is a lightweight web framework for Python. Is used to create a simple server
# that can handle HTTP requests from the React frontend.
# request is used to handle incoming HTTP requests
# jsonify is used to send JSON responses back to the client
# CORS is used to enable Cross-Origin Resource Sharing so that our React app
# can communicate with this server even if hosted on different domains/ports.
from flask import Flask, jsonify, request, abort
from flask_cors import CORS
from dotenv import load_dotenv
from src.AI.data_processing import image_decode, process_image
from src.utils.db_utils import get_gallery, get_products


# --------------------------------------------------
# Load environment variables
# --------------------------------------------------
load_dotenv()
IG_USER_ID = os.environ.get("IG_USER_ID")
TOKEN = os.environ.get("IG_ACCESS_TOKEN")
ADMIN_USER = os.environ.get("REACT_APP_ADMIN_USER")
ADMIN_PASS = os.environ.get("REACT_APP_ADMIN_PASS")

# --------------------------------------------------
# Paths
# --------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FOLDER = os.path.join(BASE_DIR, "data", "db")
os.makedirs(DB_FOLDER, exist_ok=True)
DB_PATH = os.path.join(DB_FOLDER, "shop.db")

# --------------------------------------------------
# Flask app
# --------------------------------------------------
app = Flask(__name__)

# --------------------------------------------------
# Routes
# --------------------------------------------------
# Basic GET route to check if the servers status
@app.route("/")
def health():
    return "Server Status: Running"

@app.route("/api/predict", methods=["POST"])
def predict():
    # Get the JSON data from the request
    data = request.get_json(silent=True)
    # Get the base64 encoded image string
    image = data.get("image", "")

    # Check that JSON exists
    if data is None:
        return jsonify({"error": "Invalid or missing JSON"}), 400

    # Check that image field exists
    if not image:
        return jsonify({"error": "No image provided"}), 400

    # Optional sanity check
    if image is None:
        return jsonify({"error": "Image is empty"}), 400

    # Decode base64 → PIL image
    pil_image = image_decode(image, verbose=True)

    # Process PIL image → flattenad NumPy array
    img_flat = process_image(pil_image, save=True, verbose=True)

    # TODO: Return prediction statistics and plots (seaborn/matplotlib)
    return jsonify({
        "status": "TBD",
        "type": type(image).__name__
    }), 200

@app.route("/api/gallery")
def api_gallery():
    return jsonify(get_gallery())

@app.route("/api/products")
def api_products():
    q = request.args.get("q", "").strip().lower()
    products = get_products()

    print("----- /api/products called -----")
    print("Query param:", q)
    print("Total products in DB:", len(products))

    if not q:
        print("No query provided, returning all products")
        return jsonify(products)

    filtered = []

    for p in products:
        text_match = (
            q in p["name"].lower()
            or q in p["brand"].lower()
            or q in p["description"].lower()
        )

        number_match = False
        if q.isdigit():
            number = int(q)
            number_match = (
                p.get("id") == number
                or p.get("price") == number
            )

        if text_match or number_match:
            filtered.append(p)
            print(f"Matched product: {p['name']} (id={p['id']})")

    print("Total matches:", len(filtered))
    return jsonify(filtered)

@app.route("/api/products/<int:product_id>")
def api_product(product_id: int):
    """Return a single product by id or 404 if not found."""
    products = get_products()
    for p in products:
        if p.get("id") == product_id:
            return jsonify(p)
    return jsonify({"error": "Product not found"}), 404

from flask import abort

ADMIN_USER = os.environ.get("REACT_APP_ADMIN_USER")
ADMIN_PASS = os.environ.get("REACT_APP_ADMIN_PASS")

@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.get_json(silent=True)
    username = data.get("username", "")
    password = data.get("password", "")

    if username == ADMIN_USER and password == ADMIN_PASS:
        return jsonify({"success": True})
    return jsonify({"success": False, "error": "Fel användarnamn eller lösenord"}), 401

@app.route("/api/products", methods=["POST"])
def api_add_product():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    products = get_products()  # Hämta nuvarande produkter
    new_id = max([p["id"] for p in products], default=0) + 1
    new_product = {
        "id": new_id,
        "name": data.get("name", "TBD"),
        "brand": data.get("brand", "Craft Etc"),
        "price": data.get("price", 200),
        "description": data.get("description", ""),
        "image_url": data.get("image_url", ""),
    }

    # Spara till DB (eller memory om du inte implementerat insert yet)
    # Här behöver du skriva en funktion i db_utils.py som lägger till produkt
    from src.utils.db_utils import add_product
    add_product(new_product)

    return jsonify(new_product), 201

@app.route("/api/products/<int:product_id>", methods=["DELETE"])
def api_delete_product(product_id: int):
    from src.utils.db_utils import delete_product
    success = delete_product(product_id)
    if success:
        return jsonify({"success": True})
    else:
        return jsonify({"error": "Product not found"}), 404


# --------------------------------------------------
# MAIN
# --------------------------------------------------
if __name__ == "__main__":
    # Start the Flask development server on port 5000
    # debug=True reloads the server automatically when files change
    app.run(host="0.0.0.0", port=5000, debug=True)
