import React, { useState } from 'react';
import { login, register } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const res = await login({ username: formData.username, password: formData.password });
        localStorage.setItem('access_token', res.data.access);
        navigate('/');
      } else {
        const res = await register(formData);
        localStorage.setItem('access_token', res.data.access);
        navigate('/');
      }
    } catch (err) {
      alert("Error: " + JSON.stringify(err.response?.data || err.message));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-light)]">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 w-full max-w-md animate-slide-up">
        <h2 className="text-3xl font-bold text-primary mb-2 flex items-center gap-2">🌱 EcoLinguist</h2>
        <p className="text-gray-500 mb-8">{isLogin ? 'Welcome back! Log in to continue.' : 'Create an account to get started.'}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary" placeholder="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required minHeight="44px"/>
          {!isLogin && (
            <input className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary" type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required minHeight="44px"/>
          )}
          <input className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary" type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required minHeight="44px"/>
          
          <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition shadow-sm" style={{minHeight: "44px"}}>
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-sm font-medium text-blue-500 hover:text-blue-600 p-2">
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}
