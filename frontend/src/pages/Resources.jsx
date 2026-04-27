import React, { useEffect, useState } from 'react';
import { getResources } from '../services/api';
import { MapPin, Navigation, Phone, Star } from 'lucide-react';

export default function Resources() {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    getResources().then(res => setResources(res.data)).catch(err => console.error(err));
  }, []);

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary/10 p-3 rounded-2xl text-primary">
          <MapPin size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-bold">Nearby Resources</h2>
          <p className="text-gray-500">Find shops and suppliers near your farm.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((res) => (
          <div key={res.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                res.type === 'Seed Shop' ? 'bg-green-100 text-green-700' :
                res.type === 'Pesticide Supplier' ? 'bg-red-100 text-red-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {res.type}
              </span>
              <div className="flex text-yellow-400">
                <Star size={16} fill="currentColor" />
                <span className="text-xs text-gray-600 ml-1 font-bold">4.8</span>
              </div>
            </div>
            
            <h3 className="font-bold text-lg text-gray-800 mb-1">{res.name}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-6">
              <MapPin size={14} /> {res.location}
            </p>
            
            <div className="flex gap-2">
              <button className="flex-1 flex justify-center items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-medium transition">
                <Phone size={16} /> Call
              </button>
              <button className="flex-1 flex justify-center items-center gap-1.5 bg-primary text-white hover:bg-primary/90 py-2.5 rounded-xl text-sm font-medium transition">
                <Navigation size={16} /> Directions
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
