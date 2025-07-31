// routes/routes.js - Routes API endpoints (ES6 modules)
import express from 'express';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = dirname(fileURLToPath(import.meta.url));

// GET /api/routes - serve routes.json with enhanced data
router.get('/', async (req, res) => {
  try {
    const routesPath = join(__dirname, '../../routes.json');
    const data = await readFile(routesPath, 'utf8');
    const routes = JSON.parse(data);
    
    // Add coordinates and enhanced timing data for Hassan routes
    const enhancedRoutes = {
      routes: routes.routes.map(route => ({
        ...route,
        stops: route.stops.map((stop, index) => ({
          ...stop,
          id: `${route.id}-stop-${index}`,
          coordinates: getStopCoordinates(stop.name),
          status: 'scheduled',
          estimatedDelay: 0
        })),
        totalDistance: calculateRouteDistance(route.stops),
        averageDuration: '30-45 minutes',
        frequency: 'Morning: 8:30 AM - 10:00 AM',
        status: 'active'
      }))
    };
    
    res.json(enhancedRoutes);
  } catch (err) {
    console.error('Error reading routes.json:', err);
    res.status(500).json({ 
      error: 'Failed to read routes data',
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/routes/:routeId - get specific route
router.get('/:routeId', async (req, res) => {
  try {
    const routesPath = join(__dirname, '../../routes.json');
    const data = await readFile(routesPath, 'utf8');
    const routes = JSON.parse(data);
    
    const route = routes.routes.find(r => r.id === req.params.routeId);
    if (!route) {
      return res.status(404).json({ 
        error: 'Route not found',
        routeId: req.params.routeId 
      });
    }
    
    // Add enhanced data
    const enhancedRoute = {
      ...route,
      stops: route.stops.map((stop, index) => ({
        ...stop,
        id: `${route.id}-stop-${index}`,
        coordinates: getStopCoordinates(stop.name),
        status: 'scheduled'
      }))
    };
    
    res.json(enhancedRoute);
  } catch (err) {
    console.error('Error reading route:', err);
    res.status(500).json({ 
      error: 'Failed to read route data',
      details: err.message 
    });
  }
});

// Helper function to get coordinates for Hassan bus stops
function getStopCoordinates(stopName) {
  const coordinates = {
    // Route 01
    "N.R Circle": { lat: 13.0039, lng: 76.1018 },
    "Santhepete": { lat: 13.0055, lng: 76.1045 },
    "Thanniruhalla": { lat: 13.0068, lng: 76.1058 },
    "Vijayanagara": { lat: 13.0082, lng: 76.1071 },
    "Heritage Club": { lat: 13.0101, lng: 76.1085 },
    "D.M. Halli": { lat: 13.0121, lng: 76.1102 },
    "Kandali": { lat: 13.0145, lng: 76.1118 },

    // Route 02
    "Ringroad Junction": { lat: 13.0028, lng: 76.0989 },
    "Thamlapura": { lat: 13.0032, lng: 76.1005 },
    "Shantinagara": { lat: 13.0025, lng: 76.1018 },
    "Hemavathinagara": { lat: 13.0038, lng: 76.1032 },
    "Stadium": { lat: 13.0051, lng: 76.1046 },
    "Sanjeevini Hospital": { lat: 13.0058, lng: 76.1053 },
    "Hassan Public School": { lat: 13.0200, lng: 76.1300 },
    "Kalabhavana": { lat: 13.0072, lng: 76.1068 },
    "New Bus Stand": { lat: 13.0091, lng: 76.1085 },

    // Route 03
    "Shankarmutt Road": { lat: 13.0020, lng: 76.1001 },
    "Euro Kids (M.G Road)": { lat: 13.0025, lng: 76.1011 },
    "Ramakrishna Hospital": { lat: 13.0035, lng: 76.1021 },
    "MCE Ganapathi Temple": { lat: 13.0045, lng: 76.1031 },
    "Thanvithrisha": { lat: 13.0055, lng: 76.1041 },
    "M.C.F Quarters": { lat: 13.0075, lng: 76.1061 },
    "Dasarakoppalu": { lat: 13.0100, lng: 76.1000 },
    "V.V Badavane": { lat: 13.0115, lng: 76.1091 },
    "M.C.E": { lat: 13.0125, lng: 76.1101 },
    "Nisarga Hostel": { lat: 13.0135, lng: 76.1111 },
    "Slaters Hall": { lat: 13.0145, lng: 76.1121 },

    // Route 04
    "Ganapathi Temple (K.N)": { lat: 13.0015, lng: 76.0995 },
    "Hoysalanagara": { lat: 13.0025, lng: 76.1008 },
    "Gowrikoppalu": { lat: 13.0100, lng: 76.1100 },
    "Euro Kids / Manjunatha D.Ed College": { lat: 13.0035, lng: 76.1034 },
    "Satyamangala Cross": { lat: 13.0055, lng: 76.1054 },
    "Matrushree": { lat: 13.0075, lng: 76.1074 },
    "Evergreen P.G": { lat: 13.0085, lng: 76.1084 },
    "L.I.C Office": { lat: 13.0095, lng: 76.1091 },
    "Sparsh Hospital": { lat: 13.0111, lng: 76.1105 },
    "Channapattana": { lat: 12.9900, lng: 76.1000 },

    // Route 05
    "Pruthvi Theatre": { lat: 13.0021, lng: 76.0998 },
    "Gas Bunk": { lat: 13.0031, lng: 76.1008 },
    "Railway Station": { lat: 13.0041, lng: 76.1018 },
    "Dairy Circle": { lat: 13.0100, lng: 76.1200 },
    "Satyamangala": { lat: 13.0061, lng: 76.1044 },
    "Katihalli": { lat: 13.0075, lng: 76.1061 },
    "R.T.O": { lat: 13.0081, lng: 76.1068 },
    "Bhoovanahalli Koodu": { lat: 13.0101, lng: 76.1088 },
    "Gavenahalli": { lat: 13.0000, lng: 76.1200 },
    "Bommanayakanahalli": { lat: 12.9900, lng: 76.1100 },
    "Gorur Circle": { lat: 12.8222, lng: 76.0631 },

    // Common destination
    "College": { lat: 13.0038, lng: 76.0714 }
  };

  return coordinates[stopName] || null;
}

// Helper function to calculate route distance (mock calculation)
function calculateRouteDistance(stops) {
  return `${(stops.length * 1.2).toFixed(1)} km`;
}

export default router;