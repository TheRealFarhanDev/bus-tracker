// utils/busLocationSim.js - Enhanced Bus Location Simulator (ES6 modules)
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Hassan area coordinates for realistic simulation
const stopCoordinates = {
  // Route 01
  "N.R Circle": { lat: 13.3339, lng: 74.7423 },
  "Santhepete": { lat: 13.3355, lng: 74.7445 },
  "Thanniruhalla": { lat: 13.3368, lng: 74.7458 },
  "Vijayanagara": { lat: 13.3382, lng: 74.7471 },
  "Heritage Club": { lat: 13.3401, lng: 74.7485 },
  "D.M. Halli": { lat: 13.3421, lng: 74.7502 },
  "Kandali": { lat: 13.3445, lng: 74.7518 },
  
  // Route 02
  "Ringroad Junction": { lat: 13.3298, lng: 74.7389 },
  "Thamlapura": { lat: 13.3312, lng: 74.7405 },
  "Shantinagara": { lat: 13.3325, lng: 74.7418 },
  "Hemavathinagara": { lat: 13.3338, lng: 74.7432 },
  "Stadium": { lat: 13.3351, lng: 74.7446 },
  "Sanjeevini Hospital": { lat: 13.3358, lng: 74.7453 },
  "Hassan Public School": { lat: 13.3365, lng: 74.7461 },
  "Kalabhavana": { lat: 13.3372, lng: 74.7468 },
  "New Bus Stand": { lat: 13.3391, lng: 74.7485 },
  
  // Route 03
  "Shankarmutt Road": { lat: 13.3285, lng: 74.7401 },
  "Euro Kids (M.G Road)": { lat: 13.3295, lng: 74.7411 },
  "Ramakrishna Hospital": { lat: 13.3305, lng: 74.7421 },
  "MCE Ganapathi Temple": { lat: 13.3315, lng: 74.7431 },
  "Thanvithrisha": { lat: 13.3325, lng: 74.7441 },
  "M.C.F Quarters": { lat: 13.3345, lng: 74.7461 },
  "Dasarakoppalu": { lat: 13.3365, lng: 74.7481 },
  "V.V Badavane": { lat: 13.3375, lng: 74.7491 },
  "M.C.E": { lat: 13.3385, lng: 74.7501 },
  "Nisarga Hostel": { lat: 13.3395, lng: 74.7511 },
  "Slaters Hall": { lat: 13.3405, lng: 74.7521 },
  
  // Route 04
  "Ganapathi Temple (K.N)": { lat: 13.3275, lng: 74.7395 },
  "Hoysalanagara": { lat: 13.3285, lng: 74.7408 },
  "Gowrikoppalu": { lat: 13.3295, lng: 74.7421 },
  "Euro Kids / Manjunatha D.Ed College": { lat: 13.3305, lng: 74.7434 },
  "Satyamangala Cross": { lat: 13.3325, lng: 74.7454 },
  "Matrushree": { lat: 13.3345, lng: 74.7474 },
  "Evergreen P.G": { lat: 13.3355, lng: 74.7484 },
  "L.I.C Office": { lat: 13.3365, lng: 74.7491 },
  "Sparsh Hospital": { lat: 13.3381, lng: 74.7505 },
  "Channapattana": { lat: 13.3398, lng: 74.7518 },
  
  // Route 05
  "Pruthvi Theatre": { lat: 13.3321, lng: 74.7398 },
  "Gas Bunk": { lat: 13.3331, lng: 74.7408 },
  "Railway Station": { lat: 13.3341, lng: 74.7418 },
  "Dairy Circle": { lat: 13.3351, lng: 74.7431 },
  "Satyamangala": { lat: 13.3361, lng: 74.7444 },
  "Katihalli": { lat: 13.3375, lng: 74.7461 },
  "R.T.O": { lat: 13.3381, lng: 74.7468 },
  "Bhoovanahalli Koodu": { lat: 13.3401, lng: 74.7488 },
  "Gavenahalli": { lat: 13.3421, lng: 74.7508 },
  "Bommanayakanahalli": { lat: 13.3441, lng: 74.7528 },
  "Gorur Circle": { lat: 13.3461, lng: 74.7548 },
  
  // Common destination
  "College": { lat: 13.3471, lng: 74.7558 }
};

