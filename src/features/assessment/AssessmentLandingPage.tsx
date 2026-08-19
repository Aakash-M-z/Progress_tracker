/**
 * src/features/assessment/AssessmentLandingPage.tsx
 * Public / Authenticated Assessment Briefing & Entry Portal
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Clock, CheckCircle2, AlertTriangle, ShieldCheck,
    Layers, Award, ArrowRight, LogIn, Sparkles, Monitor, UserCheck
} from 'lucide-react';
import { assessmentApi } from '../../api/assessmentApi';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE } from '../../api/config';

const AssessmentLandingPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();

    const [preview, setPreview] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isStarting, setIsStarting] = useState(false);
    const [candidateName, setCandidateName] = useState('');
    const [candidateEmail, setCandidateEmail] = useState('');

    useEffect(() => {
        if (!token) return;
        const fetchPreview = async () => {
            setIsLoading(true);
            try {
                const res = await assessmentApi.getPreview(token);
                setPreview(res);
            } catch (err: any) {
                setError(err.message || 'Failed to load assessment information.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchPreview();
    }, [token]);

    const DUMMY_DOMAINS = [
        'example.com', 'test.com', 'dummy.com', 'mailinator.com', 
        'tempmail.com', '10minutemail.com', 'throwaway.com', 'fakemail.com',
        'test.org', 'test.net', 'sample.com', 'invalid.com', 'demo.com'
    ];

    const isValidCandidateEmail = (email: string): boolean => {
        if (!email) return false;
        const clean = email.trim().toLowerCase();
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!regex.test(clean)) return false;
        const domain = clean.split('@')[1];
        if (DUMMY_DOMAINS.includes(domain)) return false;
        return true;
    };

    const [authMode, setAuthMode] = useState<'quick' | 'login'>('quick');
    const [password, setPassword] = useState('');
    const { login } = useAuth();

    const handleStart = async () => {
        if (!token) return;

        const effectiveEmail = user?.email || candidateEmail.trim();

        // Validate name and email for unauthenticated candidates
        if (!isAuthenticated) {
            if (!candidateName.trim()) {
                setError('Please enter your full name to identify your assessment attempt.');
                return;
            }
            if (!isValidCandidateEmail(effectiveEmail)) {
                setError('Please provide a valid Gmail or verified account email. Dummy or disposable emails are not permitted.');
                return;
            }

            // In login mode, perform in-place authentication without redirect
            if (authMode === 'login' && password) {
                try {
                    const res = await fetch(`${API_BASE}/api/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: effectiveEmail, password })
                    });
                    if (res.ok) {
                        const data = await res.json();
                        login(data);
                    }
                } catch {
                    // Continue with candidate assessment initialization
                }
            }
        }

        setIsStarting(true);
        setError(null);

        try {
            const startRes = await assessmentApi.startAssessment(token, {
                candidateName: user?.name || candidateName.trim() || 'Candidate',
                candidateEmail: effectiveEmail
            });

            // Store active attempt session in sessionStorage
            sessionStorage.setItem(`assessment_attempt_${token}`, JSON.stringify(startRes));

            // Navigate directly to taking environment
            navigate(`/assessment/${token}/take`);
        } catch (err: any) {
            setError(err.message || 'Failed to initialize examination session.');
            setIsStarting(false);
        }
    };

    if (isLoading || authLoading) {
        return (
            <div className="min-h-screen bg-[#07070a] text-white flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Loading Assessment Environment...
                </span>
            </div>
        );
    }

    if (error && !preview) {
        return (
            <div className="min-h-screen bg-[#07070a] text-white flex items-center justify-center p-4">
                <div className="max-w-md w-full p-8 rounded-2xl bg-[#0e101a] border border-rose-500/30 text-center space-y-4 shadow-2xl">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto text-xl font-bold">
                        ⚠️
                    </div>
                    <h3 className="text-lg font-bold text-white">Assessment Unavailable</h3>
                    <p className="text-xs text-slate-400">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold cursor-pointer"
                    >
                        Retry Loading
                    </button>
                </div>
            </div>
        );
    }

    const asmt = preview?.assessment || preview || {};
    const title = asmt.title || 'Campus Placement Technical Assessment';
    const description = asmt.description;
    const duration = asmt.duration || 60;
    const questionCount = asmt.questionCount || asmt.questions?.length || 4;
    const passingScore = asmt.passingScore || 60;
    const accessMode = asmt.accessMode || 'public';
    const categories = asmt.categories && asmt.categories.length > 0 ? asmt.categories : ['DSA', 'Algorithmic Problem Solving'];
    const availabilityStatus = asmt.availabilityStatus || 'available';
    const isAvailable = availabilityStatus === 'available' || !asmt.availabilityStatus;

    return (
        <div className="min-h-screen bg-[#07070a] text-slate-200 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl bg-[#0c0d16]/95 border border-[#1f2232] rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-2xl space-y-7 relative z-10"
            >
                {/* Header branding */}
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#AA8A2A] flex items-center justify-center text-black font-black text-lg shadow-lg shadow-[#D4AF37]/20">
                            ◈
                        </div>
                        <div>
                            <div className="text-[0.65rem] font-black uppercase tracking-widest text-[#D4AF37]">
                                AlgoAscent Assessment Studio
                            </div>
                            <div className="text-xs text-slate-400">
                                Enterprise Candidate Evaluation Portal
                            </div>
                        </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wider bg-white/5 text-amber-300 border border-white/10">
                        {accessMode} Examination
                    </span>
                </div>

                {/* Main Assessment Brief */}
                <div className="space-y-3">
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                            {description}
                        </p>
                    )}

                    {/* Section Badges */}
                    {categories && categories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {categories.map((c: string) => (
                                <span
                                    key={c}
                                    className="px-2.5 py-1 rounded-lg text-[0.65rem] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-slate-300"
                                >
                                    {c}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-black/40 border border-white/5 text-center">
                    <div>
                        <span className="text-[0.65rem] uppercase font-bold text-slate-500 block mb-0.5">Duration</span>
                        <strong className="text-base sm:text-lg text-white">{duration} Minutes</strong>
                    </div>
                    <div>
                        <span className="text-[0.65rem] uppercase font-bold text-slate-500 block mb-0.5">Questions</span>
                        <strong className="text-base sm:text-lg text-[#D4AF37]">{questionCount} Total</strong>
                    </div>
                    <div>
                        <span className="text-[0.65rem] uppercase font-bold text-slate-500 block mb-0.5">Passing Score</span>
                        <strong className="text-base sm:text-lg text-emerald-400">{passingScore}%</strong>
                    </div>
                </div>

                {/* Candidate Entry Card (In-Context Signup/Verification — No Redirect Away) */}
                {!isAuthenticated && (
                    <div className="p-5 rounded-2xl bg-[#11131f] border border-[#1f2232] space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-[#D4AF37]" /> Candidate Identity Verification
                            </h4>
                            <div className="flex text-[0.65rem] font-bold bg-black/40 rounded-lg p-0.5 border border-white/5">
                                <button
                                    onClick={() => setAuthMode('quick')}
                                    className={`px-2.5 py-1 rounded-md transition-colors ${authMode === 'quick' ? 'bg-[#D4AF37] text-black' : 'text-slate-400'}`}
                                >
                                    Quick Entry
                                </button>
                                <button
                                    onClick={() => setAuthMode('login')}
                                    className={`px-2.5 py-1 rounded-md transition-colors ${authMode === 'login' ? 'bg-[#D4AF37] text-black' : 'text-slate-400'}`}
                                >
                                    Sign In
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-[0.65rem] uppercase font-bold text-slate-400 block mb-1">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Alex Rivera"
                                    value={candidateName}
                                    onChange={e => setCandidateName(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl bg-[#090a10] border border-white/10 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[0.65rem] uppercase font-bold text-slate-400 block mb-1">Candidate Email (Gmail/University)</label>
                                <input
                                    type="email"
                                    placeholder="alex@gmail.com"
                                    value={candidateEmail}
                                    onChange={e => setCandidateEmail(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl bg-[#090a10] border border-white/10 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                                />
                            </div>
                            {authMode === 'login' && (
                                <div className="sm:col-span-2">
                                    <label className="text-[0.65rem] uppercase font-bold text-slate-400 block mb-1">AlgoAscent Password (Optional)</label>
                                    <input
                                        type="password"
                                        placeholder="Enter password if you already have an account"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl bg-[#090a10] border border-white/10 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Examination Rules & Integrity Checklist */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#D4AF37]" /> Assessment Guidelines
                    </h4>
                    <ul className="text-xs text-slate-400 space-y-1.5">
                        <li className="flex items-start gap-2">
                            <span className="text-[#D4AF37] font-bold">•</span>
                            <span><strong>Authoritative Timer:</strong> Clock runs continuously from start to finish.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-[#D4AF37] font-bold">•</span>
                            <span><strong>Continuous Auto-Save:</strong> All code edits and answers are synchronized live.</span>
                        </li>
                    </ul>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* CTA Action */}
                <div>
                    {!isAvailable ? (
                        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center text-rose-300 text-xs font-bold">
                            ⚠️ This assessment is currently {availabilityStatus}.
                        </div>
                    ) : (
                        <button
                            disabled={isStarting}
                            onClick={handleStart}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#AA8A2A] text-black font-black text-sm tracking-wide hover:brightness-110 shadow-xl shadow-[#D4AF37]/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                        >
                            {isStarting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    Entering Examination Hall...
                                </>
                            ) : (
                                <>
                                    <span>🚀 Start Assessment</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default AssessmentLandingPage;
