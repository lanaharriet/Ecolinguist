import React, { useState } from 'react';
import axios from 'axios';
import { Camera, Upload, AlertTriangle, CheckCircle, Leaf, Mic, Volume2, Square } from 'lucide-react';

export default function ImageAnalysisPage() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState('English');

  const getLocalizedMessage = (type, lang) => {
    const messages = {
      English: {
        title: 'Crop & Soil Image Analysis',
        subtitle: 'Upload a picture of your crop or soil to get instant AI-powered health insights.',
        uploadBtn: 'Open Camera / Gallery',
        changeBtn: 'Change Image',
        analyzeBtn: 'Ask AI to Analyze',
        analyzing: 'AI is analyzing your image...',
        analyzingSub: 'Extracting features and consulting LLaMA 70B for agricultural intelligence.',
        placeholder: 'Upload an image and run analysis to see AI insights here.',
        diagnosis: 'AI Assessment'
      },
      Tamil: {
        title: 'பயிர் மற்றும் மண் பட ஆய்வு',
        subtitle: 'உங்கள் பயிர் அல்லது மண்ணின் படத்தைப் பதிவேற்றி உடனடி AI நுண்ணறிவுகளைப் பெறுங்கள்.',
        uploadBtn: 'கேமரா / கேலரியைத் திறக்கவும்',
        changeBtn: 'படத்தை மாற்றவும்',
        analyzeBtn: 'AI-யிடம் ஆய்வு செய்யச் சொல்லுங்கள்',
        analyzing: 'AI உங்கள் படத்தை ஆய்வு செய்கிறது...',
        analyzingSub: 'அம்சங்களைப் பிரித்தெடுத்து விவசாய நுண்ணறிவுக்காக LLaMA 70B-ஐ அணுகுகிறது.',
        placeholder: 'AI நுண்ணறிவுகளைக் காண ஒரு படத்தைப் பதிவேற்றி ஆய்வைத் தொடங்கவும்.',
        diagnosis: 'AI மதிப்பீடு'
      },
      'Kongu Tanglish': {
        title: 'Crop & Soil Image Analysis',
        subtitle: 'Ungala payir illa mannu photo-va upload panni AI kitta result kelunga.',
        uploadBtn: 'Camera-va thorainga',
        changeBtn: 'Photo-va mathunga',
        analyzeBtn: 'AI kitta katti kelunga',
        analyzing: 'AI check pannittu irukku...',
        analyzingSub: 'Namma LLaMA 70B kitta kettu solluraen...',
        placeholder: 'Oru photo upload panni check panni paarunga.',
        diagnosis: 'AI Assessment'
      }
    };
    return messages[lang][type] || messages['English'][type];
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition. Please try Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'English' ? 'en-IN' : 'ta-IN';
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("Speech heard:", transcript);
      analyzeImage();
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const speakText = (text, langCode) => {
    if (!window.speechSynthesis) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setAnalyzing(true);
    
    const formData = new FormData();
    formData.append('file', image);
    formData.append('language', language);
    
    try {
      const res = await axios.post('http://localhost:8000/api/image/analyze/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const { vision_analysis, ai_recommendation } = res.data.results;
      setResult({
        crop: vision_analysis.crop_type,
        health: vision_analysis.risk_level === 'High' ? 'Risk' : 'Healthy',
        disease: vision_analysis.disease_detected,
        insight: ai_recommendation
      });
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.error || error.message || "Unknown error";
      setResult({
        crop: "Error",
        health: "Issue",
        insight: `Failed to connect to AI engine: ${errorMsg}. Please check your internet or API key in backend/.env.`
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 animate-slide-up">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Camera className="text-primary" size={32} />
            {getLocalizedMessage('title', language)}
          </h1>
          <p className="text-muted-foreground mt-2">{getLocalizedMessage('subtitle', language)}</p>
        </div>
        
        <div className="flex items-center gap-2 bg-black/5 dark:bg-[rgba(30,32,34,0.6)] backdrop-blur-md border border-black/5 dark:border-white/5 p-1 rounded-xl">
          {['English', 'Tamil', 'Kongu Tanglish'].map(lang => (
            <button 
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${language === lang ? 'bg-primary/20 text-primary border border-primary/30 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="glass-panel p-6 flex flex-col h-[500px]">
          {!preview ? (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-black/5 dark:bg-white/5">
              <Upload className="text-muted-foreground mb-4" size={48} />
              <h3 className="text-lg font-medium text-foreground mb-2">{getLocalizedMessage('uploadBtn', language)}</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-[250px] text-center">Supported formats: JPG, PNG, WEBP (Max 5MB)</p>
              
              <input 
                type="file" 
                accept="image/*" 
                id="image-upload" 
                className="hidden"
                onChange={handleImageChange}
              />
              <label 
                htmlFor="image-upload" 
                className="cursor-pointer bg-card hover:bg-black/5 dark:hover:bg-white/10 text-primary border border-primary px-6 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
              >
                <Camera size={18} />
                {getLocalizedMessage('uploadBtn', language)}
              </label>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="relative flex-1 bg-black rounded-xl overflow-hidden mb-4">
                <img src={preview} alt="Crop Preview" className="w-full h-full object-contain" />
              </div>
              <div className="flex gap-4">
                <input 
                  type="file" 
                  accept="image/*" 
                  id="image-upload-change" 
                  className="hidden"
                  onChange={handleImageChange}
                />
                <label 
                  htmlFor="image-upload-change" 
                  className="cursor-pointer flex-1 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground py-3 rounded-lg font-medium transition-colors text-center border border-border flex items-center justify-center"
                >
                  {getLocalizedMessage('changeBtn', language)}
                </label>
                <button 
                  onClick={startListening}
                  className={`bg-black/5 dark:bg-white/5 py-3 px-4 rounded-lg font-medium transition-colors border border-border flex items-center justify-center ${isListening ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-muted-foreground hover:bg-black/10 dark:hover:bg-white/10 hover:text-primary'}`}
                  title={isListening ? "Listening..." : "Speak query (Tamil supported)"}
                >
                  <Mic size={20} />
                </button>
                <button 
                  onClick={analyzeImage}
                  disabled={analyzing}
                  className="flex-1 bg-primary hover:bg-emerald-600 text-primary-foreground py-3 rounded-lg font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {analyzing ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      {getLocalizedMessage('analyzeBtn', language)}...
                    </span>
                  ) : getLocalizedMessage('analyzeBtn', language)}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="glass-panel p-6 h-[500px] overflow-y-auto">
          {analyzing ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                <Leaf className="absolute inset-0 m-auto text-primary" size={32} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{getLocalizedMessage('analyzing', language)}</h3>
              <p className="text-muted-foreground">{getLocalizedMessage('analyzingSub', language)}</p>
            </div>
          ) : result ? (
            <div className="animate-slide-up space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{result.crop}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {result.health === 'Healthy' ? (
                      <span className="flex items-center gap-1 text-sm font-medium text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-md">
                        <CheckCircle size={14} /> Healthy
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm font-medium text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">
                        <AlertTriangle size={14} /> {result.health}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {result.disease && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <h4 className="font-bold text-red-500 flex items-center gap-2 mb-1">
                    <AlertTriangle size={18} />
                    Disease Detected
                  </h4>
                  <p className="text-red-400 font-medium">{result.disease}</p>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-foreground text-lg">{getLocalizedMessage('diagnosis', language)}</h4>
                  <button 
                    onClick={() => speakText(result.insight, language === 'English' ? 'en-IN' : 'ta-IN')} 
                    className={`p-1 rounded-full transition-colors ${isSpeaking ? 'text-red-500 bg-red-500/10' : 'text-muted-foreground hover:text-primary'}`}
                    title={isSpeaking ? "Stop" : "Listen"}
                  >
                    {isSpeaking ? <Square size={18} /> : <Volume2 size={18} />}
                  </button>
                </div>
                <div className="bg-black/5 dark:bg-white/5 rounded-xl p-4 border border-border text-foreground leading-relaxed">
                  {result.insight}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <Leaf size={48} className="mb-4 opacity-50" />
              <p>{getLocalizedMessage('placeholder', language)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
