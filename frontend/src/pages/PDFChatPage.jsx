import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Upload, FileText, MessageSquare, Send, Loader2, Maximize2, Sprout, Mic, Volume2, Square } from 'lucide-react';

export default function PDFChatPage() {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [documentId, setDocumentId] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('English');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const getLocalizedMessage = (type, lang) => {
    const messages = {
      English: {
        welcome: 'Vannakam! Upload a climate report PDF and ask me any questions about it.',
        success: 'PDF uploaded successfully! What would you like to know?',
        error: 'Failed to upload PDF. Please try again.',
        processing: 'Error getting response from AI.'
      },
      Tamil: {
        welcome: 'வணக்கம்! காலநிலை அறிக்கை PDF-ஐ பதிவேற்றி, அது பற்றிய உங்கள் கேள்விகளை என்னிடம் கேட்கலாம்.',
        success: 'PDF வெற்றிகரமாக பதிவேற்றப்பட்டது! நீங்கள் என்ன தெரிந்து கொள்ள விரும்புகிறீர்கள்?',
        error: 'PDF பதிவேற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
        processing: 'AI-யிலிருந்து பதிலை பெறுவதில் பிழை.'
      },
      'Kongu Tanglish': {
        welcome: 'Vannakam! Climate report PDF-a upload pannitu ungala kelvigala kelunga.',
        success: 'PDF super-a upload aayiduchu! Enna kekkanum nu sollunga?',
        error: 'PDF upload aagala. Innoru thadava try pannunga.',
        processing: 'AI kitta irunthu pathil varala.'
      }
    };
    return messages[lang][type] || messages['English'][type];
  };

  const [messages, setMessages] = useState([
    { role: 'assistant', content: getLocalizedMessage('welcome', 'English'), isStreaming: false }
  ]);
  
  const messagesEndRef = useRef(null);

  // Update initial welcome message when language changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'assistant') {
      setMessages([{ role: 'assistant', content: getLocalizedMessage('welcome', language), isStreaming: false }]);
    }
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      setInput(prev => prev ? prev + ' ' + transcript : transcript);
    };
    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) {
      alert("Your browser does not support Text to Speech.");
      return;
    }
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'English' ? 'en-IN' : 'ta-IN';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await axios.post('http://localhost:8000/api/pdf/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDocumentId(res.data.document_id);
      setMessages([...messages, { role: 'assistant', content: getLocalizedMessage('success', language), isStreaming: false }]);
    } catch (error) {
      console.error(error);
      setMessages([...messages, { role: 'assistant', content: getLocalizedMessage('error', language), isStreaming: false }]);
    } finally {
      setUploading(false);
    }
  };

  const simulateStreaming = (fullText) => {
    const words = fullText.split(' ');
    let currentText = '';
    
    setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }]);
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < words.length) {
        currentText += (i === 0 ? '' : ' ') + words[i];
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'assistant', content: currentText, isStreaming: true };
          return newMessages;
        });
        i++;
      } else {
        clearInterval(interval);
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'assistant', content: currentText, isStreaming: false };
          return newMessages;
        });
        setLoading(false);
      }
    }, 40); 
  };

  const handleSend = async () => {
    if (!input.trim() || !documentId) return;
    
    const userMessage = { role: 'user', content: input, isStreaming: false };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:8000/api/pdf/chat/', {
        question: userMessage.content,
        language: language,
        document_id: documentId
      });
      
      simulateStreaming(res.data.answer);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: getLocalizedMessage('processing', language), isStreaming: false }]);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl h-[calc(100vh-100px)] flex flex-col animate-slide-up">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <FileText className="text-primary" size={32} />
          Climate Intelligence
        </h1>
        <div className="flex items-center gap-3 bg-black/5 dark:bg-[rgba(30,32,34,0.6)] backdrop-blur-md border border-black/5 dark:border-white/5 p-1 rounded-xl">
          {['English', 'Tamil', 'Kongu Tanglish'].map(lang => (
            <button 
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${language === lang ? 'bg-primary/20 text-primary border border-primary/30 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {!documentId ? (
        <div className="flex-1 flex flex-col items-center justify-center glass-panel p-8">
          <Upload className="text-muted-foreground mb-6" size={72} strokeWidth={1} />
          <h2 className="text-2xl font-bold mb-3 text-foreground">Upload Climate Report (PDF)</h2>
          <p className="text-muted-foreground mb-8 text-center max-w-md text-lg">Our LLaMA 70B powered AI will analyze the report and answer your questions intelligently in real-time.</p>
          
          <input 
            type="file" 
            accept="application/pdf" 
            id="pdf-upload" 
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex gap-4">
            <label 
              htmlFor="pdf-upload" 
              className="cursor-pointer bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground px-8 py-3 rounded-xl font-medium transition-colors border border-black/5 dark:border-white/10"
            >
              {file ? file.name : "Select PDF File"}
            </label>
            
            <button 
              onClick={handleUpload}
              disabled={!file || uploading}
              className="bg-primary hover:bg-emerald-500 text-primary-foreground px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading ? <Loader2 className="animate-spin" size={20} /> : null}
              {uploading ? 'Processing AI Embeddings...' : 'Analyze Document'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Sticky PDF Viewer */}
          <div className="hidden lg:flex w-1/2 glass-panel flex-col overflow-hidden">
            <div className="bg-black/5 dark:bg-[rgba(18,20,21,0.8)] p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <FileText className="text-primary" size={18} />
                <span className="truncate max-w-[300px]">{file?.name}</span>
              </div>
              <Maximize2 size={16} className="text-muted-foreground hover:text-foreground cursor-pointer" />
            </div>
            <div className="flex-1 bg-white">
              {fileUrl && (
                <iframe src={fileUrl} className="w-full h-full" title="PDF Viewer" />
              )}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 flex flex-col glass-panel overflow-hidden relative">
            <div className="bg-black/5 dark:bg-[rgba(18,20,21,0.8)] p-4 border-b border-black/5 dark:border-white/5 flex items-center gap-2">
              <MessageSquare className="text-primary" size={20} />
              <span className="font-medium text-foreground">AI Assistant</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary mr-3 mt-1 shrink-0">
                      <Sprout size={16} />
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-2xl p-4 leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-foreground rounded-tl-none relative group'}`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.isStreaming && <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse"></span>}
                    {msg.role === 'assistant' && !msg.isStreaming && (
                      <button 
                        onClick={() => speakText(msg.content)}
                        className={`absolute -right-10 top-2 p-1.5 bg-black/5 dark:bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-all border border-border dark:border-white/10 ${isSpeaking ? 'text-red-500 bg-red-500/10' : 'text-muted-foreground hover:text-primary'}`}
                        title={isSpeaking ? "Stop" : "Listen"}
                      >
                        {isSpeaking ? <Square size={16} /> : <Volume2 size={16} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {loading && messages[messages.length - 1].role === 'user' && (
                <div className="flex justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary mr-3 mt-1 shrink-0">
                    <Sprout size={16} />
                  </div>
                  <div className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-muted-foreground rounded-2xl rounded-tl-none p-4 flex items-center gap-3">
                    <Loader2 className="animate-spin text-primary" size={18} />
                    Consulting LLaMA 70B...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 bg-black/5 dark:bg-[rgba(18,20,21,0.8)] border-t border-black/5 dark:border-white/5">
              <div className="flex gap-2 relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask something about the climate report..."
                  className="flex-1 bg-card dark:bg-white/5 border border-border dark:border-white/10 text-foreground rounded-full px-6 py-4 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 pr-16 shadow-inner placeholder:text-muted-foreground"
                />
                <button 
                  onClick={startListening}
                  className={`absolute right-14 top-2 bottom-2 p-2 transition-colors flex items-center justify-center rounded-full ${isListening ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-muted-foreground hover:text-primary'}`}
                  title={isListening ? "Listening..." : "Speak"}
                >
                  <Mic size={20} />
                </button>
                <button 
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="absolute right-2 top-2 bottom-2 bg-primary text-primary-foreground px-4 rounded-full hover:bg-emerald-500 transition-colors disabled:opacity-50 flex items-center justify-center shadow-lg"
                >
                  <Send size={18} className="ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
