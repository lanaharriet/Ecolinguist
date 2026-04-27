import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Mic, FileText, BookOpen, MapPin, LogOut } from 'lucide-react';

const NavItems = [
  { path: '/', label: 'Dashboard', icon: <Home size={20} /> },
  { path: '/voice', label: 'Voice Assistant', icon: <Mic size={20} /> },
  { path: '/schemes', label: 'Schemes', icon: <BookOpen size={20} /> },
  { path: '/resources', label: 'Resources', icon: <MapPin size={20} /> },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex bg-[var(--color-bg-light)] min-h-screen text-[var(--color-text-dark)] pb-16 md:pb-0">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            🌱 EcoLinguist
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {NavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                location.pathname === item.path
                  ? 'bg-primary text-white shadow-md'
                  : 'hover:bg-primary/10 text-gray-700'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button onClick={() => { localStorage.removeItem('access_token'); window.location.href='/login'; }} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-50 text-red-600 transition min-h-[44px]">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="md:hidden bg-white px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            🌱 EcoLinguist
          </h1>
          <button onClick={() => { localStorage.removeItem('access_token'); window.location.href='/login'; }} className="text-red-500 p-2 rounded-full hover:bg-red-50 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <LogOut size={20} />
          </button>
        </header>

        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {NavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center p-2 rounded-lg transition ${
              location.pathname === item.path ? 'text-primary' : 'text-gray-500'
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1 font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
