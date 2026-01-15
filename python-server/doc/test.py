import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables from the.env file
load_dotenv()
IG_USER_ID = os.environ.get("IG_USER_ID")
TOKEN = os.environ.get("IG_ACCESS_TOKEN")
OUTPUT_FILE = "instagram_media.json"

# 1. Hämta listan med media IDs
url_media = f"https://graph.facebook.com/v21.0/{IG_USER_ID}/media"
params_media = {
    "access_token": TOKEN,
    "limit": 50
}

response = requests.get(url_media, params=params_media)
if response.status_code != 200:
    print("Fel vid hämtning av media-lista:", response.status_code, response.text)
    exit()

media_list = response.json().get("data", [])
print(f"Hittade {len(media_list)} media IDs")

all_media_data = []

# 2. Loop genom varje media ID och hämta full info
for media in media_list:
    media_id = media["id"]
    url_detail = f"https://graph.facebook.com/v21.0/{media_id}"

    params_detail = {
        "fields": "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,children",
        "access_token": TOKEN
    }

    resp_detail = requests.get(url_detail, params=params_detail)
    if resp_detail.status_code != 200:
        print(f"Fel vid hämtning av media {media_id}:", resp_detail.status_code, resp_detail.text)
        continue

    data = resp_detail.json()
    all_media_data.append(data)

# 3. Skriv all data till fil
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(all_media_data, f, indent=2, ensure_ascii=False)

print(f"All media-data sparad till {OUTPUT_FILE}")
