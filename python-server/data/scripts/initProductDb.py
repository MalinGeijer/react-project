import sqlite3
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent
GALLERY_DB = BASE_DIR / "../db/gallery.db"
PRODUCTS_DB = BASE_DIR / "../db/products.db"


# Hardcoded defaults
DEFAULT_NAME = "TBD"
DEFAULT_BRAND = "Craft Etc"
DEFAULT_PRICE = 200
DEFAULT_DESCRIPTION = (
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor "
    "incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud "
    "exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure "
    "dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
)

def main():
    # Connect to gallery.db
    gallery_conn = sqlite3.connect(GALLERY_DB)
    gallery_cursor = gallery_conn.cursor()

    # Fetch media_url from gallery table
    gallery_cursor.execute("SELECT media_url FROM gallery")
    rows = gallery_cursor.fetchall()

    # Connect to (or create) products.db
    products_conn = sqlite3.connect(PRODUCTS_DB)
    products_cursor = products_conn.cursor()

    # Create products table
    products_cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            brand TEXT NOT NULL,
            price INTEGER NOT NULL,
            image_url TEXT NOT NULL,
            description TEXT NOT NULL
        )
    """)

    # Insert products
    for (media_url,) in rows:
        products_cursor.execute("""
            INSERT INTO products (name, brand, price, image_url, description)
            VALUES (?, ?, ?, ?, ?)
        """, (
            DEFAULT_NAME,
            DEFAULT_BRAND,
            DEFAULT_PRICE,
            media_url,
            DEFAULT_DESCRIPTION
        ))

    products_conn.commit()

    gallery_conn.close()
    products_conn.close()

    print(f"✅ Imported {len(rows)} products into {PRODUCTS_DB}")

if __name__ == "__main__":
    main()
