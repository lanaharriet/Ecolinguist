import React, { useEffect, useState } from 'react';
import { Cloud, MapPin, ArrowRight, Activity, ThermometerSun, AlertTriangle, Play } from 'lucide-react';
import { getWeather } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [weather, setWeather] = useState({ temperature: '--', condition: 'Loading...', humidity: '--' });
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('access_token')) {
      navigate('/login');
      return;
    }
    // Attempt to get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          getWeather(pos.coords.latitude, pos.coords.longitude)
            .then(res => setWeather(res.data))
            .catch(err => console.error(err));
        },
        () => {
          // fallback
          getWeather(28.6139, 77.2090).then(res => setWeather(res.data));
        }
      );
    } else {
      getWeather(28.6139, 77.2090).then(res => setWeather(res.data)); // Delhi default
    }
  }, []);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Welcome back, Kisan! 👋</h2>
          <p className="text-gray-500 mt-1 flex items-center gap-1">
            <MapPin size={16} /> Your farm in <span className="font-medium text-gray-700">North District</span>
          </p>
        </div>
        <div className="flex bg-white rounded-2xl shadow-sm p-4 items-center gap-4 border border-gray-100">
          <div className="bg-blue-50 p-3 rounded-full text-blue-500">
            <ThermometerSun size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Weather</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold">{weather.temperature}°C</span>
              <span className="text-sm text-gray-600 mb-1">{weather.condition}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button onClick={() => navigate('/voice')} className="bg-primary hover:bg-primary/90 text-white p-5 rounded-2xl shadow-md transition-transform hover:-translate-y-1 flex flex-col items-center justify-center gap-2 min-h-[100px]">
          <div className="bg-white/20 p-3 rounded-full"><Activity size={24} /></div>
          <span className="font-semibold">Check crop</span>
        </button>
        <button onClick={() => navigate('/schemes')} className="bg-white hover:bg-gray-50 text-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 transition-transform hover:-translate-y-1 flex flex-col items-center justify-center gap-2 min-h-[100px]">
          <div className="bg-orange-50 text-orange-500 p-3 rounded-full"><Cloud size={24} /></div>
          <span className="font-semibold">Govt Schemes</span>
        </button>
      </div>

      {/* Status Card */}
      <h3 className="text-xl font-bold mt-8 mb-4">Latest Crop Status</h3>
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-100 p-4 rounded-2xl text-yellow-600">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h4 className="text-xl font-bold">Wheat Field</h4>
              <p className="text-yellow-600 font-medium">Status: Moderate</p>
            </div>
          </div>
          <span className="text-sm text-gray-400">2 days ago</span>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-gray-700">"Slight yellowing of leaves and reduced growth rate observed in the north-east patch."</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={() => navigate('/report/1')} className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition">
            View Full Report <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
