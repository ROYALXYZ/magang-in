import requests
import json
import time
import pandas as pd
from datetime import datetime

# ============================================================
# KONFIGURASI
# ============================================================
API_KEY  = "0bf76547-dab2-4685-a148-7a2b592bd01e"
API_URL  = f"https://jooble.org/api/{API_KEY}"
HEADERS  = {"Content-Type": "application/json"}


url = "https://jooble.org/api/" + API_KEY

headers = {
    "Content-Type": "application/json"
}

# 🔥 keyword & lokasi yang lebih realistis
keywords = ["magang", "intern", "magang IT"]
location = "Indonesia"

for keyword in keywords:
    print(f"\n🔍 Testing keyword: {keyword}")

    payload = {
        "keywords": keyword,
        "location": location
    }

    response = requests.post(url, headers=headers, data=json.dumps(payload))

    print("Status Code:", response.status_code)

    data = response.json()

    # 🔥 DEBUG RAW RESPONSE
    print("Keys:", data.keys())

    if "jobs" in data:
        jobs = data["jobs"]
        print(f"Jumlah jobs: {len(jobs)}")

        for job in jobs[:3]:  # tampilkan 3 aja dulu
            print("-" * 40)
            print("Title :", job.get("title"))
            print("Company :", job.get("company"))
            print("Location :", job.get("location"))
    else:
        print("❌ Tidak ada 'jobs' di response")
        print(data)
