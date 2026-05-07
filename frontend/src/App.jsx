import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Home, FileText, Camera, MapPin, User as UserIcon, Bell, 
  Sprout, CloudRain, Sun, Settings, LogOut, Moon, Activity,
  ShieldCheck, FileCheck, ArrowRight, AlertTriangle, Play, Info
} from 'lucide-react';
import PDFChatPage from './pages/PDFChatPage';
import ImageAnalysisPage from './pages/ImageAnalysisPage';
import MapResourcePage from './pages/MapResourcePage';
import CreateProfilePage from './pages/CreateProfilePage';
import ProfilePage from './pages/ProfilePage';
import GovtSchemesPage from './pages/GovtSchemesPage';
import Login from './pages/Login';
import VoiceAssistant from './components/voice/VoiceAssistant';
import { getProfile, getSchemes } from './services/api';

// Weather Widget Component
function WeatherWidget({ location }) {
  const [weather, setWeather] = useState({ temp: '28°C', condition: 'Partly Cloudy' });
  
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-black/5 dark:bg-black/20 rounded-full border border-black/5 dark:border-white/5 backdrop-blur-md transition-all hover:bg-black/10 dark:hover:bg-black/30">
      <div className="text-primary animate-float">
        <CloudRain size={20} />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-foreground leading-none">{weather.temp}</span>
        <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase mt-0.5">{weather.condition}</span>
      </div>
    </div>
  );
}

