import React, { useState, useEffect } from 'react';
import { getSchemes, getProfile } from '../services/api';
import { ShieldCheck, Info, ArrowRight, Filter, Search, Loader2, CheckCircle2 } from 'lucide-react';

export default function GovtSchemesPage() {
  const [schemes, setSchemes] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schemesRes, profileRes] = await Promise.all([
        getSchemes(),
        getProfile()
      ]);
      setSchemes(schemesRes.data);
      setUserProfile(profileRes.data.profile);
    } catch (err) {
      console.error("Failed to fetch schemes", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchemes = schemes.filter(scheme => {
    const matchesSearch = scheme.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          scheme.benefits.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'All') return matchesSearch;
    
    if (filter === 'Eligible' && userProfile) {
      // 1. Land Size Check
      const landMatch = !scheme.max_land_size || (userProfile.land_size <= scheme.max_land_size);
      
      // 2. Location Check (State/District match)
      const userLoc = userProfile.location?.toLowerCase() || '';
      const schemeLoc = scheme.location?.toLowerCase() || '';
      const locationMatch = schemeLoc === 'all india' || userLoc.includes(schemeLoc) || schemeLoc.includes(userLoc);
      
      // 3. Farmer Type Check
      const userType = userProfile.farmer_type?.toLowerCase() || '';
      const schemeType = scheme.target_farmer_type?.toLowerCase() || '';
      const typeMatch = !schemeType || schemeType.includes(userType) || userType.includes(schemeType) || schemeType === 'all';
      
      return matchesSearch && landMatch && locationMatch && typeMatch;
    }
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={48} className="text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-slide-up space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 text-emerald-500 p-2 rounded-xl border border-emerald-500/20">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Government Schemes</h1>
          </div>
          <p className="text-lg text-muted-foreground ml-1">AI-powered recommendations based on your EcoLinguist profile.</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative group flex-1 sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search schemes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-all shadow-inner"
            />
          </div>
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            <button 
              onClick={() => setFilter('All')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === 'All' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-white'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('Eligible')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === 'Eligible' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-white'}`}
            >
              Eligible
            </button>
          </div>
        </div>
      </div>

      {/* Profile Match Alert */}
      {userProfile && (
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Matched with your Profile</p>
              <p className="text-xs text-muted-foreground">{userProfile.farmer_type} Farmer | {userProfile.land_size} Acres | {userProfile.location}</p>
            </div>
          </div>
          <button className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">Update Profile</button>
        </div>
      )}

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSchemes.map((scheme, index) => (
          <div key={scheme.id} className="glass-panel p-8 flex flex-col justify-between group relative overflow-hidden animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 blur-3xl rounded-full pointer-events-none transition-all group-hover:bg-primary/10" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{scheme.title}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 px-2 py-1 rounded text-muted-foreground">{scheme.location}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 border border-primary/20 px-2 py-1 rounded text-primary">Eligible</span>
                  </div>
                </div>
                <div className="bg-primary/20 text-primary p-3 rounded-2xl">
                  <Info size={24} />
                </div>
              </div>

              <div className="space-y-6 mb-10">
                <section>
                  <h4 className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2">Benefits</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{scheme.benefits}</p>
                </section>

                <section>
                  <h4 className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2">Eligibility</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{scheme.eligibility}</p>
                </section>
                
                <section className="bg-black/20 p-4 rounded-xl border border-white/5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-2">How to Apply</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">{scheme.how_to_apply}</p>
                </section>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSchemes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 glass-panel border-dashed">
          <Info size={48} className="text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-bold text-muted-foreground">No schemes found matching your search.</h3>
          <p className="text-sm text-muted-foreground/60">Try different keywords or clear your filters.</p>
        </div>
      )}
    </div>
  );
}
