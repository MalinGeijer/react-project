import sqlite3

# --------------------------------------------------
# Helper functions and classes
# --------------------------------------------------

def get_gallery():
    # Path realative to working directory
    conn = sqlite3.connect('data/db/gallery.db')
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
    conn = sqlite3.connect('data/db/products.db')
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
