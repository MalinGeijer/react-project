import os
import sqlite3
import requests
from dotenv import load_dotenv

# --------------------------------------------------
# Environment variables
# --------------------------------------------------
load_dotenv()
IG_USER_ID = os.environ.get("IG_USER_ID")
TOKEN = os.environ.get("IG_ACCESS_TOKEN")

# --------------------------------------------------
# Database setup
# --------------------------------------------------
DB_PATH = "../db/gallery.db"

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    media_url TEXT
)
""")

# Clear existing data
cursor.execute("DELETE FROM gallery")
conn.commit()
conn.close()

# --------------------------------------------------
# Helper functions
# --------------------------------------------------
def has_add2shop(caption: str) -> bool:
    """
    Check whether an Instagram caption contains the hashtag '#add2shop'.

    Args:
        caption (str): Instagram post caption.

    Returns:
        bool: True if hashtag is present, otherwise False.
    """
    if not caption:
        return False

    words = caption.split()
    for word in words:
        if word.lower() == "#add2shop":
            return True

    return False


def insert_image(image_url: str) -> None:
    """
    Insert an image URL into the gallery database.

    Args:
        image_url (str): URL of the image to store.
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO gallery (media_url) VALUES (?)",
        (image_url,)
    )
    conn.commit()
    conn.close()

# --------------------------------------------------
# Fetch media from Instagram Graph API
# --------------------------------------------------
url = f"https://graph.facebook.com/v21.0/{IG_USER_ID}/media"
params = {
    "fields": "id,media_type,media_url,caption,children{media_type,media_url}",
    "access_token": TOKEN,
    "limit": 30
}

response = requests.get(url, params=params)
items = response.json().get("data", [])

# --------------------------------------------------
# Process media items
# --------------------------------------------------
for item in items:
    caption = item.get("caption", "")

    # Skip posts without #add2shop hashtag
    if not has_add2shop(caption):
        continue

    media_url = None

    if item.get("media_type") == "IMAGE":
        media_url = item.get("media_url")

    elif item.get("media_type") == "CAROUSEL_ALBUM":
        children = item.get("children", {}).get("data", [])
        for child in children:
            if child.get("media_type") == "IMAGE":
                media_url = child.get("media_url")
                break

    if media_url:
        insert_image(media_url)

print("Database 'gallery.db' updated.") 
