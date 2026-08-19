import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic, MicOff, Send, Volume2, VolumeX, Maximize2, Minimize2,
    Code2, Sparkles, Clock, CheckCircle2, Bot, User, ArrowRight,
    AlertCircle, RotateCcw, Loader2, MessageSquare, ChevronRight,
    Flame
} from 'lucide-react';

import { mockInterviewApi } from '../../api/mockInterviewApi';
import LeetCodeCodingWorkspace from './components/LeetCodeCodingWorkspace';

interface Message {
    id: string;
    role: 'ai' | 'user';
    content: string;
    timestamp: number;
    phase?: string;
}

type InterviewPhase = 'PHASE_RESUME_PROJECT' | 'PHASE_CORE_CS' | 'PHASE_DSA_CODING' | 'PHASE_WRAPUP';

type VoiceState = 
    | 'IDLE' 
    | 'SPEAKING' 
    | 'WAITING_FOR_ANSWER' 
    | 'LISTENING' 
    | 'PROCESSING' 
    | 'ERROR' 
    | 'COMPLETED';

const PHASE_LABELS: Record<InterviewPhase, { name: string; icon: string; pill: string }> = {
    PHASE_RESUME_PROJECT: { name: 'Resume & Projects', icon: '📁', pill: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
    PHASE_CORE_CS: { name: 'Core CS (OOP/OS/SQL/CN/Git)', icon: '🧠', pill: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
    PHASE_DSA_CODING: { name: 'Live DSA Coding', icon: '💻', pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    PHASE_WRAPUP: { name: 'Behavioral & Wrap-up', icon: '🎯', pill: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
};

const MockInterviewSession: React.FC = () => {
    const navigate = useNavigate();

    // Session Config from storage or defaults
    const [sessionConfig] = useState<{
        role: string;
        duration: number;
        resumeText?: string;
        resumeFileName?: string;
        experienceLevel?: string;
    }>(() => {
        try {
            const raw = sessionStorage.getItem('active_mock_session');
            if (raw) return JSON.parse(raw);
        } catch {}
        return {
            role: 'Software Engineer',
            duration: 15,
            experienceLevel: 'Fresher / Entry Level',
        };
    });

    // Voice & Pipeline State Machine
    const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
    const [phase, setPhase] = useState<InterviewPhase>('PHASE_RESUME_PROJECT');
    const [stepCount, setStepCount] = useState(0);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [liveTranscript, setLiveTranscript] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);

    // DSA Coding State
    const [dsaQuestion, setDsaQuestion] = useState<any>(null);
    const [isCodingActive, setIsCodingActive] = useState(false);
    const [currentCode, setCurrentCode] = useState('');
    const [hasPassedAllCodingTests, setHasPassedAllCodingTests] = useState(false);

    // Timer (in seconds)
    const initialDurationSecs = (sessionConfig.duration || 15) * 60;
    const [timeLeft, setTimeLeft] = useState(initialDurationSecs);
    const [isTimerRunning, setIsTimerRunning] = useState(true);

    // Audio & Speech Settings
    const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
    const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(true);

    // Fullscreen state
    const [isFullscreen, setIsFullscreen] = useState(false);

    // View mode: 'chat' | 'coding'
    const [viewMode, setViewMode] = useState<'chat' | 'coding'>('chat');

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const finalTranscriptRef = useRef<string>('');
    const isSubmittingRef = useRef<boolean>(false);
    const silenceTimerRef = useRef<any>(null);

    // Scroll chat to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, voiceState]);

    // ── Speech Synthesis: Dora Speaks Interviewer Question ────────────
    const speakInterviewerQuestion = useCallback((text: string) => {
        if (!isSpeechEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
            setVoiceState('WAITING_FOR_ANSWER');
            return;
        }

        window.speechSynthesis.cancel();

        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch {}
        }

        console.log('[DORA] Speaking:', text.slice(0, 80) + '...');
        setVoiceState('SPEAKING');

        const cleanText = text
            .replace(/\*\*/g, '')
            .replace(/```[\s\S]*?```/g, 'I have loaded the coding challenge on your screen.')
            .replace(/`/g, '')
            .replace(/#[a-zA-Z0-9_]+/g, '')
            .slice(0, 400);

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => 
            v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Jenny') || v.name.includes('Samantha') || v.name.includes('Zira'))
        ) || voices.find(v => v.lang.startsWith('en'));

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
            console.log('[DORA] Speech started');
            setVoiceState('SPEAKING');
        };

        utterance.onend = () => {
            console.log('[DORA] Speech ended');
            setVoiceState('WAITING_FOR_ANSWER');
            startListening();
        };

        utterance.onerror = (e) => {
            console.warn('[DORA] Speech error:', e);
            setVoiceState('WAITING_FOR_ANSWER');
        };

        window.speechSynthesis.speak(utterance);
    }, [isSpeechEnabled]);

    // ── Speech-to-Text: Microphone Listening ─────────────────────────
    const startListening = useCallback(() => {
        if (!recognitionRef.current || voiceState === 'PROCESSING' || voiceState === 'SPEAKING') return;

        try {
            finalTranscriptRef.current = '';
            setLiveTranscript('');
            recognitionRef.current.start();
            setVoiceState('LISTENING');
            console.log('[DORA] Listening started');
        } catch {
            setVoiceState('LISTENING');
        }
    }, [voiceState]);

    const stopListening = useCallback(() => {
        if (!recognitionRef.current) return;
        try {
            recognitionRef.current.stop();
            console.log('[DORA] Listening ended');
        } catch {}
        if (voiceState === 'LISTENING') {
            setVoiceState('WAITING_FOR_ANSWER');
        }
    }, [voiceState]);

    const interruptSpeaking = useCallback(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        if (voiceState === 'SPEAKING') {
            console.log('[DORA] Candidate interrupted Dora speaking');
            setVoiceState('LISTENING');
        }
    }, [voiceState]);

    // ── Web Speech Recognition Setup ─────────────────────────────────
    useEffect(() => {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRec) {
            setSpeechRecognitionSupported(false);
            return;
        }

        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            interruptSpeaking();

            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const fragment = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscriptRef.current += ' ' + fragment;
                } else {
                    interim += fragment;
                }
            }

            const cleanFinal = finalTranscriptRef.current.trim();
            const fullCombined = cleanFinal ? (cleanFinal + (interim ? ' ' + interim.trim() : '')) : interim.trim();

            if (fullCombined) {
                setLiveTranscript(fullCombined);
                setInputMessage(fullCombined);
            }

            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
                if (fullCombined.trim().length > 10 && voiceState === 'LISTENING') {
                    handleSendExplicit(fullCombined.trim());
                }
            }, 3500);
        };

        recognition.onerror = (e: any) => {
            if (e?.error === 'not-allowed') {
                setErrorMessage('Microphone access was denied. Please allow microphone permissions or type your answer.');
            }
            setVoiceState(prev => prev === 'LISTENING' ? 'WAITING_FOR_ANSWER' : prev);
        };

        recognition.onend = () => {
            setVoiceState(prev => prev === 'LISTENING' ? 'WAITING_FOR_ANSWER' : prev);
        };

        recognitionRef.current = recognition;

        return () => {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch {}
            }
        };
    }, [interruptSpeaking, voiceState]);

    // ── Session Initialization (interactive-start) ────────────────────
    useEffect(() => {
        let isMounted = true;

        const initSession = async () => {
            setVoiceState('PROCESSING');
            setErrorMessage(null);

            try {
                console.log('[DORA] Initializing session via interactiveStart...');
                const data = await mockInterviewApi.interactiveStart({
                    role: sessionConfig.role,
                    duration: sessionConfig.duration,
                    resumeText: sessionConfig.resumeText,
                    experienceLevel: sessionConfig.experienceLevel,
                });

                if (!isMounted) return;

                setDsaQuestion(data.dsaQuestion);
                setPhase('PHASE_RESUME_PROJECT');
                setStepCount(0);

                const firstMsg: Message = {
                    id: `msg-${Date.now()}`,
                    role: 'ai',
                    content: data.initialGreeting,
                    timestamp: Date.now(),
                    phase: 'PHASE_RESUME_PROJECT',
                };

                setMessages([firstMsg]);
                speakInterviewerQuestion(data.initialGreeting);
            } catch (err: any) {
                console.error('[DORA] Failed to init interactive session:', err);
                if (!isMounted) return;

                setVoiceState('ERROR');
                setErrorMessage('Unable to reach the AI interviewer backend. Click Retry to connect.');
            }
        };

        initSession();

        return () => {
            isMounted = false;
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, [sessionConfig.role, sessionConfig.duration, sessionConfig.resumeText, sessionConfig.experienceLevel, speakInterviewerQuestion]);

    // ── Countdown Timer ───────────────────────────────────────────────
    useEffect(() => {
        if (!isTimerRunning || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleFinishInterview();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isTimerRunning, timeLeft]);

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const timerPercent = Math.max(0, Math.min(100, ((initialDurationSecs - timeLeft) / initialDurationSecs) * 100));

    // ── Explicit Message Submission Handler ───────────────────────────
    const handleSendExplicit = async (messageText: string) => {
        const text = messageText.trim();
        if (!text || isSubmittingRef.current || voiceState === 'PROCESSING') return;

        isSubmittingRef.current = true;
        setVoiceState('PROCESSING');
        setErrorMessage(null);
        setLastFailedMessage(null);

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch {}
        }
        finalTranscriptRef.current = '';
        setLiveTranscript('');

        const userMsg: Message = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content: text,
            timestamp: Date.now(),
            phase,
        };

        const updatedHistory = [...messages, userMsg];
        setMessages(updatedHistory);
        setInputMessage('');

        const nextStep = stepCount + 1;

        console.log('[DORA] Sending answer:', text);

        try {
            const data = await mockInterviewApi.chatStep({
                role: sessionConfig.role,
                duration: sessionConfig.duration,
                currentPhase: phase,
                stepCount: nextStep,
                message: text,
                history: updatedHistory.map(m => ({ role: m.role, content: m.content })),
                resumeText: sessionConfig.resumeText,
                dsaQuestion,
            });

            console.log('[DORA] API response:', data);

            if (!data.success && data.error) {
                throw new Error(data.message || 'Interviewer service error');
            }

            setStepCount(nextStep);
            if (data.nextPhase) {
                setPhase(data.nextPhase as InterviewPhase);
                if (data.nextPhase === 'PHASE_DSA_CODING') {
                    setIsCodingActive(true);
                    setViewMode('coding');
                }
            }
            if (data.isCodingActive !== undefined) {
                setIsCodingActive(data.isCodingActive);
                if (data.isCodingActive) setViewMode('coding');
            }

            const aiMsg: Message = {
                id: `msg-${Date.now() + 1}`,
                role: 'ai',
                content: data.reply,
                timestamp: Date.now(),
                phase: data.nextPhase || phase,
            };

            setMessages(prev => [...prev, aiMsg]);
            speakInterviewerQuestion(data.reply);

            if (data.completed) {
                setTimeout(() => {
                    handleFinishInterview(updatedHistory);
                }, 4000);
            }
        } catch (err: any) {
            console.error('[DORA] Chat step error:', err.message);
            setVoiceState('ERROR');
            setLastFailedMessage(text);
            setErrorMessage('Unable to reach the interviewer. Please check your connection and click Retry.');
        } finally {
            isSubmittingRef.current = false;
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendExplicit(inputMessage);
    };

    const handleRetry = () => {
        if (lastFailedMessage) {
            handleSendExplicit(lastFailedMessage);
        } else if (messages.length === 0) {
            window.location.reload();
        }
    };

    // ── When Candidate Passes All Visible & Hidden Tests in Monaco ────
    const handleCodingTestsPassed = (code: string, stats: { total: number; passed: number; runtimeMs: number }) => {
        setCurrentCode(code);
        setHasPassedAllCodingTests(true);

        const successAcknowledgement = `I have completed the live coding challenge and successfully passed all ${stats.total} sample and hidden test cases in ${stats.runtimeMs}ms.`;
        
        setTimeout(() => {
            handleSendExplicit(successAcknowledgement);
        }, 1200);
    };

    // ── Finish & Evaluate Full Interview ──────────────────────────────
    const handleFinishInterview = async (explicitMessages?: Message[]) => {
        if (voiceState === 'COMPLETED' || isSubmittingRef.current) return;
        setVoiceState('COMPLETED');
        setIsTimerRunning(false);

        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch {}
        }

        const finalHistory = explicitMessages || messages;

        try {
            console.log('[DORA] Compiling comprehensive evaluation...');
            const evaluation = await mockInterviewApi.comprehensiveEvaluate({
                role: sessionConfig.role,
                duration: sessionConfig.duration,
                history: finalHistory.map(m => ({ role: m.role, content: m.content })),
                resumeText: sessionConfig.resumeText,
                dsaQuestion,
                codeSubmitted: currentCode,
                testCasesPassed: 6,
                totalTestCases: 6,
            });

            sessionStorage.setItem('last_interview_result', JSON.stringify(evaluation));
            navigate('/dashboard/interview/result', { state: evaluation });
        } catch (err) {
            console.error('[DORA] Evaluation request failed:', err);
            navigate('/dashboard/interview/result');
        }
    };

    // ── Fullscreen Toggle ─────────────────────────────────────────────
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
                setIsFullscreen(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-[#05060b] text-white flex flex-col overflow-hidden font-sans select-none">

            {/* ── TOP CONTROL BAR WITH PROMINENT TIMER ───────────────── */}
            <header className="h-16 px-4 sm:px-6 bg-[#080912] border-b border-white/[0.08] backdrop-blur-xl flex items-center justify-between flex-shrink-0 z-30 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
                {/* Left: Role & Live State Capsule */}
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                        voiceState === 'SPEAKING' 
                            ? 'bg-indigo-500/20 border border-indigo-400/60 shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                            : voiceState === 'LISTENING'
                            ? 'bg-emerald-500/20 border border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                            : 'bg-white/[0.06] border border-white/10'
                    }`}>
                        🤖
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-black text-white">{sessionConfig.role}</span>
                            <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/10 font-mono">
                                {sessionConfig.experienceLevel}
                            </span>
                        </div>
                        {/* State Machine Status */}
                        <div className="flex items-center gap-1.5 text-[10px] font-medium">
                            {voiceState === 'SPEAKING' && (
                                <span className="text-indigo-400 flex items-center gap-1.5 animate-pulse font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                    🔊 Dora is speaking...
                                </span>
                            )}
                            {voiceState === 'LISTENING' && (
                                <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                                    🎤 Listening to your answer...
                                </span>
                            )}
                            {voiceState === 'PROCESSING' && (
                                <span className="text-amber-400 flex items-center gap-1.5 font-bold">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    ● ● ● Thinking...
                                </span>
                            )}
                            {voiceState === 'WAITING_FOR_ANSWER' && (
                                <span className="text-slate-400 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                    Your turn to answer
                                </span>
                            )}
                            {voiceState === 'ERROR' && (
                                <span className="text-red-400 flex items-center gap-1.5 font-bold">
                                    <AlertCircle className="w-3 h-3" />
                                    Connection issue
                                </span>
                            )}
                            {voiceState === 'IDLE' && (
                                <span className="text-slate-500">Initializing room...</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Center: Prominent Live Countdown Timer */}
                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2.5 px-4 py-1.5 rounded-2xl border transition-all ${
                        timeLeft <= 180
                            ? 'bg-rose-500/15 border-rose-500/50 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse'
                            : 'bg-white/[0.04] border-white/15 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                    }`}>
                        <Clock className={`w-4 h-4 ${timeLeft <= 180 ? 'text-rose-400' : 'text-amber-400'}`} />
                        <div className="flex flex-col">
                            <span className="font-mono text-xs sm:text-sm font-black tracking-wider leading-none">
                                {formatTime(timeLeft)}
                            </span>
                            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">
                                Time Remaining
                            </span>
                        </div>
                    </div>

                    {/* View Switcher if Coding is Active */}
                    {isCodingActive && (
                        <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-bold">
                            <button
                                onClick={() => setViewMode('coding')}
                                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                                    viewMode === 'coding'
                                        ? 'bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <Code2 className="w-3.5 h-3.5" />
                                <span>AlgoCode Studio</span>
                            </button>
                            <button
                                onClick={() => setViewMode('chat')}
                                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                                    viewMode === 'chat'
                                        ? 'bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Interview Chat</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: Audio, Fullscreen & Finish Button */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Audio Toggle */}
                    <button
                        onClick={() => {
                            setIsSpeechEnabled(v => !v);
                            if (isSpeechEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                                window.speechSynthesis.cancel();
                            }
                        }}
                        className={`p-2 rounded-xl border transition-colors ${
                            isSpeechEnabled
                                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20'
                                : 'bg-white/[0.04] border-white/10 text-slate-500 hover:text-white'
                        }`}
                        title={isSpeechEnabled ? 'Mute AI Voice' : 'Unmute AI Voice'}
                    >
                        {isSpeechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </button>

                    {/* Fullscreen Toggle */}
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors"
                        title="Toggle Fullscreen"
                    >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>

                    {/* End Interview */}
                    <button
                        onClick={() => handleFinishInterview()}
                        disabled={voiceState === 'COMPLETED'}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold hover:from-red-400 hover:to-rose-500 transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] disabled:opacity-50 cursor-pointer"
                    >
                        Finish & Evaluate
                    </button>
                </div>
            </header>

            {/* ── MAIN WORKSPACE ──────────────────────────────────────── */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* ── VIEW 1: FULL LEETCODE PROBLEM PAGE ──────────────── */}
                {viewMode === 'coding' && dsaQuestion && (
                    <div className="w-full h-full flex flex-col bg-[#05060b]">
                        {/* Dora Voice Instruction Sub-bar */}
                        <div className="px-4 py-2 bg-[#0c0e1a] border-b border-white/[0.06] flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                                <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-300">🤖</span>
                                <span className="text-slate-300">
                                    <strong className="text-white">Dora:</strong> Solve the coding challenge below. You must pass <strong>all visible & hidden test cases</strong> before advancing to the wrap-up!
                                </span>
                            </div>
                            <button
                                onClick={() => setViewMode('chat')}
                                className="text-indigo-400 hover:text-indigo-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                                <span>Switch to Voice/Chat</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Full LeetCode Coding Suite */}
                        <div className="flex-1 overflow-hidden">
                            <LeetCodeCodingWorkspace
                                question={dsaQuestion}
                                onCodeChange={code => setCurrentCode(code)}
                                onAllTestsPassed={handleCodingTestsPassed}
                            />
                        </div>
                    </div>
                )}

                {/* ── VIEW 2: INTERVIEW CONVERSATION STAGE ────────────── */}
                {viewMode === 'chat' && (
                    <div className="flex flex-col h-full w-full max-w-5xl mx-auto bg-[#07080f]">
                        {/* Live AI Voice Orb Banner */}
                        <div className="p-4 bg-gradient-to-b from-[#0e101d] to-transparent border-b border-white/[0.04] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                                    voiceState === 'SPEAKING'
                                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_25px_rgba(99,102,241,0.6)] scale-105'
                                        : voiceState === 'LISTENING'
                                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-[0_0_25px_rgba(16,185,129,0.6)] scale-105'
                                        : 'bg-[#151726] border border-white/10'
                                }`}>
                                    <Bot className="w-5 h-5 text-white" />
                                    {voiceState === 'SPEAKING' && (
                                        <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-xs font-extrabold text-white flex items-center gap-2">
                                        <span>Dora (Senior Technical Interviewer)</span>
                                        <span className="text-[10px] text-slate-400 font-normal">
                                            • {PHASE_LABELS[phase]?.name}
                                        </span>
                                    </h4>
                                    <p className="text-[11px] text-slate-400">
                                        {voiceState === 'SPEAKING'
                                            ? 'Speaking interview question...'
                                            : voiceState === 'LISTENING'
                                            ? 'Listening to microphone... Speak clearly.'
                                            : voiceState === 'PROCESSING'
                                            ? 'Evaluating technical response...'
                                            : 'Type your answer or speak with microphone.'}
                                    </p>
                                </div>
                            </div>

                            {/* Open Code Studio Button if DSA is Ready */}
                            {dsaQuestion && (
                                <button
                                    onClick={() => setViewMode('coding')}
                                    className="px-3.5 py-1.5 rounded-xl bg-white text-black text-xs font-black hover:bg-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95"
                                >
                                    <Code2 className="w-3.5 h-3.5" />
                                    <span>Open Code Studio</span>
                                </button>
                            )}
                        </div>

                        {/* Chat Messages Log */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                            {messages.map((msg) => {
                                const isAI = msg.role === 'ai';
                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex items-start gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
                                    >
                                        {isAI && (
                                            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                                                🤖
                                            </div>
                                        )}

                                        <div className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                                            isAI
                                                ? 'bg-[#101222] border border-white/[0.08] text-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
                                                : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-[0_4px_20px_rgba(99,102,241,0.25)]'
                                        }`}>
                                            <div className="whitespace-pre-wrap font-sans">
                                                {msg.content}
                                            </div>

                                            {isAI && (
                                                <div className="mt-2.5 pt-2 border-t border-white/[0.05] flex items-center justify-between text-[10px] text-slate-400">
                                                    <span>Dora • Staff Interviewer</span>
                                                    <button
                                                        onClick={() => speakInterviewerQuestion(msg.content)}
                                                        className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <Volume2 className="w-3 h-3" />
                                                        <span>Replay Voice</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {!isAI && (
                                            <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                                                👤
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}

                            {/* Processing "Thinking..." Animation */}
                            {voiceState === 'PROCESSING' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-3 text-xs text-slate-400 pl-1"
                                >
                                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-sm">
                                        🤖
                                    </div>
                                    <div className="px-4 py-3 rounded-2xl bg-[#101222] border border-white/[0.08] flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce [animation-delay:0.4s]"></span>
                                        <span className="text-xs text-slate-300 ml-1">Evaluating technical response...</span>
                                    </div>
                                </motion.div>
                            )}

                            {/* Error Banner with Retry */}
                            {errorMessage && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center justify-between gap-3"
                                >
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                        <span>{errorMessage}</span>
                                    </div>
                                    <button
                                        onClick={handleRetry}
                                        className="px-3 py-1.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 font-bold hover:bg-red-500/30 transition-colors flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        <span>Retry</span>
                                    </button>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Live Microphone Transcript Preview */}
                        {voiceState === 'LISTENING' && (
                            <div className="px-4 py-2.5 bg-emerald-500/10 border-t border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                                <div className="flex items-center gap-2 flex-1 mr-3 overflow-hidden">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping flex-shrink-0"></span>
                                    <span className="truncate font-mono">
                                        {liveTranscript ? `"${liveTranscript}"` : 'Listening to your voice...'}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={stopListening}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-bold text-[10px] transition-colors cursor-pointer flex-shrink-0"
                                >
                                    Stop Microphone
                                </button>
                            </div>
                        )}

                        {/* Chat Input Toolbar */}
                        <form onSubmit={handleFormSubmit} className="p-3 sm:p-4 bg-[#090b14] border-t border-white/[0.08]">
                            <div className="flex items-center gap-2">
                                {speechRecognitionSupported && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (voiceState === 'LISTENING') {
                                                stopListening();
                                            } else {
                                                interruptSpeaking();
                                                startListening();
                                            }
                                        }}
                                        disabled={voiceState === 'PROCESSING'}
                                        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                                            voiceState === 'LISTENING'
                                                ? 'bg-red-500 border-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse'
                                                : 'bg-white/[0.04] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08]'
                                        }`}
                                        title={voiceState === 'LISTENING' ? 'Stop Listening' : 'Speak with Microphone'}
                                    >
                                        {voiceState === 'LISTENING' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                    </button>
                                )}

                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={e => {
                                        interruptSpeaking();
                                        setInputMessage(e.target.value);
                                    }}
                                    placeholder={
                                        voiceState === 'LISTENING'
                                            ? 'Transcribing your voice live...'
                                            : voiceState === 'PROCESSING'
                                            ? 'Evaluating response...'
                                            : 'Type your answer or explanation here... (Press Enter to send)'
                                    }
                                    disabled={voiceState === 'PROCESSING'}
                                    className="flex-1 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-400/80 focus:bg-white/[0.05] transition-all"
                                />

                                <button
                                    type="submit"
                                    disabled={!inputMessage.trim() || voiceState === 'PROCESSING'}
                                    className="p-3 rounded-2xl bg-white text-black hover:bg-slate-200 transition-all disabled:opacity-30 disabled:hover:bg-white cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MockInterviewSession;
