/**
 * src/features/assessment/AssessmentLandingPage.tsx
 * Public / Authenticated Assessment Briefing & Entry Portal
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Clock, CheckCircle2, AlertTriangle, ShieldCheck,
    Layers, Award, ArrowRight, LogIn, Sparkles, Monitor
} from 'lucide-react';
import { assessmentApi } from '../../api/assessmentApi';
import { useAuth } from '../../contexts/AuthContext';

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

    const handleStart = async () => {
        if (!token) return;

        const effectiveEmail = user?.email || candidateEmail.trim();

        // If authenticated/private mode, user must be logged in
        if ((preview?.accessMode === 'authenticated' || preview?.accessMode === 'private') && !isAuthenticated) {
            sessionStorage.setItem('assessment_return_url', location.pathname);
            navigate('/');
            return;
        }

        // Validate email for guest candidates
        if (!isAuthenticated && preview?.accessMode === 'public') {
            if (!candidateName.trim()) {
                setError('Please enter your full name.');
                return;
            }
            if (!isValidCandidateEmail(effectiveEmail)) {
                setError('Please provide a valid Gmail or verified account email. Dummy or disposable emails are not permitted.');
                return;
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

            // Navigate to taking environment
            navigate(`/assessment/${token}/take`);
        } catch (err: any) {
            setError(err.message || 'Failed to start assessment.');
            setIsStarting(false);
        }
    };

    if (isLoading || authLoading) {
        return (
            <div className="min-h-screen bg-[#07070a] text-white flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
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
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto text-xl">
                        ⚠️
                    </div>
                    <h3 className="text-lg font-bold text-white">Assessment Unavailable</h3>
                    <p className="text-xs text-slate-400">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold"
                    >
                        Return to AlgoAscent
                    </button>
                </div>
            </div>
        );
    }

    const isAvailable = preview?.availabilityStatus === 'available';

    return (
        <div className="min-h-screen bg-[#07070a] text-slate-200 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl bg-[#0c0d16]/90 border border-indigo-500/20 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-2xl space-y-8 relative z-10"
            >
                {/* Header branding */}
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#AA8A2A] flex items-center justify-center text-black font-black text-lg shadow-lg shadow-[#D4AF37]/20">
                            ◈
                        </div>
                        <div>
                            <div className="text-[0.65rem] font-black uppercase tracking-widest text-[#D4AF37]">
                                AlgoAscent Assessment System
                            </div>
                            <div className="text-xs text-slate-400">
                                Powered by Enterprise Evaluator
                            </div>
                        </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {preview?.accessMode} Examination
                    </span>
                </div>

                {/* Main Assessment Brief */}
                <div className="space-y-3">
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                        {preview?.title}
                    </h1>
                    {preview?.description && (
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                            {preview?.description}
                        </p>
                    )}

                    {/* Section Badges */}
                    {preview?.categories && preview.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                            {preview.categories.map((c: string) => (
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
                        <strong className="text-base sm:text-lg text-white">{preview?.duration} Minutes</strong>
                    </div>
                    <div>
                        <span className="text-[0.65rem] uppercase font-bold text-slate-500 block mb-0.5">Questions</span>
                        <strong className="text-base sm:text-lg text-indigo-400">{preview?.questionCount} Total</strong>
                    </div>
                    <div>
                        <span className="text-[0.65rem] uppercase font-bold text-slate-500 block mb-0.5">Passing Score</span>
                        <strong className="text-base sm:text-lg text-emerald-400">{preview?.passingScore}%</strong>
                    </div>
                </div>

                {/* Examination Rules & Integrity Checklist */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-indigo-400" /> Assessment Integrity Guidelines
                    </h4>
                    <ul className="text-xs text-slate-400 space-y-2">
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-400 font-bold">•</span>
                            <span><strong>Authoritative Timer:</strong> The clock starts immediately upon entering and runs continuously on the server.</span>
                        </li>
                        {preview?.requireFullscreen && (
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-400 font-bold">•</span>
                                <span><strong>Fullscreen Enforcement:</strong> Exiting fullscreen or switching tabs will be recorded in your assessment audit log.</span>
                            </li>
                        )}
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-400 font-bold">•</span>
                            <span><strong>Real-time Auto-Save:</strong> All answers and code modifications are persisted continuously.</span>
                        </li>
                    </ul>
                </div>

                {/* Guest Candidate Form if public link */}
                {preview?.accessMode === 'public' && !isAuthenticated && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20">
                        <div>
                            <label className="text-[0.65rem] uppercase font-bold text-slate-400 block mb-1">Your Full Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Alex Rivera"
                                value={candidateName}
                                onChange={e => setCandidateName(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-[#141624] border border-white/10 text-white text-xs focus:border-indigo-400 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[0.65rem] uppercase font-bold text-slate-400 block mb-1">Email Address</label>
                            <input
                                type="email"
                                placeholder="alex@gmail.com"
                                value={candidateEmail}
                                onChange={e => setCandidateEmail(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-[#141624] border border-white/10 text-white text-xs focus:border-indigo-400 focus:outline-none"
                            />
                        </div>
                    </div>
                )}

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
                            ⚠️ This assessment is currently {preview?.availabilityStatus}.
                        </div>
                    ) : (preview?.accessMode === 'authenticated' || preview?.accessMode === 'private') && !isAuthenticated ? (
                        <button
                            onClick={handleStart}
                            className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm tracking-wide shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
                        >
                            <LogIn className="w-4 h-4" /> Sign In to AlgoAscent to Start
                        </button>
                    ) : (
                        <button
                            disabled={isStarting}
                            onClick={handleStart}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#AA8A2A] text-black font-black text-sm tracking-wide hover:brightness-110 shadow-xl shadow-[#D4AF37]/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
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
