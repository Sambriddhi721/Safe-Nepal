import requests

# ✅ YOUR KEY IS NOW INTEGRATED
API_KEY = "3b2556b5414e1a2fb4f739c28ae3bc1b"
CITY = "Kathmandu" 

def get_live_weather():
    # We use 'units=metric' to get Celsius and mm for rainfall
    url = f"http://api.openweathermap.org/data/2.5/weather?q={CITY}&appid={API_KEY}&units=metric"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        if data.get("cod") != 200:
            print(f"Error from API: {data.get('message')}")
            return None
            
        # Extract features for your model
        # The 'rain' key is only present if it's currently raining
        rain_data = data.get("rain", {})
        rainfall = rain_data.get("1h", 0) # Default to 0 if no rain
        
        temp = data["main"]["temp"]
        humidity = data["main"]["humidity"]
        
        # Note: 'water_level' isn't in OpenWeather. Use a default or a sensor value.
        water_level = 3.5 
        
        # Return features in the EXACT ORDER your model was trained on
        # Example: [Rainfall, Water Level, Temperature, Humidity]
        return [rainfall, water_level, temp, humidity]
        
    except Exception as e:
        print(f"Connection Error: {e}")
        return None