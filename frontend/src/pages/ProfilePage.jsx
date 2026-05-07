import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../services/api';
import { User as UserIcon, MapPin, Sprout, Languages, ShieldCheck, CheckCircle, Save, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    first_name: '',
    location: '',
    farmer_type: '',
    land_size: '',
    main_crops: '',
    preferred_language: 'English',
    farming_experience: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      const { profile, first_name } = res.data;
      setFormData({
        first_name: first_name || '',
        location: profile.location || '',
        farmer_type: profile.farmer_type || 'Small-scale',
        land_size: profile.land_size || '',
        main_crops: profile.main_crops || '',
        preferred_language: profile.preferred_language || 'English',
        farming_experience: profile.farming_experience || ''
      });
    } catch (err) {
      setError('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    
    try {
      await updateProfile(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to update profile. Please check your inputs.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={48} className="text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-slide-up space-y-8 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-foreground tracking-tight flex items-center gap-4">
          <div className="bg-primary/20 text-primary p-2 rounded-xl border border-primary/20">
            <UserIcon size={32} />
          </div>
          Your EcoLinguist Profile
        </h1>
        <p className="text-lg text-muted-foreground ml-1">Manage your agricultural identity and personalized AI settings.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Status Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-medium animate-shake">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in">
            <CheckCircle size={18} /> Profile updated successfully!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Section 1: Personal Identity */}
          <div className="glass-panel p-8 space-y-6 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 blur-3xl rounded-full transition-all group-hover:bg-primary/10"></div>
            
            <h3 className="font-bold text-foreground text-xl border-b border-white/5 pb-3 flex items-center gap-3">
              <ShieldCheck className="text-primary" size={24}/> Identity & Language
            </h3>
            
            <div className="space-y-4 relative z-10">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Full Name</label>
                <input 
                  required 
                  name="first_name" 
                  value={formData.first_name}
                  onChange={handleChange} 
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/20" 
                  placeholder="e.g., Karthik R." 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-2">
                  <Languages size={16} /> Preferred AI Language
                </label>
                <div className="relative">
                  <select 
                    name="preferred_language" 
                    value={formData.preferred_language}
                    onChange={handleChange} 
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="English">English</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Kongu Tanglish">Kongu Tanglish</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <ChevronDown size={18} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-2">
                  <MapPin size={16} /> Farm Location / District
                </label>
                <input 
                  required 
                  name="location" 
                  value={formData.location}
                  onChange={handleChange} 
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/20" 
                  placeholder="e.g., Coimbatore, Tamil Nadu" 
                />
              </div>
            </div>
          </div>

          {/* Section 2: Farm Details */}
          <div className="glass-panel p-8 space-y-6 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/5 blur-3xl rounded-full transition-all group-hover:bg-emerald-500/10"></div>
            
            <h3 className="font-bold text-foreground text-xl border-b border-white/5 pb-3 flex items-center gap-3">
              <Sprout className="text-primary" size={24}/> Farm Intelligence
            </h3>
            
            <div className="space-y-4 relative z-10">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Farmer Type</label>
                  <select 
                    name="farmer_type" 
                    value={formData.farmer_type}
                    onChange={handleChange} 
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Small-scale">Small-scale</option>
                    <option value="Medium">Medium</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Research">Research</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Land (Acres)</label>
                  <input 
                    required 
                    type="number" 
                    step="0.1" 
                    name="land_size" 
                    value={formData.land_size}
                    onChange={handleChange} 
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-all" 
                    placeholder="2.5" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Main Crops Cultivated</label>
                <input 
                  required 
                  name="main_crops" 
                  value={formData.main_crops}
                  onChange={handleChange} 
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/20" 
                  placeholder="e.g., Tomato, Turmeric, Sugarcane" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Years of Experience</label>
                <input 
                  required 
                  type="number" 
                  name="farming_experience" 
                  value={formData.farming_experience}
                  onChange={handleChange} 
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-all" 
                  placeholder="10" 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-primary hover:bg-emerald-500 text-primary-foreground px-10 py-4 rounded-2xl font-bold transition-all shadow-[0_10px_20px_rgba(16,185,129,0.2)] hover:shadow-[0_15px_30px_rgba(16,185,129,0.3)] hover:-translate-y-1 flex items-center gap-3 disabled:opacity-50 disabled:translate-y-0"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {saving ? 'Saving Changes...' : 'Update EcoLinguist Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Simple Helper Component
function ChevronDown({ size }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