class BusLocationSimulator {
  constructor() {
    this.routes = null;
    this.currentRoute = null;
    this.currentStopIndex = 0;
    this.simulationInterval = null;
    this.isSimulating = false;
    this.progress = 0; // 0-1 progress between stops
    this.busId = null;
    this.startTime = null;
    this.loadRoutes();
  }

  loadRoutes() {
    const routesPath = join(__dirname, '../../routes.json');
    try {
      const data = readFileSync(routesPath, 'utf8');
      this.routes = JSON.parse(data).routes;
      console.log(`📍 Loaded ${this.routes.length} routes for simulation`);
    } catch (error) {
      console.error('Failed to load routes.json:', error);
      this.routes = [];
    }
  }

  startSimulation(routeId, io) {
    // Stop any existing simulation
    this.stopSimulation();
    
    this.currentRoute = this.routes.find(route => route.id === routeId);
    if (!this.currentRoute) {
      throw new Error(`Route ${routeId} not found`);
    }

    this.currentStopIndex = 0;
    this.progress = 0;
    this.isSimulating = true;
    this.busId = `BUS-${routeId}-${Date.now()}`;
    this.startTime = new Date();
    
    console.log(`🚌 Starting simulation for ${this.currentRoute.name} (${this.currentRoute.id})`);
    console.log(`📍 Route has ${this.currentRoute.stops.length} stops`);
    
    // Emit initial status
    this.emitBusUpdate(io);
    
    // Start regular updates every 5 seconds
    this.simulationInterval = setInterval(() => {
      this.updateBusLocation(io);
    }, 5000);
  }

  updateBusLocation(io) {
    if (!this.currentRoute || !this.isSimulating) return;

    const stops = this.currentRoute.stops;
    
    // Check if bus reached final destination
    if (this.currentStopIndex >= stops.length - 1) {
      console.log(`🏁 Bus reached final destination: ${stops[stops.length - 1].name}`);
      this.completSimulation(io);
      return;
    }

    // Simulate movement between stops
    this.progress += 0.2; // 20% progress each update
    
    if (this.progress >= 1.0) {
      // Move to next stop
      this.currentStopIndex++;
      this.progress = 0;
      
      if (this.currentStopIndex < stops.length) {
        console.log(`🚏 Bus arrived at: ${stops[this.currentStopIndex].name}`);
      }
    }
    
    this.emitBusUpdate(io);
  }

  emitBusUpdate(io) {
    if (!this.currentRoute || !this.isSimulating) return;

    const stops = this.currentRoute.stops;
    const currentStop = stops[this.currentStopIndex];
    const nextStop = stops[this.currentStopIndex + 1];
    
    // Get coordinates for current position
    const currentCoords = stopCoordinates[currentStop.name] || { lat: 13.3381, lng: 74.7421 };
    let busLocation = { ...currentCoords };
    
    // If moving between stops, interpolate position
    if (nextStop && this.progress > 0) {
      const nextCoords = stopCoordinates[nextStop.name] || currentCoords;
      busLocation = {
        lat: currentCoords.lat + (nextCoords.lat - currentCoords.lat) * this.progress,
        lng: currentCoords.lng + (nextCoords.lng - currentCoords.lng) * this.progress
      };
    }
    
    // Calculate ETA for remaining stops
    const remainingStops = stops.length - this.currentStopIndex - 1;
    const estimatedMinutes = Math.max(0, remainingStops * 3 + (1 - this.progress) * 3);
    
    const busUpdate = {
      routeId: this.currentRoute.id,
      routeName: this.currentRoute.name,
      busId: this.busId,
      location: busLocation,
      currentStopIndex: this.currentStopIndex,
      currentStopName: currentStop.name,
      nextStopName: nextStop?.name || 'Final Destination',
      totalStops: stops.length,
      progress: Math.round((this.currentStopIndex + this.progress) / stops.length * 100),
      eta: estimatedMinutes > 0 ? `${Math.round(estimatedMinutes)} min` : 'Arrived',
      status: this.progress > 0 ? 'moving' : 'at_stop',
      timestamp: new Date().toISOString(),
      uptime: Math.round((Date.now() - this.startTime.getTime()) / 1000)
    };

    // Emit to all connected clients
    io.emit('busUpdate', busUpdate);
    
    // Also emit simulation status for admin panel
    io.emit('simulationStatus', {
      routeId: this.currentRoute.id,
      routeName: this.currentRoute.name,
      currentStopIndex: this.currentStopIndex,
      totalStops: stops.length,
      isActive: this.isSimulating,
      startTime: this.startTime.toISOString()
    });
  }

