import sqlite3
from typing import Dict
from pathlib import Path

DB_PATH = Path('data/db')

# --------------------------------------------------
# Helper functions and classes
# --------------------------------------------------

def get_gallery():
    # Path realative to working directory
    conn = sqlite3.connect(DB_PATH/'gallery.db')
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

def get_products():
    conn = sqlite3.connect(DB_PATH/'products.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, brand, price, image_url, description FROM products")
    rows = cursor.fetchall()
    conn.close()
    # Konvertera rader till lista av dicts
    return [
        {
            "id": row[0],
            "name": row[1],
            "brand": row[2],
            "price": row[3],
            "image_url": row[4],
            "description": row[5]
        }
        for row in rows
    ]

def add_product(product: Dict) -> None:
    conn = sqlite3.connect(DB_PATH/'products.db')
    c = conn.cursor()
    c.execute("""
        INSERT INTO products (id, name, brand, price, description, image_url)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (product["id"], product["name"], product["brand"], product["price"],
          product["description"], product["image_url"]))
    conn.commit()
    conn.close()

def delete_product(product_id: int) -> bool:
    conn = sqlite3.connect(DB_PATH/'products.db')
    c = conn.cursor()
    c.execute("DELETE FROM products WHERE id = ?", (product_id,))
    changed = c.rowcount
    conn.commit()
    conn.close()
    return changed > 0
