import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, LogOut, Bus, Navigation } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function RealTimeTracking() {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const navigate = useNavigate();

  // Environment variables (you'll need to add these to your .env file)
  const channelID = import.meta.env.VITE_THINGSPEAK_CHANNEL_ID || '3016167';
  const readAPIKey = import.meta.env.VITE_THINGSPEAK_READ_API_KEY || 'IAW10EOLE91DGZOL';

  useEffect(() => {
    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([0, 0], 15);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 30,
      }).addTo(mapInstanceRef.current);

      // Create bus icon
      const busIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/128/416/416597.png',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
      });

      // Create marker
      markerRef.current = L.marker([0, 0], { icon: busIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup('🚌 Live Bus Location')
        .openPopup();
    }

    // Fetch location function
    const fetchLocation = async () => {
      try {
        const url = `https://api.thingspeak.com/channels/${channelID}/feeds.json?api_key=${readAPIKey}&results=1`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.feeds && data.feeds.length > 0) {
          const feed = data.feeds[0];
          const lat = parseFloat(feed.field1);
          const lng = parseFloat(feed.field2);
          
          if (!isNaN(lat) && !isNaN(lng)) {
            markerRef.current.setLatLng([lat, lng]);
            mapInstanceRef.current.setView([lat, lng], 15);
            markerRef.current.getPopup().setContent(`🚌 Live Bus Location<br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // Initial fetch
    fetchLocation();
    
    // Set up interval
    const interval = setInterval(fetchLocation, 10000);

    // Cleanup
    return () => {
      clearInterval(interval);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [channelID, readAPIKey]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation Bar */}
      <nav className="bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Bus className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold">Real-Time Bus Tracking</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Map Container */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Navigation className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Live GPS Tracking</h2>
              <p className="text-gray-600">Real-time bus location from ThingSpeak IoT platform</p>
            </div>
          </div>
          
          {/* Map Container - Fixed to match original HTML */}
          <div className="h-[400px] w-4/5 mx-auto rounded-lg overflow-hidden border-2 border-gray-200">
            <div ref={mapRef} className="h-full w-full" />
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">IoT Integration</h4>
                <p className="text-blue-800 text-sm">
                  This map shows real-time bus location data from ThingSpeak IoT platform. 
                  The bus location is updated every 10 seconds using GPS coordinates.
                </p>
                <div className="text-xs text-blue-700 mt-2">
                  <strong>Channel ID:</strong> {channelID} | <strong>API Key:</strong> {readAPIKey.substring(0, 8)}...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RealTimeTracking; 