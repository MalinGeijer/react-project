import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_appbuilder import AppBuilder

# --- Paths ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FOLDER = os.path.join(BASE_DIR, "data", "db")
DB_PATH = os.path.join(DB_FOLDER, "shop.db")
os.makedirs(DB_FOLDER, exist_ok=True)

# --- Flask app ---
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{DB_PATH}"
app.config['SECRET_KEY'] = 'supersecret'
app.config['CSRF_ENABLED'] = True

# --- Init database ---
db = SQLAlchemy(app)

# --- Init AppBuilder (in application context!) ---
with app.app_context():
    from flask_appbuilder.security.sqla.models import User
    appbuilder = AppBuilder(app, db.session)

    # skapa alla tabeller (inkl. ab_user)
    db.create_all()

print("Fab app ready")
