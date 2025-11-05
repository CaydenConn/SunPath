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

def build_weather_api_call(lat_lon, type = "current", days = 1):
    url = f"{app.config['WEATHER_API_BASE_URL']}{type}.json?key={app.config['WEATHER_API_KEY']}&q={lat_lon}"
    if type == "forecast":
        url += f"&days={days}"
    return url

# Routes
@app.route('/')
def home():
    return jsonify({"message": "Flask API is running!"})

@app.route('/api/get_user_pos_current_weather', methods=['GET'])
def get_user_pos_current_weather():
    lat_lon = request.args.get('lat_lon')
    
    if not lat_lon:
        return jsonify({"error": "User coordinates not provided"}), 400
    
    weather_api_call = build_weather_api_call(lat_lon, 'current')
    response = requests.get(weather_api_call)
    data = response.json()
    
    return jsonify({"data": data})

@app.route('/api/get_user_pos_forecast_weather', methods=['GET'])
def get_user_pos_forecast_weather():
    lat_lon = request.args.get('lat_lon')
    
    if not lat_lon:
        return jsonify({"error": "User coordinates not provided"}), 400
    
    hours = int(request.args.get('hours', 3))  # Default to 3 hours
    
    # Request 2 days to ensure we have enough hourly data
    weather_api_call = build_weather_api_call(lat_lon, 'forecast', days=2)
    response = requests.get(weather_api_call)
    data = response.json()
    
    # Print full response to console
    print("=" * 80)
    print("FULL WEATHER API RESPONSE:")
    print(data)
    print("=" * 80)
    
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
        
        # Format as forecast_hour_1, forecast_hour_2, etc. - temps, conditions, and wind
        forecast_dict = {}
        for i, hour in enumerate(future_hours, start=1):
            forecast_dict[f'forecast_hour_{i}'] = {
                'time': hour.get('time'),
                'temp_c': hour.get('temp_c'),
                'temp_f': hour.get('temp_f'),
                'condition': hour.get('condition'),
                'wind_mph': hour.get('wind_mph'),
                'wind_kph': hour.get('wind_kph'),
                'wind_degree': hour.get('wind_degree'),
                'wind_dir': hour.get('wind_dir')
            }
        
        # Return modified data with numbered hours (no current weather)
        return jsonify({
            "data": {
                "location": data.get('location'),
                "forecast": forecast_dict
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