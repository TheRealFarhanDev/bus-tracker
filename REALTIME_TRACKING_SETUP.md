# Real-Time GPS Tracking Setup

## Environment Variables Required

Create a `.env` file in the `frontend` directory with the following variables:

```env
# ThingSpeak IoT Platform Configuration
VITE_THINGSPEAK_CHANNEL_ID=3016167
VITE_THINGSPEAK_READ_API_KEY=IAW10EOLE91DGZOL
```

## How to Get ThingSpeak Credentials

1. **Create a ThingSpeak Account:**
   - Go to [ThingSpeak.com](https://thingspeak.com)
   - Sign up for a free account

2. **Create a New Channel:**
   - Click "New Channel"
   - Configure your channel with at least 2 fields:
     - Field 1: Latitude (GPS)
     - Field 2: Longitude (GPS)

3. **Get Your Credentials:**
   - Channel ID: Found in your channel URL (e.g., `https://thingspeak.com/channels/3016167`)
   - Read API Key: Found in your channel's "API Keys" tab

4. **Update Environment Variables:**
   - Replace the values in your `.env` file with your actual credentials

## Features

- **Real-time GPS Tracking:** Updates every 10 seconds
- **Interactive Map:** Uses Leaflet with OpenStreetMap
- **Bus Icon:** Custom bus marker on the map
- **Responsive Design:** Works on all devices
- **Protected Route:** Requires authentication to access

## Usage

1. Click the "Open Real-Time GPS Tracking" button in the Student Dashboard
2. The map will automatically load and start tracking
3. The bus location updates every 10 seconds
4. Click the bus marker to see coordinates

## Technical Details

- **Map Library:** Leaflet.js
- **Data Source:** ThingSpeak API
- **Update Frequency:** 10 seconds
- **Coordinates:** GPS latitude/longitude from IoT device 