import React, { useState } from 'react';
import { Mic, X, Volume2, Square } from 'lucide-react';
import { processVoice } from '../../services/api';

export default function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  const [isSpeaking, setIsSpeaking] = useState(false);

  const toggleAssistant = () => setIsOpen(!isOpen);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition. Please try Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'ta-IN'; 
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('Listening...');
      setResponse('');
    };
    
    recognition.onresult = async (event) => {
      const recognizedText = event.results[0][0].transcript;
      setTranscript(recognizedText);
      setIsListening(false);
      
      try {
        setResponse('Consulting AI...');
        const res = await processVoice({ text: recognizedText });
        const aiText = res.data.ai_text || res.data.response || 'Enna solla nu puriyala.';
        setResponse(aiText);
        speakText(aiText);
      } catch (error) {
        console.error(error);
        setResponse('Mannikavum, network error.');
      }
    };
    
    recognition.onerror = (event) => {
      setIsListening(false);
      setTranscript('Sariyaga ketkavillai. Marubadiyum muyarchikkavum.');
    };
    
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
  };
  
  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ta-IN';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={toggleAssistant}
        className="fixed bottom-6 right-6 bg-primary hover:bg-emerald-600 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-105 z-50 flex items-center justify-center"
      >
        <Mic size={28} />
      </button>

      {/* Assistant Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center animate-slide-up p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh]">
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Mic size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">EcoLinguist AI</h3>
                  <p className="text-xs text-slate-300">Kongu Voice Assistant</p>
                </div>
              </div>
              <button onClick={toggleAssistant} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Conversation Area */}
            <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto bg-slate-50">
              {transcript && transcript !== 'Listening...' && (
                <div className="self-end max-w-[85%]">
                  <div className="bg-slate-200 text-slate-800 p-4 rounded-2xl rounded-tr-none text-sm font-medium">
                    "{transcript}"
                  </div>
                </div>
              )}
              
              {response && (
                <div className="self-start max-w-[85%] flex gap-2 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary shrink-0 flex items-center justify-center text-white mt-1">
                    <Volume2 size={14} />
                  </div>
                  <div className="bg-primary/10 border border-primary/20 text-slate-800 p-4 rounded-2xl rounded-tl-none text-sm leading-relaxed font-medium">
                    {response}
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="p-8 bg-white flex flex-col items-center justify-center border-t border-slate-100">
              {isListening ? (
                <div className="flex flex-col items-center gap-6 w-full">
                  <div className="flex items-center justify-center gap-1 h-12">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div 
                        key={i} 
                        className="w-2 bg-primary rounded-full animate-pulse-wave"
                        style={{ height: `${Math.max(20, Math.random() * 100)}%`, animationDelay: `${i * 0.1}s` }}
                      ></div>
                    ))}
                  </div>
                  <button 
                    onClick={stopListening}
                    className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105"
                  >
                    <Square size={24} fill="currentColor" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm text-slate-500 font-medium">Tap to speak in Kongu Tamil</p>
                  <button 
                    onClick={startListening}
                    className="bg-primary hover:bg-emerald-600 text-white p-6 rounded-full shadow-xl transition-all hover:scale-105 hover:shadow-primary/30"
                  >
                    <Mic size={36} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
