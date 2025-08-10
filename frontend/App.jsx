import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import StudentDashboard from './pages/StudentDashboard';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import RealTimeTracking from './pages/RealTimeTracking';
import ProtectedRoute from './components/ProtectedRoute';
import {
  Bus,
  MapPin,
  Users,
  Settings,
  Navigation,
  Clock,
  Smartphone,
  Zap,
  Shield,
  ArrowRight,
  Github,
  LogOut
} from 'lucide-react';
import Chatbot from './components/Chatbot';

function Home() {
  const features = [
    {
      icon: <Navigation className="w-8 h-8" />,
      title: "Real-time Tracking",
      description: "Track your college bus live with precise GPS coordinates and ETA predictions"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Mobile Optimized",
      description: "Responsive design that works perfectly on all devices - desktop, tablet, and mobile"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Smart Notifications",
      description: "Get timely updates about bus arrivals, delays, and route changes"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Reliable Service",
      description: "Built with modern technology stack for consistent performance and uptime"
    }
  ];

  const stats = [
    { number: "5+", label: "Bus Routes", icon: <Bus className="w-6 h-6" /> },
    { number: "50+", label: "Bus Stops", icon: <MapPin className="w-6 h-6" /> },
    { number: "1000+", label: "Students", icon: <Users className="w-6 h-6" /> },
    { number: "99%", label: "Uptime", icon: <Zap className="w-6 h-6" /> }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-purple-600 to-blue-700 text-white sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded flex items-center justify-center">
                {/* <Bus className="w-6 h-6 text-white" /> */}
                <img src="./assets/navLogo.png" alt="Logo" className="w-full h-full object-contain size-7" />
              </div>
              <h1 className="text-2xl font-bold text-white">BusTracker</h1>
            </div>

            <div className="flex items-center gap-4">
              {user.name ? (
                <>
                  <span className="text-white/90">Welcome, {user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-white/90 hover:text-white transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm"
                >
                  <Users className="w-4 h-4" />
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative container mx-auto px-4 min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent z-10 pointer-events-none" />


        <img
          className="absolute inset-0 w-full h-full object-cover object-center"
          src="https://www.navkisce.com/assets/images/transportation/3.jpg"
          alt="College Gate"
        />
        <div className="w-full max-w-3xl space-y-6 bg-white/1 backdrop-blur-sm border border-gray-300 shadow-xl rounded-xl px-6 py-10 text-center mx-auto">

          {/* Logo + Title */}
          <div className="flex items-center justify-center gap-3">
            <div className="size-24 bg-white border border-gray-300 rounded flex items-center justify-center shadow">
              {/* <Bus className="w-6 h-6 text-black" /> */}
              <img src="./assets/navLogo.png" alt="Logo" className="w-full h-full object-contain size-24" />

            </div>
            <h1 className="text-4xl font-bold text-white px-3 py-1 rounded-lg">
              NCE – Live Bus Tracker
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-2xl font-semibold text-black bg-white/90 px-3 py-2 rounded-lg inline-block">
            Real-time bus tracking system for <span className="text-blue-600 font-bold">NCE</span> students
          </p>

          {/* Description */}
          <p className="text-xl font-semibold text-gray-800 bg-white/90 px-4 py-3 rounded-lg inline-block">
            Never miss your college bus again. Track buses live, view ETAs, and plan your commute with confidence.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            {user.name ? (
              <>
                <Link
                  to="/student"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-black text-white hover:bg-gray-900 text-sm font-medium shadow"
                >
                  <Users className="w-4 h-4" />
                  Student Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-gray-100 text-gray-900 hover:bg-gray-200 text-sm font-medium shadow"
                  >
                    <Settings className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium shadow"
              >
                <Users className="w-4 h-4" />
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose BusTracker?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our advanced tracking system provides real-time updates, accurate ETAs, and a seamless user experience for all NCE students.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Stack */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Built with Modern Technology</h2>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Leveraging the latest web technologies for optimal performance and user experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold mb-2">Frontend</div>
              <div className="text-blue-100">React • Tailwind CSS • Leaflet • ShadCN UI</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold mb-2">Backend</div>
              <div className="text-blue-100">Node.js • Express • Socket.io • ES6 Modules</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold mb-2">AI Integration</div>
              <div className="text-blue-100">Google Gemini • Real-time Chat • Smart Assistance</div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to Experience Smart Bus Tracking?
            </h2>
            <p className="text-xl text-gray-600 mb-10">
              Join hundreds of students already using BusTracker to commute smarter and never be late again. Get started now!
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                to="/student"
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Users className="w-6 h-6" />
                Go to Student Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 size-12 bg-white rounded">
              {/* <Bus className="w-6 h-6" /> */}
              <img src="./assets/navLogo.png" alt="Logo" className="w-full h-full object-contain size-12" />
              <span className="font-semibold">BusTracker</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-blue-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2025 Navkis - BusTracker. Built with ❤️ for NCE students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/realtime"
          element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <RealTimeTracking />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;