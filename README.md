# 🚌 BusTracker - Real-time College Bus Tracking System

A modern MERN stack application for real-time bus tracking with AI-powered chatbot integration.

## 🏗️ Project Structure

```
BusTracker/
├── frontend/          # React + Vite frontend
│   ├── components/    # React components
│   ├── pages/         # Main application pages
│   ├── services/      # API and socket services
│   └── utils/         # Utility functions
├── backend/           # Express.js backend
│   ├── routes/        # API route handlers
│   └── utils/         # Backend utilities
└── routes.json        # Bus routes configuration
```

## 🚀 Features

### ✅ **Real-time Tracking**
- Live bus location updates via Socket.io
- Interactive map with Leaflet
- Real-time ETA predictions
- Progress tracking with visual indicators

### ✅ **Route Management**
- **Backend API Integration**: Routes fetched from backend API
- **Demo Route**: Special hackathon demo route for presentations
- **5 Real Routes**: Complete Hassan city bus routes
- **Enhanced Data**: Coordinates, timing, and status information

### ✅ **Dual Interface**
- **Student Dashboard**: Real-time tracking and route selection
- **Admin Panel**: Simulation controls and system monitoring

### ✅ **AI Integration**
- Gemini AI-powered chatbot
- Route assistance and information

## 🔧 Recent Updates

### **Backend Route Integration** (Latest)
- ✅ **Frontend now fetches routes from backend API**
- ✅ **Keeps one demo route for presentations**
- ✅ **Enhanced error handling and fallback**
- ✅ **Refresh button for manual route updates**
- ✅ **Console logging for debugging**

### **API Endpoints**
- `GET /api/routes` - Get all routes with enhanced data
- `GET /api/routes/:routeId` - Get specific route
- `POST /api/admin/simulate` - Start bus simulation
- `POST /api/admin/stop-simulation` - Stop simulation
- `GET /api/admin/status` - Get simulation status

## 🛠️ Setup Instructions

### **Backend Setup**
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:5000
```

### **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:3000
```

## 📊 Route Information

### **Demo Route** 🎯
- **Hackathon Demo Route**: Quick presentation route
- **5 stops**: Optimized for demonstrations
- **2-second intervals**: Fast-paced simulation

### **Real Routes** 🚌
- **Route 01**: N.R Circle → College (8 stops)
- **Route 02**: Ringroad Junction → College (10 stops)
- **Route 03**: Shankarmutt Road → College (12 stops)
- **Route 04**: Ganapathi Temple → College (12 stops)
- **Route 05**: Pruthvi Theatre → College (12 stops)

## 🔄 How It Works

1. **Route Loading**: Frontend fetches routes from backend API
2. **Fallback**: If API fails, uses demo route only
3. **Real-time**: Socket.io provides live bus updates
4. **Simulation**: Admin can start/stop bus simulations
5. **Mapping**: Interactive map shows bus location and route

## 🎨 UI Features

- **Responsive Design**: Works on all devices
- **Modern UI**: Tailwind CSS with beautiful components
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages
- **Refresh Controls**: Manual route refresh buttons

## 🔍 Debugging

- **Console Logs**: Detailed logging for route fetching
- **Error Display**: Visual error messages in UI
- **Network Tab**: Monitor API calls in browser dev tools

## 🚀 Production Ready

- **Security**: Helmet and CORS protection
- **Performance**: Compression and optimization
- **Monitoring**: Morgan request logging
- **Scalability**: Modular architecture

---

**Built with ❤️ for NCE Bus Tracking System** 