  completSimulation(io) {
    console.log(`✅ Simulation completed for ${this.currentRoute.name}`);
    
    // Emit final update
    const finalStop = this.currentRoute.stops[this.currentRoute.stops.length - 1];
    const finalUpdate = {
      routeId: this.currentRoute.id,
      routeName: this.currentRoute.name,
      busId: this.busId,
      location: stopCoordinates[finalStop.name] || { lat: 13.3471, lng: 74.7558 },
      currentStopIndex: this.currentRoute.stops.length - 1,
      currentStopName: finalStop.name,
      nextStopName: null,
      totalStops: this.currentRoute.stops.length,
      progress: 100,
      eta: 'Arrived',
      status: 'completed',
      timestamp: new Date().toISOString(),
      uptime: Math.round((Date.now() - this.startTime.getTime()) / 1000)
    };
    
    io.emit('busUpdate', finalUpdate);
    io.emit('simulationCompleted', {
      routeId: this.currentRoute.id,
      routeName: this.currentRoute.name,
      completedAt: new Date().toISOString()
    });
    
    // Clean up
    this.stopSimulation();
  }

  stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    
    if (this.isSimulating) {
      console.log(`⏹️ Simulation stopped for ${this.currentRoute?.name || 'unknown route'}`);
    }
    
    this.isSimulating = false;
    this.currentRoute = null;
    this.currentStopIndex = 0;
    this.progress = 0;
    this.busId = null;
    this.startTime = null;
  }

  getCurrentStatus() {
    if (!this.currentRoute || !this.isSimulating) {
      return null;
    }
    
    return {
      routeId: this.currentRoute.id,
      routeName: this.currentRoute.name,
      busId: this.busId,
      currentStopIndex: this.currentStopIndex,
      currentStopName: this.currentRoute.stops[this.currentStopIndex]?.name,
      totalStops: this.currentRoute.stops.length,
      progress: Math.round((this.currentStopIndex + this.progress) / this.currentRoute.stops.length * 100),
      isActive: this.isSimulating,
      startTime: this.startTime?.toISOString(),
      uptime: this.startTime ? Math.round((Date.now() - this.startTime.getTime()) / 1000) : 0
    };
  }

  // Get all available routes
  getAvailableRoutes() {
    return this.routes || [];
  }

  // Force move to next stop (for demo purposes)
  forceNextStop(io) {
    if (!this.isSimulating || !this.currentRoute) return false;
    
    if (this.currentStopIndex < this.currentRoute.stops.length - 1) {
      this.currentStopIndex++;
      this.progress = 0;
      this.emitBusUpdate(io);
      return true;
    }
    return false;
  }

  // Reset simulation to beginning
  resetSimulation(io) {
    if (!this.currentRoute) return false;
    
    this.currentStopIndex = 0;
    this.progress = 0;
    this.startTime = new Date();
    
    if (this.isSimulating) {
      this.emitBusUpdate(io);
    }
    
    return true;
  }
}

export default BusLocationSimulator;