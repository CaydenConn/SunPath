# backend/routes/api.py
from flask import Blueprint, jsonify, request, current_app
import requests

api_bp = Blueprint("api", __name__, url_prefix="/api")

def build_weather_api_call(base_url: str, key: str, lat_lon: str, aqi_option="no", kind="current"):
    return f"{base_url}{kind}.json?key={key}&q={lat_lon}&aqi={aqi_option}"

@api_bp.get("/health")
def health():
    return jsonify({"status": "ok"})

# Avoids colliding with your existing /api/get_user_pos_current_weather route
@api_bp.get("/weather/current")
def weather_current():
    lat_lon = request.args.get("lat_lon", "30.4383,-84.2807")
    aqi_option = request.args.get("aqi_option", "yes")

    base = current_app.config.get("WEATHER_API_BASE_URL", "http://api.weatherapi.com/v1/")
    key = current_app.config.get("WEATHER_API_KEY")
    if not key:
        return jsonify({"error": "WEATHER_API_KEY not configured"}), 500

    url = build_weather_api_call(base, key, lat_lon, aqi_option, "current")
    r = requests.get(url, timeout=10)
    return jsonify({"data": r.json()})
