import React, { useEffect, useState } from 'react';
import { getSchemes } from '../services/api';
import { BookOpen, CheckCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';

export default function Schemes() {
  const [schemes, setSchemes] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getSchemes().then(res => setSchemes(res.data)).catch(err => console.error(err));
  }, []);

  return (
    <div className="max-w-3xl mx-auto animate-slide-up">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary/10 p-3 rounded-2xl text-primary">
          <BookOpen size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-bold">Government Schemes</h2>
          <p className="text-gray-500">AI-simplified guides to financial support.</p>
        </div>
      </div>

      <div className="space-y-4">
        {schemes.map((scheme, idx) => (
          <div key={scheme.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <button 
              onClick={() => setExpanded(expanded === idx ? null : idx)}
              className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
            >
              <div className="flex-1 pr-4">
                <h3 className="text-lg font-bold text-gray-800">{scheme.title}</h3>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">{scheme.location}</span>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">{scheme.crop} Farming</span>
                </div>
              </div>
              <div className="bg-gray-50 p-2 rounded-full text-gray-400">
                {expanded === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>
            
            {expanded === idx && (
              <div className="px-6 pb-6 pt-2 border-t border-gray-50 animate-slide-up">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="flex items-center gap-2 font-bold text-gray-700 mb-2">
                      <CheckCircle size={16} className="text-primary" /> Benefits
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{scheme.benefits}</p>
                    
                    <h4 className="flex items-center gap-2 font-bold text-gray-700 mt-4 mb-2">
                      <Info size={16} className="text-blue-500" /> Eligibility
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{scheme.eligibility}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <h4 className="font-bold text-gray-700 mb-3">How to Apply</h4>
                    <ul className="text-sm text-gray-600 space-y-2 list-decimal pl-4">
                      {scheme.how_to_apply.split('\n').map((step, i) => {
                        const cleanStep = step.replace(/^\d+\.\s*/, '');
                        return <li key={i}>{cleanStep}</li>
                      })}
                    </ul>
                    <button className="mt-4 w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary/90 transition shadow-sm">
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
