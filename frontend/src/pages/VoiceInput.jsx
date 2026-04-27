import React, { useState, useRef } from 'react';
import { Mic, Square, Loader, Play, AlertCircle, FilePlus, X } from 'lucide-react';
import { processVoice } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function VoiceInput() {
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  // Redirect if not logged in
  React.useEffect(() => {
    if (!localStorage.getItem('access_token')) {
      navigate('/login');
    }
  }, []);

  const startRecording = async () => {
    setError('');
    setIsRecording(true);
    setRecognizedText('Listening...');
    setResponse(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Native fallback for instant UI transcription
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.onresult = (event) => {
          let text = '';
          for (let i = 0; i < event.results.length; i++) {
            text += event.results[i][0].transcript;
          }
          setRecognizedText(text);
        };
        recognitionRef.current.start();
      }

      mediaRecorder.start();
    } catch (err) {
      setError('Microphone access denied or unavailable.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recognitionRef.current) recognitionRef.current.stop();
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await uploadToBackend(audioBlob);
      };
      mediaRecorderRef.current.stop();
    } else if (recognizedText) {
      // Manual/Fallback
      uploadToBackend(null);
    }
  };

  const uploadToBackend = async (audioBlob) => {
    setIsProcessing(true);
    const formData = new FormData();
    if (audioBlob) formData.append('audio', audioBlob, 'recording.webm');
    if (recognizedText && recognizedText !== 'Listening...') formData.append('text', recognizedText);
    if (pdfFile) formData.append('document', pdfFile);

    try {
      const res = await processVoice(formData);
      setResponse(res.data);
      if (res.data.recognized_text) setRecognizedText(res.data.recognized_text);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process voice input.');
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePdfUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };
  
  const playAudio = () => {
    if (response?.audio_url) {
      try {
        const audio = new Audio(response.audio_url);
        audio.play();
      } catch (err) {
        fallbackPlay();
      }
    } else {
      fallbackPlay();
    }
  };

  const fallbackPlay = () => {
    if (response?.ai_text) {
      const utterance = new SpeechSynthesisUtterance(response.ai_text);
      window.speechSynthesis.speak(utterance);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 animate-slide-up pb-24">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3">Speak to EcoLinguist</h2>
        <p className="text-gray-500">Describe your crop condition or upload a soil report pdf.</p>
      </div>

      <div className="flex flex-col items-center justify-center">
        <button
          className={`relative flex items-center justify-center w-32 h-32 rounded-full shadow-lg transition-all ${
            isRecording ? 'bg-red-500 scale-110 shadow-red-200' : 'bg-primary hover:bg-primary/90'
          }`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
        >
          {isRecording ? (
            <div className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-20"></div>
          ) : null}
          {isRecording ? <Square size={40} color="white" /> : <Mic size={48} color="white" />}
        </button>
        <p className="mt-6 text-gray-500 font-medium">
          {isProcessing ? 'Analyzing...' : isRecording ? 'Tap to stop' : 'Tap to speak'}
        </p>

        {/* PDF Upload Button */}
        {!isRecording && !isProcessing && (
          <div className="mt-4 flex items-center gap-2">
            <input type="file" id="pdfUpload" className="hidden" accept=".pdf" onChange={handlePdfUpload} />
            <label htmlFor="pdfUpload" className="flex items-center gap-2 cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-full font-medium shadow-sm hover:bg-blue-100 min-h-[44px]">
              <FilePlus size={18} /> {pdfFile ? pdfFile.name : 'Upload Report PDF'}
            </label>
            {pdfFile && <button onClick={() => setPdfFile(null)} className="p-2 text-red-500 bg-red-50 rounded-full hover:bg-red-100 min-h-[44px] min-w-[44px] flex items-center justify-center"><X size={16}/></button>}
          </div>
        )}
      </div>

      <div className="mt-8 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 min-h-[150px]">
        {error && (
          <div className="flex items-center gap-2 text-red-500 mb-4 bg-red-50 p-3 rounded-lg">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <h3 className="font-bold text-gray-400 uppercase text-xs tracking-wider mb-2">You said:</h3>
        <p className="text-lg text-gray-800 min-h-[60px]">
          {recognizedText || <span className="text-gray-300 italic">...</span>}
        </p>

        {isProcessing && (
          <div className="mt-8 border-t border-gray-100 pt-6 flex items-center gap-3 text-primary">
            <Loader className="animate-spin" size={20} />
            <span className="font-medium">AI is analyzing the data...</span>
          </div>
        )}

        {response && !isProcessing && response.full_report && (
          <div className="mt-8 border-t border-gray-100 pt-6 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-primary uppercase text-xs tracking-wider">AI Assistant Response:</h3>
              <button 
                onClick={playAudio} 
                className="flex items-center justify-center gap-1.5 text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full font-bold text-gray-800 transition min-h-[44px]"
              >
                <Play size={16} className="text-primary fill-current" /> Play Voice
              </button>
            </div>
            <div className="space-y-4">
              <div className={`p-4 rounded-xl font-medium border ${response.full_report.status === 'Healthy' ? 'bg-green-50 border-green-100 text-green-800' : response.full_report.status === 'Moderate' ? 'bg-yellow-50 border-yellow-100 text-yellow-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                Status: {response.full_report.status}
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-bold text-gray-700 mb-1 text-sm">Issues Identified</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{response.full_report.issues_identified}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <h4 className="font-bold text-blue-800 mb-1 text-sm">Recommendations</h4>
                <p className="text-blue-900 text-sm leading-relaxed">{response.full_report.recommendations}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <h4 className="font-bold text-green-800 mb-1 text-sm">Step-by-Step Guidance</h4>
                <div className="text-green-900 text-sm leading-relaxed whitespace-pre-wrap">{response.full_report.step_by_step_guidance}</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg border border-red-100 flex gap-2">
                <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm font-medium">Risk: {response.full_report.loss_prediction}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
