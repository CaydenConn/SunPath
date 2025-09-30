# app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
from config import Config
import requests

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)  # Enable CORS for React frontend

def build_weather_api_call(lat_lon, aqi_option = "no", type = "current"):
    return f"{app.config['WEATHER_API_BASE_URL']}{type}.json?key={app.config['WEATHER_API_KEY']}&q={lat_lon}&aqi={aqi_option}"

# Routes
@app.route('/')
def home():
    return jsonify({"message": "Flask API is running!"})

@app.route('/api/get_user_pos_current_weather', methods=['GET'])
def get_user_pos_current_weather():
    lat_lon = request.args.get('lat_lon', '30.4383,-84.2807')  # Tallahassee coordinates
    aqi_option = request.args.get('aqi_option', 'yes')  # Default to include AQI
    weather_api_call = build_weather_api_call(lat_lon, aqi_option)
    response = requests.get(weather_api_call)
    data = response.json()
    
    return jsonify({"data": data})

@app.route('/api/data', methods=['POST'])
def post_data():
    data = request.get_json()
    return jsonify({"received": data, "status": "success"}), 201

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found"}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)