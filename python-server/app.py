import datetime
import os
import sqlite3 # Remove me

# Flask is a lightweight web framework for Python. Is used to create a simple server
# that can handle HTTP requests from the React frontend.
# request is used to handle incoming HTTP requests
# jsonify is used to send JSON responses back to the client
# CORS is used to enable Cross-Origin Resource Sharing so that our React app
# can communicate with this server even if hosted on different domains/ports.
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_appbuilder import AppBuilder, Model, ModelView, BaseView, expose
from flask_appbuilder.models.sqla.interface import SQLAInterface
from flask_appbuilder.security.sqla.models import User
import jwt
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from dotenv import load_dotenv
from src.data_processing import image_decode, process_image
from werkzeug.security import generate_password_hash


# --------------------------------------------------
# Load environment variables
# --------------------------------------------------
load_dotenv()
IG_USER_ID = os.environ.get("IG_USER_ID")
TOKEN = os.environ.get("IG_ACCESS_TOKEN")
SECRET_KEY = os.environ.get("SECRET_KEY")

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
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_PATH}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = "supersecret"

db = SQLAlchemy(app)

# --------------------------------------------------
# Enable Cross-origin Resource Sharing, CORS so that React can call this server
# --------------------------------------------------

# All routes (/*) are accessible from any origin (*) (domain/port)
CORS(app, resources={r"/*": {"origins": "*"}})

# TODO: In production, restrict origins to only your React app's domain for security
# GET route to confirm the server is running
# CORS(
#     app,
#     resources={r"/api/*": {"origins": [
#         "http://localhost:5173",
#         "https://craftetc.se"
#     ]}}
# )

# --------------------------------------------------
# MODELS
# --------------------------------------------------
class Product(Model):
    __tablename__ = "product"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    brand = Column(String(50))
    price = Column(Float)
    description = Column(String(500))
    image_url = Column(Text)


