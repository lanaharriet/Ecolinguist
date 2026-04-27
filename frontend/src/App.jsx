import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import VoiceInput from './pages/VoiceInput';
import Schemes from './pages/Schemes';
import Resources from './pages/Resources';
import Login from './pages/Login';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="voice" element={<VoiceInput />} />
          <Route path="schemes" element={<Schemes />} />
          <Route path="resources" element={<Resources />} />
          {/* Missing report view for brevity in demo, redirecting to voice input for now */}
          <Route path="report/:id" element={<div className="p-8 font-bold text-center">Report details implemented here</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
