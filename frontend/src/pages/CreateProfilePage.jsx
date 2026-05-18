import React, { useState } from 'react';
import axios from 'axios';
import { User as UserIcon, MapPin, Sprout, Languages, ShieldCheck, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreateProfilePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    first_name: '',
    location: '',
    farmer_type: 'Small-scale',
    land_size: '',
    main_crops: '',
    preferred_language: 'Tamil',
    farming_experience: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await axios.post('http://localhost:8000/api/profile/create/', formData);
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create profile. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="glass-panel p-10 flex flex-col items-center justify-center text-center max-w-md animate-slide-up">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">Profile Created!</h2>
          <p className="text-muted-foreground mb-6">Welcome to EcoLinguist, {formData.first_name}. Redirecting you to your Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 animate-slide-up max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-3">
          <ShieldCheck className="text-primary" size={36} />
          Create Your EcoLinguist Profile
        </h1>
        <p className="text-muted-foreground mt-2">Personalize your AI assistance, government scheme recommendations, and language preferences.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-8 space-y-6 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 blur-3xl rounded-full pointer-events-none"></div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {/* Account Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-foreground text-lg border-b border-border pb-2 flex items-center gap-2">
              <UserIcon size={18} className="text-primary"/> Account Details
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Full Name</label>
              <input required name="first_name" onChange={handleChange} className="w-full bg-black/5 dark:bg-white/5 border border-border text-foreground rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50" placeholder="e.g., Karthik R." />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Username (Phone or ID)</label>
              <input required name="username" onChange={handleChange} className="w-full bg-black/5 dark:bg-white/5 border border-border text-foreground rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50" placeholder="farmer_karthik" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Password</label>
              <input required type="password" name="password" onChange={handleChange} className="w-full bg-black/5 dark:bg-white/5 border border-border text-foreground rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50" placeholder="••••••••" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                <Languages size={16} /> Preferred AI Language
              </label>
              <select name="preferred_language" onChange={handleChange} className="w-full bg-black/5 dark:bg-white/5 border border-border text-foreground rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 appearance-none">
                <option value="Tamil">Tamil</option>
                <option value="Kongu Tanglish">Kongu Tanglish</option>
                <option value="English">English</option>
                <option value="Malayalam">Malayalam</option>
              </select>
            </div>
          </div>

          {/* Farm Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-foreground text-lg border-b border-border pb-2 flex items-center gap-2">
              <Sprout size={18} className="text-primary"/> Farm Details
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                <MapPin size={16} /> Location / District
              </label>
              <input required name="location" onChange={handleChange} className="w-full bg-black/5 dark:bg-white/5 border border-border text-foreground rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50" placeholder="e.g., Coimbatore, Tamil Nadu" />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-muted-foreground mb-1">Farmer Type</label>
                <select name="farmer_type" onChange={handleChange} className="w-full bg-black/5 dark:bg-white/5 border border-border text-foreground rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 appearance-none">
                  <option value="Small-scale">Small-scale</option>
                  <option value="Medium">Medium</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-muted-foreground mb-1">Land (Acres)</label>
                <input required type="number" step="0.1" name="land_size" onChange={handleChange} className="w-full bg-black/5 dark:bg-white/5 border border-border text-foreground rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50" placeholder="2.5" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Main Crops</label>
              <input required name="main_crops" onChange={handleChange} className="w-full bg-black/5 dark:bg-white/5 border border-border text-foreground rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50" placeholder="e.g., Tomato, Turmeric" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Years of Experience</label>
              <input required type="number" name="farming_experience" onChange={handleChange} className="w-full bg-black/5 dark:bg-white/5 border border-border text-foreground rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50" placeholder="10" />
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-border flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-primary hover:bg-emerald-500 text-primary-foreground px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Creating Profile...' : 'Complete Profile & Continue'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </div>
      </form>
    </div>
  );
}
