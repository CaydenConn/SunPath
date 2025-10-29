# app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
from config import Config
from models.database import initialize_firebase
from routes.users import users_bp
import requests

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)  # Enable CORS for React frontend

# Initialize Firebase Admin SDK
initialize_firebase()

# Register blueprints
app.register_blueprint(users_bp)

def build_weather_api_call(lat_lon, aqi_option = "no", type = "current", days = 1):
    url = f"{app.config['WEATHER_API_BASE_URL']}{type}.json?key={app.config['WEATHER_API_KEY']}&q={lat_lon}&aqi={aqi_option}"
    if type == "forecast":
        url += f"&days={days}"
    return url

# Routes
@app.route('/')
def home():
    return jsonify({"message": "Flask API is running!"})

@app.route('/api/get_user_pos_current_weather', methods=['GET'])
def get_user_pos_current_weather():
    lat_lon = request.args.get('lat_lon', '30.4383,-84.2807')  # Tallahassee coordinates
    aqi_option = request.args.get('aqi_option', 'yes')  # Default to include AQI
    weather_api_call = build_weather_api_call(lat_lon, aqi_option, 'current')
    response = requests.get(weather_api_call)
    data = response.json()
    
    return jsonify({"data": data})

@app.route('/api/get_user_pos_forecast_weather', methods=['GET'])
def get_user_pos_forecast_weather():
    lat_lon = request.args.get('lat_lon', '30.4383,-84.2807')
    hours = int(request.args.get('hours', 9))  # Default to 9 hours
    
    # Request 2 days to ensure we have enough hourly data
    weather_api_call = build_weather_api_call(lat_lon, 'no', 'forecast', days=2)
    response = requests.get(weather_api_call)
    data = response.json()
    
    # Extract next N hours from current time
    if 'location' in data and 'forecast' in data:
        current_time = data['location']['localtime_epoch']
        
        # Get all hourly forecasts from all forecast days
        all_hours = []
        for day in data['forecast']['forecastday']:
            all_hours.extend(day['hour'])
        
        # Filter to only future hours and limit to requested number
        future_hours = [
            hour for hour in all_hours 
            if hour['time_epoch'] >= current_time
        ][:hours]
        
        # Return modified data with only next N hours
        return jsonify({
            "data": {
                "current": data.get('current'),
                "location": data.get('location'),
                "forecast": {
                    "next_hours": future_hours
                }
            }
        })
    
    # Fallback to original response if structure is unexpected
    return jsonify({"data": data})

@app.route('/api/data', methods=['POST'])
def post_data():
    data = request.get_json()
    return jsonify({"received": data, "status": "success"}), 201

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found"}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)