import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Bus, MapPin, Clock, Play, Pause, RotateCcw, Navigation, Users, Timer, AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { routesAPI } from '../services/api';
import socketService from '../services/socket';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Enhanced bus icon with pulsing animation
const busIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="#000000" stroke="white" stroke-width="2">
      <rect x="3" y="5" width="18" height="10" rx="2" />
      <circle cx="7" cy="18" r="2"/>
      <circle cx="17" cy="18" r="2"/>
      <line x1="3" y1="11" x2="21" y2="11"/>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

// Stop marker icon
const stopIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#2563eb" stroke="white" stroke-width="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

// Hassan coordinates for demo route
const demoStopCoordinates = {
  "Hassan Bus Stand": { lat: 13.0075, lng: 76.0982 },
  "City Center": { lat: 13.0055, lng: 76.1021 },
  "Medical College": { lat: 13.0110, lng: 76.1055 },
  "Engineering College": { lat: 13.0150, lng: 76.1100 },
  "Final College": { lat: 13.0200, lng: 76.1150 },
};

function StudentDashboard() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [busStatus, setBusStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRouteData, setSelectedRouteData] = useState(null);
  const [demoPlaying, setDemoPlaying] = useState(false);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const demoIntervalRef = useRef(null);
  const navigate = useNavigate();

  // Demo route for presentation
  const demoRoute = {
    id: "demo-hackathon",
    name: "🎯 Hackathon Demo Route",
    stops: [
      { name: "Hassan Bus Stand", time: "NOW", ...demoStopCoordinates["Hassan Bus Stand"] },
      { name: "City Center", time: "3 min", ...demoStopCoordinates["City Center"] },
      { name: "Medical College", time: "6 min", ...demoStopCoordinates["Medical College"] },
      { name: "Engineering College", time: "9 min", ...demoStopCoordinates["Engineering College"] },
      { name: "Final College", time: "12 min", ...demoStopCoordinates["Final College"] }
    ],
    isDemo: true,
    description: "Quick demo route for presentation"
  };

  // Fetch routes from backend
  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching routes from backend...');
      const response = await routesAPI.getRoutes();
      const backendRoutes = response.data.routes || [];
      
      console.log('✅ Backend routes loaded:', backendRoutes.length, 'routes');
      
      // Process backend routes to add lat/lng coordinates
      const processedBackendRoutes = backendRoutes.map(route => ({
        ...route,
        stops: route.stops.map((stop, index) => {
          const lat = stop.coordinates?.lat || stop.lat || 13.0038;
          const lng = stop.coordinates?.lng || stop.lng || 76.0714;
          
          // Debug logging for missing coordinates
          if (!stop.coordinates?.lat || !stop.coordinates?.lng) {
            console.log(`⚠️ Missing coordinates for ${route.name} - ${stop.name}, using fallback:`, { lat, lng });
          }
          
          return {
            ...stop,
            // Extract lat/lng from coordinates object or use fallback
            lat,
            lng,
            // Keep original coordinates for reference
            coordinates: stop.coordinates || { lat, lng }
          };
        })
      }));
      
      // Combine demo route with processed backend routes
      const allRoutes = [demoRoute, ...processedBackendRoutes];
      setRoutes(allRoutes);
      
      console.log('📋 Total routes available:', allRoutes.length);
      
      // Set first route as default if none selected
      if (!selectedRoute && allRoutes.length > 0) {
        setSelectedRoute(allRoutes[0].id);
        setSelectedRouteData(allRoutes[0]);
        console.log('🎯 Default route selected:', allRoutes[0].name);
      }
      
    } catch (err) {
      console.error('❌ Error fetching routes:', err);
      setError('Failed to load routes from backend. Using demo route only.');
      // Fallback to demo route only
      setRoutes([demoRoute]);
      setSelectedRoute(demoRoute.id);
      setSelectedRouteData(demoRoute);
      console.log('🔄 Fallback to demo route only');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
    
    // Try to connect to socket
    try {
      socketService.connect();
      setConnectionStatus('connected');
      
      socketService.onBusUpdate((data) => {
        setBusStatus(data);
        if (data.routeId === selectedRoute) {
          setCurrentStopIndex(data.currentStopIndex);
        }
      });
      
      socketService.onSimulationStatus((data) => {
        console.log('Simulation status:', data);
      });
    } catch (error) {
      console.log('Socket connection failed, using demo mode');
      setConnectionStatus('demo');
    }

    return () => {
      socketService.disconnect();
      stopDemoSimulation();
    };
  }, []);

  // Update selected route data when route changes
  useEffect(() => {
    if (selectedRoute && routes.length > 0) {
      const routeData = routes.find(route => route.id === selectedRoute);
      setSelectedRouteData(routeData);
    }
  }, [selectedRoute, routes]);

  const startDemoSimulation = () => {
    if (!selectedRouteData || demoPlaying) return;
    
    setDemoPlaying(true);
    setCurrentStopIndex(0);
    
    const interval = selectedRouteData.isDemo ? 5000 : 5000; // Faster for demo route
    
    demoIntervalRef.current = setInterval(() => {
      setCurrentStopIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % selectedRouteData.stops.length;
        const currentStop = selectedRouteData.stops[nextIndex];
        
        setBusStatus({
          routeId: selectedRoute,
          currentStopIndex: nextIndex,
          currentStopName: currentStop.name,
          totalStops: selectedRouteData.stops.length,
          location: { 
            lat: currentStop.lat || 13.0038, 
            lng: currentStop.lng || 76.0714 
          },
          eta: currentStop.time,
          timestamp: Date.now(),
          status: nextIndex === 0 ? 'starting' : 'moving',
          progress: Math.round((nextIndex / selectedRouteData.stops.length) * 100)
        });
        
        return nextIndex;
      });
    }, interval);
  };

  const stopDemoSimulation = () => {
    setDemoPlaying(false);
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }
  };

  const resetDemoSimulation = () => {
    stopDemoSimulation();
    setCurrentStopIndex(0);
    setBusStatus(null);
  };

  const handleRouteChange = (value) => {
    setSelectedRoute(value);
    // setSelectedRouteData(demoRoutes.find(r => r.id === value)); // This line is no longer needed
    resetDemoSimulation();
  };

  // Generate route path for map
  const getRoutePath = () => {
    if (!selectedRouteData) return [];
    
    // Filter out stops with invalid coordinates
    const validStops = selectedRouteData.stops.filter(stop => 
      stop.lat && stop.lng && !isNaN(stop.lat) && !isNaN(stop.lng)
    );
    
    if (validStops.length === 0) {
      console.warn('⚠️ No valid coordinates found for route path');
      return [];
    }
    
    return validStops.map(stop => [stop.lat, stop.lng]);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    console.log('User logged out.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Bus className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">NCE Bus Tracker</h1>
                <p className="text-blue-100 flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  Real-time NCE College Bus Tracking
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  connectionStatus === 'connected' ? 'bg-green-500/20 text-green-100' :
                  connectionStatus === 'demo' ? 'bg-yellow-500/20 text-yellow-100' :
                  'bg-red-500/20 text-red-100'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' :
                    connectionStatus === 'demo' ? 'bg-yellow-400' : 'bg-red-400'
                  }`}></div>
                  {connectionStatus === 'connected' ? 'Live Connected' :
                   connectionStatus === 'demo' ? 'Demo Mode' : 'Offline'}
                </div>
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
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Route Selection Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Select Your Route</h2>
                <p className="text-gray-600">Choose your bus route to track in real-time</p>
              </div>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={fetchRoutes}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Routes</span>
            </button>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Connection Error</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}
          
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="route-select" className="block text-sm font-semibold text-gray-700 mb-2">
                  Available Routes
                </label>
                <select
                  id="route-select"
                  value={selectedRoute}
                  onChange={(e) => handleRouteChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900"
                >
                  <option value="">Select a route...</option>
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.name} • {route.stops.length} stops
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedRouteData && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Bus className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">{selectedRouteData.name}</span>
                  </div>
                  {selectedRouteData.description && (
                    <p className="text-sm text-blue-700">{selectedRouteData.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-blue-800">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {selectedRouteData.stops.length} stops
                    </span>
                    <span className="flex items-center gap-1">
                      <Timer className="w-4 h-4" />
                      ~{selectedRouteData.isDemo ? '10' : '30'} min
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Demo Controls */}
            {selectedRoute && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {selectedRouteData?.isDemo ? 'Hackathon Demo Controls' : 'Demo Controls'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={startDemoSimulation}
                      disabled={demoPlaying}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                    >
                      <Play className="w-4 h-4" />
                      <span className="hidden sm:inline">Start</span>
                    </button>
                    <button
                      onClick={stopDemoSimulation}
                      disabled={!demoPlaying}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                    >
                      <Pause className="w-4 h-4" />
                      <span className="hidden sm:inline">Stop</span>
                    </button>
                    <button
                      onClick={resetDemoSimulation}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span className="hidden sm:inline">Reset</span>
                    </button>
                  </div>
                </div>
                
                {selectedRouteData?.isDemo && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Quick Demo Mode</span>
                    </div>
                    <p className="text-xs text-yellow-700 mt-1">
                      Optimized for presentations - bus moves every 2 seconds
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Live Bus Status */}
        {selectedRoute && busStatus && busStatus.routeId === selectedRoute && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Bus className="w-6 h-6 text-green-600" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-800">🚌 Bus Live Status</h3>
                <p className="text-green-600 text-sm">Real-time location tracking</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Current Location</span>
                </div>
                <div className="text-lg font-bold text-blue-800">{busStatus.currentStopName}</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Navigation className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Progress</span>
                </div>
                <div className="text-lg font-bold text-green-800">
                  {busStatus.currentStopIndex + 1} / {busStatus.totalStops}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">ETA</span>
                </div>
                <div className="text-lg font-bold text-purple-800">{busStatus.eta}</div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-600">Status</span>
                </div>
                <div className="text-lg font-bold text-orange-800 capitalize">
                  {busStatus.status || 'Moving'}
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Route Progress</span>
                <span className="text-sm font-bold text-gray-800">{busStatus.progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${busStatus.progress || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Leaflet Map */}
        {selectedRoute && selectedRouteData && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Navigation className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Live Bus Tracking</h3>
                  <p className="text-gray-600">{selectedRouteData.name} - Real-time map view</p>
                </div>
              </div>
              
              {selectedRouteData.isDemo && (
                <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  🎯 Demo Route
                </div>
              )}
            </div>
            
            <div className="h-[500px] w-full rounded-lg overflow-hidden border-2 border-gray-200">
              <MapContainer
                center={[13.01, 76.10]} // Hassan center
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Route polyline */}
                <Polyline 
                  positions={getRoutePath()} 
                  color="#3b82f6" 
                  weight={6}
                  opacity={0.7}
                />
                
                {/* Route stops */}
                {selectedRouteData.stops.map((stop, index) => {
                  // Safety check for valid coordinates
                  if (!stop.lat || !stop.lng || isNaN(stop.lat) || isNaN(stop.lng)) {
                    console.warn(`⚠️ Invalid coordinates for stop ${stop.name}:`, { lat: stop.lat, lng: stop.lng });
                    return null; // Skip this marker
                  }
                  
                  return (
                    <Marker
                      key={index}
                      position={[stop.lat, stop.lng]}
                      icon={index === currentStopIndex && busStatus ? busIcon : stopIcon}
                    >
                      <Popup>
                        <div className="text-center p-2">
                          <div className="font-bold text-lg mb-1">{stop.name}</div>
                          <div className="text-sm text-gray-600 mb-2">
                            Stop {index + 1} of {selectedRouteData.stops.length}
                          </div>
                          {index === currentStopIndex && busStatus ? (
                            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                              🚌 Bus is here!
                            </div>
                          ) : (
                            <div className="text-sm text-blue-600 font-medium">
                              ETA: {stop.time}
                            </div>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </div>
        )}

        {/* Enhanced Route Schedule */}
        {selectedRoute && selectedRouteData && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Route Schedule</h3>
                <p className="text-gray-600">{selectedRouteData.name} - Stop timings and status</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {selectedRouteData.stops.map((stop, index) => (
                <div
                  key={index}
                  className={`relative flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${
                    index === currentStopIndex && busStatus
                      ? 'bg-gradient-to-r from-green-100 to-green-50 border-2 border-green-400 shadow-md'
                      : index < currentStopIndex && busStatus
                      ? 'bg-gray-50 text-gray-500 border border-gray-200'
                      : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {/* Stop indicator line */}
                  {index < selectedRouteData.stops.length - 1 && (
                    <div className={`absolute left-8 top-12 w-0.5 h-8 ${
                      index < currentStopIndex && busStatus ? 'bg-green-400' : 'bg-gray-300'
                    }`}></div>
                  )}
                  
                  <div className="flex items-center gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      index === currentStopIndex && busStatus
                        ? 'bg-green-500 text-white animate-pulse'
                        : index < currentStopIndex && busStatus
                        ? 'bg-gray-400 text-white'
                        : 'bg-blue-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    
                    <div>
                      <div className="font-semibold text-gray-900">{stop.name}</div>
                      {index === currentStopIndex && busStatus && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-green-600 font-medium">Bus is here now!</span>
                        </div>
                      )}
                      {index < currentStopIndex && busStatus && (
                        <div className="text-sm text-gray-500 mt-1">Completed ✓</div>
                      )}
                    </div>
                  </div>
                  
                  <div className={`text-right ${
                    index === currentStopIndex && busStatus
                      ? 'text-green-600 font-bold'
                      : 'text-gray-600'
                  }`}>
                    <div className="font-medium">{stop.time}</div>
                    {index === currentStopIndex && busStatus && (
                      <div className="text-sm text-green-500">Current</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions for New Users */}
        {!selectedRoute && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-xl p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">
                🎯 Welcome to Navkis Bus Tracker
              </h3>
              <div className="max-w-2xl mx-auto text-blue-800 space-y-3">
                <p className="text-lg">
                  <strong>Select a route above</strong> to start tracking Navkis college bus in real-time
                </p>
                <div className="grid md:grid-cols-2 gap-6 mt-6 text-left">
                  <div className="space-y-3">
                    <h4 className="font-bold text-blue-900 flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      Demo Instructions:
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li>• <strong>Choose "🎯 Hackathon Demo Route"</strong> for quick presentation</li>
                      <li>• <strong>Click "Start Demo"</strong> to simulate live bus movement</li>
                      <li>• <strong>Watch the map</strong> as the bus moves between stops</li>
                      <li>• <strong>Real-time updates</strong> show current location and ETA</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-bold text-blue-900 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Features:
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li>• <strong>Live tracking</strong> with interactive map</li>
                      <li>• <strong>Real Hassan locations</strong> used by college students</li>
                      <li>• <strong>Route progress</strong> and arrival predictions</li>
                      <li>• <strong>Mobile-friendly</strong> responsive design</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;