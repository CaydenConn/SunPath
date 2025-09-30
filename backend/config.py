import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask Configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-string'
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour
    
    # Firebase Configuration
    FIREBASE_CREDENTIALS_PATH = os.environ.get('FIREBASE_CREDENTIALS_PATH')
    FIREBASE_DATABASE_URL = os.environ.get('FIREBASE_DATABASE_URL')
    
    # Redis Configuration
    REDIS_URL = os.environ.get('REDIS_URL') or 'redis://localhost:6379/0'
    
    # Weather API Configuration
    WEATHER_API_KEY = os.environ.get('WEATHER_API_KEY')
    WEATHER_API_BASE_URL = 'http://api.weatherapi.com/v1/'
    
    # Google Maps Configuration
    GOOGLE_MAPS_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY')
    
    # App Configuration
    CACHE_TTL = 300  # 5 minutes for weather data
    ROUTE_CACHE_TTL = 600  # 10 minutes for route data
    MAX_ROUTE_ALTERNATIVES = 3
    
    # Weather Preference Weights
    WEATHER_WEIGHTS = {
        'temperature': 0.3,
        'precipitation': 0.4,
        'wind': 0.2,
        'visibility': 0.1
    }
