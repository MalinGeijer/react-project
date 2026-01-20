import sqlite3
import requests, os
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()
IG_USER_ID = os.environ.get("IG_USER_ID")
TOKEN = os.environ.get("IG_ACCESS_TOKEN")

# Create/open the database
conn = sqlite3.connect("../db/gallery.db")
# Create a cursor object to execute SQL commands
cursor = conn.cursor()
# Create the table if it doesn't exist
cursor.execute("""
CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    media_url TEXT
)
""")

# Delete all existing rows in the table
cursor.execute("DELETE FROM gallery")
# Save (commit) the changes and close the connection
conn.commit()
conn.close()

### Helper Functions ###

def has_add2shop(caption):
    """Check if the caption contains the hashtag #add2shop."""
    if not caption:
        return False
    # Split caption into words
    words = caption.split()
    for word in words:
        if word.lower() == "#add2shop":
            return True

def insert_image(image_url):
    """Add a new image with the given image URL to the database."""
    conn = sqlite3.connect("../db/gallery.db")
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO gallery (media_url)
        VALUES (?)
    """, (image_url,))
    conn.commit()
    conn.close()

# Fetch media from Instagram Graph API
url = f"https://graph.facebook.com/v21.0/{IG_USER_ID}/media"
params = {
    "fields": "id,media_type,media_url,caption,children{media_type,media_url}",
    "access_token": TOKEN,
    "limit": 30
}
# Response from the API including HTTP status, header and body
response = requests.get(url, params=params)
# Convert the response to JSON and get the data
items = response.json().get("data", [])

# Loop through each item in the response data
for item in items:
    # Get the value of the key "caption" from each item in the dictionary
    # If there is no caption, default to an empty string
    caption = item.get("caption", "")

    # Continue to the next item if #add2shop is not in the caption
    if not has_add2shop(caption):
        continue

    media_url = None

    if item["media_type"] == "IMAGE":
        media_url = item["media_url"]
    elif item["media_type"] == "CAROUSEL_ALBUM":
        # Get the first image from carousel children if available
        children = item.get("children", {}).get("data", [])
        # Loop through children to find the first image
        first_image = None
        for child in children:
            if child.get("media_type") == "IMAGE":
                first_image = child
                break
        # If an image was found among the children, get its media_url
        if first_image:
            media_url = first_image["media_url"]

    # Insert the product into the database if it has the hashtag and a media URL
    if media_url:
        insert_image(media_url)

print(f"Database 'gallery.db' created.")
