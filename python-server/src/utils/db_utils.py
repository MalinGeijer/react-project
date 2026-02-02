import sqlite3
from typing import Dict
from pathlib import Path

DB_PATH = Path('data/db')

# --------------------------------------------------
# Helper functions for SQLite databases
# --------------------------------------------------

def get_gallery() -> list[Dict]:
    """
    Retrieve all entries from the gallery database.

    Returns:
        list[Dict]: List of dictionaries with keys 'id' and 'media_url'.
    """
    # Path relative to working directory 
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

def get_products() -> list[Dict]:
    """
    Retrieve all entries from the products database.

    Returns:
        list[Dict]: List of dictionaries with product info.
    """
    conn = sqlite3.connect(DB_PATH/'products.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, brand, price, image_url, description FROM products")
    rows = cursor.fetchall()
    conn.close()
    # Convert rows to list of dicts
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
    """
    Add a product to the products database.

    Args:
        product (Dict): Dictionary containing keys 'id', 'name', 'brand', 'price', 'description', 'image_url'.
    """
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
    """
    Delete a product from the products database by ID.

    Args:
        product_id (int): ID of the product to delete.

    Returns:
        bool: True if a row was deleted, False otherwise.
    """
    conn = sqlite3.connect(DB_PATH/'products.db')
    c = conn.cursor()
    c.execute("DELETE FROM products WHERE id = ?", (product_id,))
    changed = c.rowcount
    conn.commit()
    conn.close()
    return changed > 0