class Favorite(Model):
    __tablename__ = "favorite"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("ab_user.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("product.id"), nullable=False)

    user = relationship(User)
    product = relationship(Product)


class CartItem(Model):
    __tablename__ = "cart_item"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("ab_user.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("product.id"), nullable=False)
    quantity = Column(Integer, default=1)

    user = relationship(User)
    product = relationship(Product)

# --------------------------------------------------
# APPBUILDER + ADMIN VIEWS
# --------------------------------------------------
with app.app_context():
    appbuilder = AppBuilder(app, db.session)

    # skapa alla tabeller (inkl ab_user)
    db.create_all()

    # Hämta SecurityManager
    sm = appbuilder.sm

    # Kontrollera om admin redan finns
    if not sm.find_user("admin"):
        admin_role = sm.find_role("Admin")
        sm.add_user(
            username="admin",
            first_name="Admin",
            last_name="User",
            email="admin@example.com",
            password="admin",  # byt gärna till ett säkert lösenord
            role=admin_role
        )
        print("Admin-användare skapad: admin / admin")

    class ProductView(ModelView):
        datamodel = SQLAInterface(Product)
        list_columns = ["name", "brand", "price", "description"]

    class FavoriteView(ModelView):
        datamodel = SQLAInterface(Favorite)
        list_columns = ["user", "product"]

    class CartItemView(ModelView):
        datamodel = SQLAInterface(CartItem)
        list_columns = ["user", "product", "quantity"]

    class CustomerAPI(BaseView):
        route_base = "/api"
        @expose("/create_customer", methods=["POST"])
        def create_customer(self):
            data = request.json
            first_name = data.get("first_name")
            last_name = data.get("last_name")
            email = data.get("email")
            password = data.get("password")

            # Kontrollera obligatoriska fält
            if not all([first_name, last_name, email, password]):
                return jsonify({"message": "First name, last name, email och password krävs"}), 400

            # Kolla om email redan finns
            if self.appbuilder.sm.find_user(email):
                return jsonify({"message": "Email finns redan"}), 400

            # Skapa användare
            user = User()
            user.first_name = first_name
            user.last_name = last_name
            user.username = email
            user.email = email
            user.password = generate_password_hash(password)
            user.active = True
            user.roles = [self.appbuilder.sm.find_role("Public")]
            user.groups = []

            try:
                self.appbuilder.session.add(user)
                self.appbuilder.session.commit()
                return jsonify({"message": "Konto skapat"}), 201
            except Exception as e:
                self.appbuilder.session.rollback()
                return jsonify({"message": f"Fel vid skapande av konto: {str(e)}"}), 500

    class LoginAPI(BaseView):
        route_base = "/api"
        @expose("/login_customer", methods=["POST"])
        def login_customer(self):
            try:
                data = request.get_json(silent=True)
                if not data:
                    return jsonify({"message": "Ingen data skickades"}), 400

                email = data.get("email", "").strip()
                password = data.get("password", "").strip()

                if not email or not password:
                    return jsonify({"message": "Email och lösenord krävs"}), 400

                # Autentisera med FAB:s inbyggda metod
                user = self.appbuilder.sm.auth_user_db(email, password)
                if not user:
                    return jsonify({"message": "Fel email eller lösenord"}), 401

                # Create a JWT
                payload = {
                    "user_id": user.id,
                    "email": user.email,
                    "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)  # Token expires in 1 hour

                }
                token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

                return jsonify({
                    "message": f"Inloggad som {user.first_name}",
                    "user": {
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "email": user.email
                    },
                     "token": token
                }), 200

            except Exception as e:
                import traceback
                print(traceback.format_exc())
                return jsonify({"message": "Serverfel"}), 500


    appbuilder.add_view(ProductView, "Products", category="Shop")
    appbuilder.add_view(FavoriteView, "Favorites", category="Shop")
    appbuilder.add_view(CartItemView, "Cart Items", category="Shop")
    appbuilder.add_view_no_menu(CustomerAPI)
    appbuilder.add_view_no_menu(LoginAPI)


# --------------------------------------------------
# Helper functions and classes
# --------------------------------------------------

def get_gallery():
    conn = sqlite3.connect('gallery.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, media_url FROM gallery")
    rows = cursor.fetchall()
    conn.close()
    # Convert rows to list of dicts
    return [
        {
            "id": row[0],
            "media_url": row[1]
        }
        for row in rows
    ]

# Help function to get all products from the SQLite database
# def get_products():
    conn = sqlite3.connect('products.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, media_url, name, brand, price, description FROM products")
    rows = cursor.fetchall()
    conn.close()
    # Konvertera rader till lista av dicts
    return [
        {
            "id": row[0],
            "media_url": row[1],
            "name": row[2],
            "brand": row[3],
            "price": row[4],
            "description": row[5]
        }
        for row in rows
    ]
# Fetch products from the SQLAlchemy database istead
def get_products():
    """Return all products from FAB database"""
    products = db.session.query(Product).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "brand": p.brand or "",
            "price": p.price,
            "description": p.description or "",
            "media_url": p.image_url or ""
        }
        for p in products
    ]


# Helper function to extract hashtags from a caption
def extract_tags(caption):
    if not caption:
        return []
    return [word[1:].lower() for word in caption.split() if word.startswith("#")]

# Helper function to check if caption has #add2shop hashtag
def has_add2shop(caption: str) -> bool:
    if not caption:
        return False
    return "#add2shop" in caption.lower()

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
    return jsonify(get_products())

# @app.route("/api/products/<int:product_id>")
# def api_product(product_id: int):
    """Return a single product by id or 404 if not found."""
    products = get_products()
    for p in products:
        if p.get("id") == product_id:
            return jsonify(p)
    return jsonify({"error": "Product not found"}), 404
# Fetch product from the SQLAlchemy database instead
@app.route("/api/products/<int:product_id>")
def api_product(product_id: int):
    product = db.session.query(Product).filter_by(id=product_id).first()
    if not product:
        return jsonify({"error": "Product not found"}), 404

    return jsonify({
        "id": product.id,
        "name": product.name,
        "brand": product.brand or "",
        "price": product.price,
        "description": product.description or "",
        "media_url": product.image_url or ""
    })

# --------------------------------------------------
# MAIN
# --------------------------------------------------
if __name__ == "__main__":
    # Start the Flask development server on port 5000
    # debug=True reloads the server automatically when files change
    app.run(host="0.0.0.0", port=5000, debug=True)
