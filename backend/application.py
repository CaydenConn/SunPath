# app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
from config import Config
from models.database import initialize_firebase
from routes.users import users_bp
from routes.api import api_bp  # <-- added: register extra API routes (e.g., recent destinations)
import requests

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)  # Enable CORS for React frontend

# Initialize Firebase Admin SDK
initialize_firebase()

# Register blueprints
app.register_blueprint(users_bp)
app.register_blueprint(api_bp, url_prefix="/api")  # <-- added

def build_weather_api_call(lat_lon, type="current", days=1):
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
                'is_day': hour.get('is_day'),
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

@app.route('/api/generate_route', methods=['POST'])
def generate_route():
    """
    Generate a route from origin to destination using Google Directions API
    Request body: { origin_lat, origin_lon, destination_lat, destination_lon }
    Returns decoded polyline coordinates ready for map display
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body is required"}), 400

    origin_lat = data.get('origin_lat')
    origin_lon = data.get('origin_lon')
    destination_lat = data.get('destination_lat')
    destination_lon = data.get('destination_lon')

    # Validate all parameters are provided
    if not all([origin_lat, origin_lon, destination_lat, destination_lon]):
        return jsonify({"error": "Missing required parameters: origin_lat, origin_lon, destination_lat, destination_lon"}), 400

    try:
        # Build Google Directions API request
        origin_str = f"{origin_lat},{origin_lon}"
        dest_str = f"{destination_lat},{destination_lon}"
        url = (
            "https://maps.googleapis.com/maps/api/directions/json"
            f"?origin={origin_str}&destination={dest_str}&key={app.config['GOOGLE_MAPS_API_KEY']}"
        )

        # Call Google Directions API
        response = requests.get(url)
        data = response.json()

        if data.get('status') == 'OK' and data.get('routes'):
            route = data['routes'][0]

            # Return route data with decoded polyline
            return jsonify({
                "status": "success",
                "route": {
                    "overview_polyline": route['overview_polyline']['points'],
                    "bounds": route.get('bounds'),
                    "distance": route['legs'][0].get('distance'),
                    "duration": route['legs'][0].get('duration'),
                    "start_location": route['legs'][0]['start_location'],
                    "end_location": route['legs'][0]['end_location'],
                    "start_address": route['legs'][0].get('start_address'),
                    "end_address": route['legs'][0].get('end_address')
                }
            }), 200
        else:
            return jsonify({
                "error": "Route not found",
                "status": data.get('status'),
                "message": data.get('error_message', 'Could not calculate route')
            }), 404

    except Exception as e:
        return jsonify({"error": "Failed to generate route", "details": str(e)}), 500

@app.route('/api/data', methods=['POST'])
def post_data():
    data = request.get_json()
    return jsonify({"received": data, "status": "success"}), 201

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found"}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
