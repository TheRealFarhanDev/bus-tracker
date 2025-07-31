import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { routesAPI, adminAPI } from '../services/api';
import Chatbot from '../components/Chatbot';
import { 
  Settings, 
  Play, 
  Square, 
  Bus, 
  Route, 
  Users, 
  Clock, 
  Activity, 
  BarChart3, 
  MapPin, 
  AlertCircle, 
  CheckCircle,
  RefreshCw,
  Monitor,
  Calendar,
  Timer,
  LogOut
} from 'lucide-react';

function AdminPanel() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [simulationStatus, setSimulationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Demo route for presentation
  const demoRoute = {
    id: "demo-hackathon",
    name: "🎯 Hackathon Demo Route",
    stops: [
      { name: "Hassan Bus Stand", time: "9:00 AM" },
      { name: "City Center", time: "9:03 AM" },
      { name: "Medical College", time: "9:06 AM" },
      { name: "Engineering College", time: "9:09 AM" },
      { name: "Final College", time: "9:12 AM" }
    ],
    isDemo: true,
    description: "Quick demo route for presentation"
  };

  // Fetch routes from backend
  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Admin: Fetching routes from backend...');
      const response = await routesAPI.getRoutes();
      const backendRoutes = response.data.routes || [];
      
      console.log('✅ Admin: Backend routes loaded:', backendRoutes.length, 'routes');
      
      // Combine demo route with backend routes
      const allRoutes = [demoRoute, ...backendRoutes];
      setRoutes(allRoutes);
      
      console.log('📋 Admin: Total routes available:', allRoutes.length);
      
      // Set first route as default if none selected
      if (!selectedRoute && allRoutes.length > 0) {
        setSelectedRoute(allRoutes[0].id);
        console.log('🎯 Admin: Default route selected:', allRoutes[0].name);
      }
      
    } catch (err) {
      console.error('❌ Admin: Error fetching routes:', err);
      setError('Failed to load routes from backend. Using demo route only.');
      // Fallback to demo route only
      setRoutes([demoRoute]);
      setSelectedRoute(demoRoute.id);
      console.log('🔄 Admin: Fallback to demo route only');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 Admin Panel: Initializing...');
    fetchRoutes();
    loadSimulationStatus();
    
    // Set up periodic status updates
    const statusInterval = setInterval(() => {
      loadSimulationStatus();
      setLastUpdated(new Date());
    }, 5000);

    return () => clearInterval(statusInterval);
  }, []);

  const loadRoutes = async () => {
    try {
      await fetchRoutes();
    } catch (error) {
      console.error('Error loading routes:', error);
      setError('Failed to load routes');
    }
  };

  const loadSimulationStatus = async () => {
    try {
      const response = await adminAPI.getStatus();
      setSimulationStatus(response.data.status);
      setConnectionStatus('connected');
    } catch (err) {
      console.log('Simulation status not available, using demo mode');
      setConnectionStatus('demo');
    }
  };

  const startSimulation = async () => {
    if (!selectedRoute) {
      alert('Please select a route first');
      return;
    }

    try {
      setSimulationLoading(true);
      console.log('🚀 Starting simulation for route:', selectedRoute);
      
      // Always try to call the API, regardless of connection status
      try {
        const response = await adminAPI.startSimulation(selectedRoute);
        console.log('✅ Backend simulation started:', response.data);
        setConnectionStatus('connected');
      } catch (apiError) {
        console.log('⚠️ Backend API failed, using demo mode');
        setConnectionStatus('demo');
      }
      
      const routeName = routes.find(r => r.id === selectedRoute)?.name || selectedRoute;
      alert(`Started simulation for ${routeName}`);
      
      // Reload status after a short delay
      setTimeout(() => {
        loadSimulationStatus();
      }, 1000);
      
    } catch (err) {
      console.error('❌ Error starting simulation:', err);
      alert('Failed to start simulation. Please try again.');
    } finally {
      setSimulationLoading(false);
    }
  };

  const stopSimulation = async () => {
    try {
      setSimulationLoading(true);
      console.log('🛑 Stopping simulation...');
      
      // Always try to call the API, regardless of connection status
      try {
        const response = await adminAPI.stopSimulation();
        console.log('✅ Backend simulation stopped:', response.data);
        setConnectionStatus('connected');
      } catch (apiError) {
        console.log('⚠️ Backend API failed, using demo mode');
        setConnectionStatus('demo');
      }
      
      alert('Simulation stopped');
      setSimulationStatus(null);
      
    } catch (err) {
      console.error('❌ Error stopping simulation:', err);
      alert('Failed to stop simulation. Please try again.');
    } finally {
      setSimulationLoading(false);
    }
  };

  const getSelectedRouteData = () => {
    return routes.find(r => r.id === selectedRoute);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    console.log('Admin logged out.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Loading Admin Panel...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-700 to-teal-800 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Settings className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Admin Control Panel</h1>
                <p className="text-green-100 flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  BusTracker Simulation Management
                </p>
              </div>
            </div>
            
            <div className="text-right space-y-2">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                connectionStatus === 'connected' ? 'bg-green-500/20 text-green-100' :
                connectionStatus === 'demo' ? 'bg-yellow-500/20 text-yellow-100' :
                'bg-red-500/20 text-red-100'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' :
                  connectionStatus === 'demo' ? 'bg-yellow-400' : 'bg-red-400'
                }`}></div>
                {connectionStatus === 'connected' ? 'Backend Connected' :
                 connectionStatus === 'demo' ? 'Demo Mode' : 'Checking...'}
              </div>
              <div className="text-xs text-green-200">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* System Status Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Routes</p>
                <p className="text-3xl font-bold text-gray-900">{routes.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Route className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Buses</p>
                <p className="text-3xl font-bold text-gray-900">{simulationStatus ? 1 : 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Bus className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Status</p>
                <p className="text-lg font-bold text-green-600">
                  {connectionStatus === 'connected' ? 'Online' : 'Demo'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Activity className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Stops</p>
                <p className="text-3xl font-bold text-gray-900">
                  {routes.reduce((sum, route) => sum + route.stops.length, 0)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <MapPin className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Simulation Control Panel */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <Bus className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Bus Simulation Control</h2>
                <p className="text-gray-600">Start and manage live bus tracking simulations</p>
              </div>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={fetchRoutes}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Routes</span>
            </button>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Connection Error</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="admin-route-select" className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Route to Simulate
                </label>
                <select
                  id="admin-route-select"
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900"
                >
                  <option value="">Choose a route...</option>
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.name} • {route.stops.length} stops
                    </option>
                  ))}
                </select>
              </div>

              {selectedRoute && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Route className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">
                      {getSelectedRouteData()?.name}
                    </span>
                    {getSelectedRouteData()?.isDemo && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        DEMO
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {getSelectedRouteData()?.stops.length}
                      </div>
                      <div className="text-blue-800">Stops</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {getSelectedRouteData()?.isDemo ? '10' : '30'}
                      </div>
                      <div className="text-blue-800">Minutes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">1</div>
                      <div className="text-blue-800">Bus</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={startSimulation}
                  disabled={!selectedRoute || simulationLoading || (simulationStatus && simulationStatus.isActive)}
                  className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all text-lg font-semibold"
                >
                  {simulationLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                  Start Simulation
                </button>
                
                <button
                  onClick={stopSimulation}
                  disabled={simulationLoading || !simulationStatus?.isActive}
                  className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all text-lg font-semibold"
                >
                  {simulationLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                  Stop Simulation
                </button>
              </div>
            </div>

            {/* Current Simulation Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Current Simulation Status
              </h3>
              
              {simulationStatus && simulationStatus.isActive ? (
                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-bold text-green-800 text-lg">Simulation Active</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-green-700 font-medium">Route:</span>
                      <span className="text-green-900 font-bold">{simulationStatus.routeName}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-green-700 font-medium">Progress:</span>
                      <span className="text-green-900 font-bold">
                        Stop {simulationStatus.currentStopIndex + 1} of {simulationStatus.totalStops}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-green-700 font-medium">Current Stop:</span>
                      <span className="text-green-900 font-bold">{simulationStatus.currentStopName}</span>
                    </div>
                    
                    {simulationStatus.startTime && (
                      <div className="flex justify-between items-center">
                        <span className="text-green-700 font-medium">Started:</span>
                        <span className="text-green-900 font-bold">
                          {new Date(simulationStatus.startTime).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-green-700">Route Progress</span>
                        <span className="text-sm font-bold text-green-800">
                          {Math.round(((simulationStatus.currentStopIndex + 1) / simulationStatus.totalStops) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-green-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.round(((simulationStatus.currentStopIndex + 1) / simulationStatus.totalStops) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bus className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-600 mb-2">No Active Simulation</h4>
                    <p className="text-gray-500">Select a route and click "Start Simulation" to begin tracking</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Route Management Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-full">
              <Route className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Route Management</h2>
              <p className="text-gray-600">Overview of all available bus routes</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.map((route) => (
              <div key={route.id} className="bg-gray-50 rounded-lg border-2 border-gray-200 p-6 hover:border-blue-300 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{route.name}</h3>
                  {route.isDemo && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      DEMO
                    </span>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{route.stops.length} stops</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{route.stops[0]?.time} - {route.stops[route.stops.length - 1]?.time}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Timer className="w-4 h-4" />
                    <span>{route.isDemo ? '~10 min' : '~30 min'} journey</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>From: <span className="font-medium">{route.stops[0]?.name}</span></div>
                    <div>To: <span className="font-medium">{route.stops[route.stops.length - 1]?.name}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Route Configuration</h4>
                <p className="text-blue-800 text-sm mb-3">
                  Route timings and stops are managed through the backend configuration. 
                  For this MVP, routes are defined in <code className="bg-blue-200 px-2 py-1 rounded">routes.json</code>.
                </p>
                <div className="text-xs text-blue-700">
                  <strong>Production note:</strong> In a full implementation, this panel would include 
                  forms to add/edit routes, modify timings, and manage bus assignments.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}

export default AdminPanel;