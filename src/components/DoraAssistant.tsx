import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, X, MessageSquare, Sparkles, Brain, Zap } from 'lucide-react';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const DORA_SYSTEM_PROMPT = `You are Dora, a sharp, motivating, and highly technical DSA Coach for the AlgoAscent platform. 
Your goal is to help users master Data Structures and Algorithms and ace their technical interviews.

Personality:
- Smart, concise, and direct.
- Use engineering terminology (e.g., "Time complexity", "Bottleneck", "Optimized approach").
- Be encouraging but push the user to think deeper.
- If a user asks for code, explain the logic first, then provide a high-level snippet.

Constraints:
- Response Format: [Direct Answer] -> [Short Explanation] -> [Next Action].
- Example: "Use BFS. It explores level by level. Today, solve one Easy Graph problem."
- Keep verbal responses SHORT (max 15-20 words).
- Focus on the "Next Step" for the user.`;

export const DoraAssistant: React.FC = () => {
    const { user } = useAuth();
    const { 
        isListening, 
        isSpeaking, 
        transcript, 
        resetTranscript,
        startListening, 
        stopListening, 
        speak, 
        stopSpeaking,
        supported,
        error 
    } = useVoiceAssistant();

    const [isOpen, setIsOpen] = useState(false);
    const [isMuted, setIsMuted] = useState(() => localStorage.getItem('dora_muted') === 'true');
    const [isThinking, setIsThinking] = useState(false);
    const [lastResponse, setLastResponse] = useState('');
    const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);

    const silenceTimer = useRef<NodeJS.Timeout | null>(null);

    // Save mute preference
    useEffect(() => {
        localStorage.setItem('dora_muted', String(isMuted));
    }, [isMuted]);

    // Handle speech detection and interaction cycle
    useEffect(() => {
        if (isListening && transcript.trim().length > 0) {
            if (silenceTimer.current) clearTimeout(silenceTimer.current);
            
            // If they said "Dora", respond faster (1.2s)
            // Otherwise, wait a bit longer for natural speech (2s)
            const waitTime = transcript.toLowerCase().includes('dora') ? 1200 : 2000;

            silenceTimer.current = setTimeout(() => {
                // INSTANT ACKNOWLEDGMENT
                setIsThinking(true);
                setLastResponse(''); 
                handleAskDora(transcript);
                stopListening();
            }, waitTime);
        }
        return () => { if (silenceTimer.current) clearTimeout(silenceTimer.current); };
    }, [transcript, isListening]);

    // Avoid feedback loops: Stop listening when Dora starts speaking
    useEffect(() => {
        if (isSpeaking && isListening) {
            stopListening();
        }
    }, [isSpeaking, isListening, stopListening]);

    const handleAskDora = async (query: string) => {
        if (!query.trim()) return;

        // Ensure we are in "Thinking" mode visually
        setIsThinking(true);
        const userMessage = { role: 'user', content: query };
        const newHistory = [...chatHistory, userMessage].slice(-6);

        try {
            const response = await axios.post('/api/chat', {
                message: query,
                history: [
                    { role: 'system', content: DORA_SYSTEM_PROMPT },
                    ...newHistory
                ],
                userStats: { username: user?.username }
            });

            const reply = response.data.reply;
            setIsThinking(false);
            
            // FAST STREAMING EFFECT: 
            // Instead of showing the whole text, we "stream" it into the state
            simulateStreamingResponse(reply);
        } catch (err) {
            setIsThinking(false);
            const fallback = "I'm having trouble connecting. Try again?";
            setLastResponse(fallback);
            if (!isMuted) speak(fallback);
        }
    };

    const simulateStreamingResponse = (fullText: string) => {
        let currentText = "";
        const words = fullText.split(" ");
        let i = 0;

        // Start speaking immediately
        if (!isMuted) speak(fullText);

        const interval = setInterval(() => {
            if (i < words.length) {
                currentText += (i === 0 ? "" : " ") + words[i];
                setLastResponse(currentText);
                i++;
            } else {
                clearInterval(interval);
            }
        }, 60); // Fast typing speed (60ms per word)
    };

    const toggleAssistant = () => {
        if (isOpen) {
            stopListening();
            stopSpeaking();
            setIsThinking(false);
            setIsOpen(false);
        } else {
            setIsOpen(true);
            // Auto-start listening when opened for a snappier feel
            setTimeout(startListening, 300);
        }
    };

    const handleOrbClick = () => {
        if (isSpeaking) {
            stopSpeaking();
        } else if (isListening) {
            stopListening();
        } else if (!isOpen) {
            toggleAssistant();
        } else {
            startListening();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            {/* Expanded Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-80 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 shadow-2xl backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/5 p-4 bg-slate-800/50">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
                                    <Brain size={18} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white leading-tight">Dora</h3>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">DSA Coach</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => setIsMuted(!isMuted)}
                                    className="p-2 text-slate-400 hover:text-white transition-colors"
                                    title={isMuted ? "Unmute Dora" : "Mute Dora"}
                                >
                                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                </button>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="max-h-60 overflow-y-auto p-4 space-y-4">
                            {error && (
                                <div className="rounded-lg bg-red-500/10 p-2 text-xs text-red-400">
                                    {error}
                                </div>
                            )}

                            {transcript && (
                                <div className="flex flex-col items-end">
                                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">You said</p>
                                    <p className="rounded-2xl rounded-tr-none bg-indigo-600 px-3 py-2 text-sm text-white shadow-lg">
                                        {transcript}
                                    </p>
                                </div>
                            )}

                            {lastResponse && (
                                <div className="flex flex-col items-start">
                                    <p className="text-xs font-medium text-indigo-400 uppercase mb-1 flex items-center gap-1">
                                        <Sparkles size={10} /> Dora
                                    </p>
                                    <div className="rounded-2xl rounded-tl-none bg-slate-800 border border-white/5 px-3 py-2 text-sm text-slate-200 shadow-lg">
                                        {lastResponse}
                                    </div>
                                </div>
                            )}

                            {isThinking && (
                                <div className="flex gap-1 p-2">
                                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="h-1 w-1 rounded-full bg-indigo-400" />
                                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="h-1 w-1 rounded-full bg-indigo-400" />
                                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="h-1 w-1 rounded-full bg-indigo-400" />
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-around border-t border-white/5 p-4 bg-slate-900/50">
                            <button
                                onClick={isListening ? stopListening : startListening}
                                className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
                                    isListening 
                                    ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' 
                                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)]'
                                }`}
                            >
                                {isListening ? <MicOff className="text-white" size={20} /> : <Mic className="text-white" size={20} />}
                            </button>
                            
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Status</p>
                                <p className="text-xs font-medium text-indigo-400">
                                    {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : isThinking ? 'Thinking...' : 'Idle'}
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    stopSpeaking();
                                    setLastResponse('');
                                    resetTranscript();
                                }}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors border border-white/5"
                            >
                                <Zap size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Orb Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleOrbClick}
                className={`relative group flex h-16 w-16 items-center justify-center rounded-full transition-all duration-500 overflow-hidden ${
                    isOpen && (isListening || isSpeaking || isThinking) ? 'scale-110' : 'scale-100'
                }`}
            >
                {/* Background Glow */}
                <div className={`absolute inset-0 transition-all duration-700 ${
                    isListening ? 'bg-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.6)]' : 
                    isSpeaking ? 'bg-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.6)]' : 
                    isThinking ? 'bg-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.6)]' :
                    'bg-indigo-600'
                }`} />

                {/* Animated Rings */}
                <AnimatePresence>
                    {(isListening || isSpeaking) && (
                        <motion.div
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className={`absolute inset-0 rounded-full border-2 ${
                                isListening ? 'border-cyan-400' : 'border-purple-400'
                            }`}
                        />
                    )}
                </AnimatePresence>

                {/* Orb Surface */}
                <div className="absolute inset-0.5 rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                   {/* Siri-like Waveform Effect */}
                   <div className="flex items-center gap-[2px]">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <motion.div
                                key={i}
                                animate={isListening || isSpeaking ? {
                                    height: [8, 24, 8],
                                } : {
                                    height: 8
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 0.6,
                                    delay: i * 0.1
                                }}
                                className={`w-1 rounded-full ${
                                    isListening ? 'bg-cyan-400' : isSpeaking ? 'bg-purple-400' : 'bg-indigo-500'
                                }`}
                            />
                        ))}
                   </div>
                </div>
                
                {/* Hover Label */}
                <div className="absolute -top-10 right-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-800 text-white text-[10px] px-2 py-1 rounded border border-white/10 uppercase tracking-widest font-bold">
                    Talk to Dora
                </div>
            </motion.button>
        </div>
    );
};