// Dashboard Widgets
function CropHealthWidget({ crops }) {
  return (
    <div className="glass-panel p-6 flex flex-col justify-between group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 text-primary p-2.5 rounded-xl border border-primary/20">
            <Activity size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">Crop Health</h3>
            <p className="text-xs text-muted-foreground">{crops || 'Add your crops in profile'}</p>
          </div>
        </div>
        <span className="bg-amber-500/10 text-amber-500 font-bold px-3 py-1 rounded-full text-sm border border-amber-500/20">
          65% Health
        </span>
      </div>
      
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-foreground bg-black/5 dark:bg-white/5 p-3 rounded-lg border border-black/5 dark:border-white/5">
          <AlertTriangle size={16} className="text-amber-500 shrink-0" />
          <span className="font-medium">Early Blight detected. High risk of spread.</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          LLaMA 70B recommends immediate application of copper-based fungicide to halt progression.
        </p>
      </div>
      
      <Link to="/image-analysis" className="flex items-center justify-between bg-primary hover:bg-emerald-500 text-primary-foreground px-4 py-3 rounded-xl transition-all font-medium group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]">
        Ask AI About This Crop
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}

function ClimateReportWidget() {
  return (
    <div className="glass-panel p-6 flex flex-col justify-between group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/20 text-blue-500 p-2.5 rounded-xl border border-blue-500/20">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">Climate Report AI</h3>
            <p className="text-xs text-muted-foreground">Tamil Nadu Monsoon '24.pdf</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-center mb-6">
        <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-primary/50 pl-3">
          "Based on the report, expect heavy rainfall in the 3rd week of July. Delay sowing by 5 days."
        </p>
      </div>
      
      <Link to="/pdf-chat" className="flex items-center justify-center gap-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground border border-black/10 dark:border-white/10 px-4 py-3 rounded-xl transition-all font-medium">
        Continue Chat
      </Link>
    </div>
  );
}

function GovtSchemesWidget({ schemes }) {
  const displaySchemes = schemes?.slice(0, 2) || [];
  
  return (
    <div className="glass-panel p-6 flex flex-col justify-between relative overflow-hidden group">
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full"></div>
      
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-emerald-500/20 text-emerald-500 p-2.5 rounded-xl border border-emerald-500/20">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h3 className="font-bold text-lg text-foreground">Govt Schemes</h3>
          <p className="text-xs text-muted-foreground">Personalized for you</p>
        </div>
      </div>
      
      <div className="space-y-3 mb-6 relative z-10">
        {displaySchemes.length > 0 ? displaySchemes.map((scheme, i) => (
          <div key={scheme.id} className={`p-3 bg-black/5 dark:bg-white/5 rounded-xl border ${i === 0 ? 'border-primary/30' : 'border-white/5'} group-hover:border-primary/50 transition-colors`}>
            <div className="flex justify-between items-start mb-1">
              <span className="font-bold text-foreground text-sm truncate max-w-[140px]">{scheme.title}</span>
              <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded font-bold uppercase">Eligible</span>
            </div>
            <p className="text-[10px] text-muted-foreground line-clamp-1">{scheme.benefits}</p>
          </div>
        )) : (
          <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-white/5 animate-pulse">
            <div className="h-4 w-2/3 bg-white/10 rounded mb-2" />
            <div className="h-3 w-full bg-white/5 rounded" />
          </div>
        )}
      </div>
      
      <Link to="/schemes" className="flex items-center justify-center gap-2 text-primary hover:text-emerald-400 font-bold text-sm transition-colors group/link">
        View All Eligible Schemes <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}

function QuickActionsWidget() {
  return (
    <div className="glass-panel p-6 flex flex-col justify-center gap-4">
      <Link to="/image-analysis" className="flex items-center gap-4 p-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 rounded-xl transition-all group">
        <div className="bg-primary/20 text-primary p-3 rounded-full group-hover:scale-110 transition-transform">
          <Camera size={20} />
        </div>
        <div>
          <h4 className="font-bold text-foreground">Scan Crop Image</h4>
          <p className="text-xs text-muted-foreground">Get instant disease detection</p>
        </div>
      </Link>
      
      <Link to="/resources" className="flex items-center gap-4 p-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 rounded-xl transition-all group">
        <div className="bg-amber-500/20 text-amber-500 p-3 rounded-full group-hover:scale-110 transition-transform">
          <MapPin size={20} />
        </div>
        <div>
          <h4 className="font-bold text-foreground">Find Nearby Resources</h4>
          <p className="text-xs text-muted-foreground">Seeds & Fertilizers near you</p>
        </div>
      </Link>
    </div>
  );
}

// Main Dashboard
function Dashboard({ profileData, schemes }) {
  const name = profileData?.first_name || profileData?.username || 'Farmer';
  const crops = profileData?.profile?.main_crops;

  return (
    <div className="max-w-7xl mx-auto animate-slide-up space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">EcoLinguist Command Center</h1>
        <p className="text-lg text-muted-foreground">Welcome back, {name}. Here is your AI agricultural overview.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CropHealthWidget crops={crops} />
        </div>
        <GovtSchemesWidget schemes={schemes} />
        <ClimateReportWidget />
        <QuickActionsWidget />
      </div>
    </div>
  );
}

function Sidebar() {
  const location = useLocation();
  const links = [
    { path: '/', label: 'Command Center', icon: Home },
    { path: '/schemes', label: 'Govt Schemes', icon: ShieldCheck },
    { path: '/pdf-chat', label: 'Climate Intelligence', icon: FileText },
    { path: '/image-analysis', label: 'Crop Analysis', icon: Camera },
    { path: '/resources', label: 'Resource Map', icon: MapPin },
  ];

  return (
    <div className="hidden md:flex w-64 glass-sidebar flex-col relative z-20">
      <div className="p-6 flex items-center gap-3 text-foreground font-bold text-2xl tracking-tight border-b border-black/5 dark:border-white/5">
        <div className="bg-primary/20 text-primary p-2 rounded-lg border border-primary/30"><Sprout size={24} /></div>
        EcoLinguist
      </div>
      <div className="flex-1 py-6 px-4 flex flex-col gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link 
              key={link.path} 
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'}`}
            >
              <Icon size={20} className={isActive ? 'text-primary' : ''} />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function BottomNav() {
  const location = useLocation();
  const links = [
    { path: '/', icon: Home },
    { path: '/schemes', icon: ShieldCheck },
    { path: '/pdf-chat', icon: FileText },
    { path: '/image-analysis', icon: Camera },
    { path: '/resources', icon: MapPin },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 glass-navbar px-6 py-4 flex justify-between items-center z-40 pb-safe">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = location.pathname === link.path;
        return (
          <Link key={link.path} to={link.path} className={`p-3 rounded-full transition-all ${isActive ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            <Icon size={24} />
          </Link>
        );
      })}
    </div>
  );
}

function Navbar({ toggleTheme, isDark, profileData }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const name = profileData?.first_name || profileData?.username || 'User';
  const initial = name.charAt(0).toUpperCase();
  const location = profileData?.profile?.location || 'Set Location';

  return (
    <div className="h-20 glass-navbar px-4 md:px-8 flex items-center justify-between z-30 sticky top-0">
      <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm md:text-base">
        <MapPin size={18} className="text-primary hidden md:block" />
        <span className="hidden md:block">{location}</span>
        
        {/* Mobile Header branding */}
        <div className="md:hidden flex items-center gap-2 text-foreground font-bold text-xl">
          <Sprout size={20} className="text-primary" /> EcoLinguist
        </div>
      </div>
      
      <div className="flex items-center gap-4 md:gap-6">
        <div className="hidden md:block"><WeatherWidget location={location} /></div>
        <div className="hidden md:block h-8 w-px bg-black/10 dark:bg-white/10"></div>
        
        <button className="relative text-muted-foreground hover:text-foreground transition-colors">
          <Bell size={22} />
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
        </button>
        
        <div className="relative">
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-xl transition-colors border border-transparent hover:border-black/5 dark:hover:border-white/5"
          >
            <div className="w-10 h-10 bg-gradient-to-tr from-primary to-emerald-300 border border-black/10 dark:border-white/10 rounded-full flex items-center justify-center text-primary-foreground font-bold shadow-inner transition-transform hover:scale-105 active:scale-95">
              {initial}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold text-foreground">{name}</p>
              <p className="text-[10px] text-primary font-bold tracking-widest uppercase">{profileData?.profile?.farmer_type || 'PRO FARMER'}</p>
            </div>
          </div>
          
          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 glass-panel overflow-hidden animate-slide-up shadow-2xl z-50 origin-top-right">
              <div className="p-4 border-b border-black/5 dark:border-white/5 bg-black/5">
                <p className="font-bold text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground truncate">{profileData?.profile?.preferred_language} | {profileData?.profile?.farmer_type}</p>
              </div>
              <div className="p-2 flex flex-col gap-1">
                <Link to="/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-lg w-full text-left transition-colors">
                  <UserIcon size={16} className="text-primary" /> Edit EcoLinguist Profile
                </Link>
                <Link to="/create-profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-lg w-full text-left transition-colors">
                  <PlusCircle size={16} /> Create New Profile
                </Link>
                <button className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-lg w-full text-left transition-colors">
                  <Settings size={16} /> Settings
                </button>
                <button 
                  onClick={toggleTheme}
                  className="flex items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-lg w-full text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isDark ? <Sun size={16} /> : <Moon size={16} />} 
                    Theme
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">{isDark ? 'DARK' : 'LIGHT'}</span>
                </button>
              </div>
              <div className="p-2 border-t border-black/5 dark:border-white/5">
                <button 
                  onClick={() => {
                    localStorage.removeItem('access_token');
                    window.location.href = '/login';
                  }}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg w-full text-left transition-colors font-medium"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PlusCircle({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/>
    </svg>
  );
}

function App() {
  const [isDark, setIsDark] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const isAuthenticated = !!localStorage.getItem('access_token');

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
    } else {
      setIsDark(true);
    }
  }, []);

  // Fetch profile and schemes when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([getProfile(), getSchemes()])
        .then(([pRes, sRes]) => {
          setProfileData(pRes.data);
          setSchemes(sRes.data);
        })
        .catch(err => console.error("Failed to fetch initial data", err));
    }
  }, [isAuthenticated]);

  // Apply theme class to HTML element
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <BrowserRouter>
      {!isAuthenticated ? (
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      ) : (
        <div className="flex h-screen overflow-hidden font-sans bg-background text-foreground transition-colors duration-300">
          <Sidebar />
          <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
            <Navbar toggleTheme={toggleTheme} isDark={isDark} profileData={profileData} />
            <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 relative z-0">
              <Routes>
                <Route path="/" element={<Dashboard profileData={profileData} schemes={schemes} />} />
                <Route path="/pdf-chat" element={<PDFChatPage />} />
                <Route path="/image-analysis" element={<ImageAnalysisPage />} />
                <Route path="/resources" element={<MapResourcePage />} />
                <Route path="/create-profile" element={<CreateProfilePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/schemes" element={<GovtSchemesPage />} />
                <Route path="/login" element={<Login />} />
              </Routes>
            </main>
            <BottomNav />
          </div>
          <VoiceAssistant />
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;
