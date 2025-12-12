# SunPath Project

This project consists of a Flask backend and a React Native (Expo) frontend.

## Prerequisites

- Node.js & npm
- Python 3.8+
- Expo CLI (`npm install -g expo-cli`)
- Firebase Account & Project
- WeatherAPI Key
- Google Maps API Key

---

## Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (optional but recommended):**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables:**
   Create a `.env` file in the `backend/` directory with the following variables:

   ```env
   # Firebase (Service Account Credentials JSON file path)
   FIREBASE_CREDENTIALS_PATH=path/to/your/firebase-adminsdk.json
   FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com

   # Weather API (https://www.weatherapi.com/)
   WEATHER_API_KEY=your_weather_api_key

   # Google Maps API
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key

   # Optional / Defaults
   SECRET_KEY=dev-secret-key-change-in-production
   JWT_SECRET_KEY=jwt-secret-string
   REDIS_URL=redis://localhost:6379/0
   ```
   
   > **Note:** You need to download a service account key JSON file from your Firebase Project Settings -> Service accounts, and provide the path to it in `FIREBASE_CREDENTIALS_PATH`.

5. **Run the Flask Application:**
   ```bash
   python application.py
   ```
   The backend will start on `http://0.0.0.0:5000` (accessible at `http://localhost:5000` or your machine's IP).

---

## Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend/react-native-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the `frontend/react-native-frontend/` directory with your Firebase configuration (found in Project Settings -> General -> Your apps -> Web app):

   ```env
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id
   
   # Backend API URL (use your computer's IP address if testing on device, or localhost for simulator)
   API_BASE_URL=http://<YOUR_IP_ADDRESS>:5000
   
   # Google Places API (for address autocomplete)
   GOOGLE_PLACES_API_KEY=your_google_places_api_key
   ```

4. **Start the Expo Development Server:**
   ```bash
   npx expo start
   ```
   or
   ```bash
   npm start
   ```

5. **Run the App:**
   - **Scan the QR code** with the Expo Go app on your Android/iOS device.
   - Or press `a` for Android Emulator.
   - Or press `i` for iOS Simulator.

