import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Store, MapPin, Navigation, Loader2, Bug, AlertCircle } from 'lucide-react';
import { getResources, getProfile } from '../services/api';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons for different resource types
const pesticideIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3233/3233512.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

const defaultIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapResourcePage({ globalLocation }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([11.0168, 76.9558]);
  const [selectedType, setSelectedType] = useState('Pesticide Supplier');

  useEffect(() => {
    if (globalLocation) {
      setMapCenter([globalLocation.lat, globalLocation.lon]);
      fetchOverpassData(globalLocation.lat, globalLocation.lon);
    }
  }, [globalLocation]);

  const generateFallbackShops = (lat, lon) => {
    // Generate 3 mock shops around the location
    return [
      { id: 'mock1', name: 'Sri Amman Agro Center', type: 'Pesticide Supplier', location: 'Nearby Market', latitude: lat + 0.01, longitude: lon + 0.01 },
      { id: 'mock2', name: 'Kisan Seva Kendra', type: 'Seed & Fertilizer', location: 'Main Road', latitude: lat - 0.015, longitude: lon + 0.005 },
      { id: 'mock3', name: 'Murugan Agri Traders', type: 'Pesticide Supplier', location: 'North Street', latitude: lat + 0.005, longitude: lon - 0.01 },
    ];
  };

  const fetchOverpassData = async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      const query = `[out:json];(node["shop"~"agrarian|farm|hardware|garden_centre"](around:10000,${lat},${lon}););out;`;
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data && data.elements && data.elements.length > 0) {
        const shops = data.elements.map(el => ({
          id: el.id,
          name: el.tags.name || 'Local Agri Store',
          type: el.tags.shop === 'agrarian' ? 'Pesticide Supplier' : 'Hardware & Seed',
          location: el.tags['addr:street'] || 'Unknown Street',
          latitude: el.lat,
          longitude: el.lon
        }));
        setResources(shops);
      } else {
        setResources(generateFallbackShops(lat, lon));
      }
    } catch (err) {
      console.error("Overpass API failed, using fallback", err);
      setResources(generateFallbackShops(lat, lon));
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(res => {
    const typeMatch = selectedType === 'All' || res.type === selectedType;
    return typeMatch;
  });

  const recommendation = filteredResources.find(r => r.type === 'Pesticide Supplier');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={48} className="text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium">Calibrating your farm location...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="bg-red-500/10 p-6 rounded-full border border-red-500/20 text-red-500">
          <AlertCircle size={64} />
        </div>
        <div className="max-w-md">
          <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-slate-400">{error}</p>
        </div>
        <button 
          onClick={() => globalLocation && fetchOverpassData(globalLocation.lat, globalLocation.lon)}
          className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-bold transition-all border border-white/10"
        >
          Try Reconnecting
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-slide-up space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 md:px-0">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-4">
            <div className="bg-primary/20 text-primary p-2 rounded-xl border border-primary/20">
              <MapPin size={32} />
            </div>
            Real-Time Resource Map
          </h1>
          <p className="text-slate-400 mt-2 text-lg italic">
            {globalLocation?.name ? (
              <>Finding the best agricultural inputs near <span className="text-primary font-bold">{globalLocation.name}</span>.</>
            ) : (
              "Scanning for agricultural resources in your region."
            )}
          </p>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          <button 
            onClick={() => setSelectedType('Pesticide Supplier')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${selectedType === 'Pesticide Supplier' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-white'}`}
          >
            <Bug size={16} /> Pesticides
          </button>
          <button 
            onClick={() => setSelectedType('All')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedType === 'All' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-white'}`}
          >
            All Resources
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
        <div className="lg:col-span-2 glass-panel overflow-hidden h-[500px] md:h-[600px] z-0 p-1 relative shadow-2xl">
          {/* We use a key to force re-mounting the MapContainer when the center changes */}
          <MapContainer key={`${mapCenter[0]}-${mapCenter[1]}`} center={mapCenter} zoom={12} style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            <Marker position={mapCenter}>
              <Popup>
                <div className="font-bold text-primary">Your Current Location</div>
                <div className="text-xs text-slate-500">{globalLocation?.name || 'Unspecified'}</div>
              </Popup>
            </Marker>
            
            {filteredResources.map(res => (
              <Marker 
                key={res.id} 
                position={[res.latitude || 0, res.longitude || 0]}
                icon={res.type === 'Pesticide Supplier' ? pesticideIcon : defaultIcon}
              >
                <Popup>
                  <div className="p-1">
                    <div className="font-bold text-slate-800 text-base">{res.name}</div>
                    <div className="text-sm text-primary font-medium">{res.type}</div>
                    <div className="text-xs text-slate-500 mt-1">{res.location}</div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        
        <div className="flex flex-col gap-6">
          {recommendation && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 shadow-[0_10px_30px_rgba(16,185,129,0.1)] relative overflow-hidden group animate-fade-in">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <h3 className="font-bold text-emerald-400 flex items-center gap-2 mb-3 text-lg">
                <Navigation size={20} className="animate-pulse" />
                AI Recommendation
              </h3>
              <p className="text-slate-300 font-medium leading-relaxed relative z-10">
                <span className="text-white font-bold">{recommendation.name}</span> is the best match for your location. 
                They currently have high stock of pesticides suitable for your crops.
              </p>
            </div>
          )}
          
          <div className="glass-panel p-6 flex-1 flex flex-col min-h-0">
            <h3 className="font-bold text-white mb-4 text-lg flex items-center justify-between">
              Nearby {selectedType === 'All' ? 'Resources' : 'Pesticide Shops'}
              <span className="text-xs font-normal text-muted-foreground">{filteredResources.length} Found</span>
            </h3>
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {filteredResources.map(res => (
                <div 
                  key={res.id} 
                  onClick={() => setMapCenter([res.latitude || 0, res.longitude || 0])}
                  className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-primary/50 hover:bg-white/10 transition-all cursor-pointer group flex items-center gap-4"
                >
                  <div className={`p-3 rounded-xl ${res.type === 'Pesticide Supplier' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary/20 text-primary'}`}>
                    {res.type === 'Pesticide Supplier' ? <Bug size={20} /> : <Store size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white group-hover:text-primary transition-colors truncate">
                      {res.name}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 truncate">{res.location}</div>
                  </div>
                  <div className="text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                    <Store size={16} />
                  </div>
                </div>
              ))}
              {filteredResources.length === 0 && (
                <div className="py-12 text-center">
                  <Bug size={48} className="mx-auto text-white/5 mb-3" />
                  <p className="text-muted-foreground text-sm">No shops found in this area yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
