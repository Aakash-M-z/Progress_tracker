/**
 * src/features/assessment/AssessmentResultPage.tsx
 * Post-Submission Candidate Scorecard & Performance Breakdown
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Trophy, CheckCircle2, XCircle, Clock, ShieldCheck,
    ArrowRight, Home, Layers, Sparkles, Award
} from 'lucide-react';
import { assessmentApi } from '../../api/assessmentApi';

const AssessmentResultPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { token } = useParams<{ token?: string }>();

    const [report, setReport] = useState<any>(location.state?.report || null);
    const [isLoading, setIsLoading] = useState(!location.state?.report);
    const [showResults, setShowResults] = useState<boolean>(location.state?.showResults !== false);

    const attemptId = location.state?.attemptId;

    useEffect(() => {
        if (report || !attemptId) {
            setIsLoading(false);
            return;
        }

        assessmentApi.getResult(attemptId).then(res => {
            setReport(res);
            if (res.message) setShowResults(false);
        }).catch(() => {}).finally(() => {
            setIsLoading(false);
        });
    }, [attemptId, report]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#07070a] text-white flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading performance report...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#070709] text-white flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden font-sans">
            {/* Ambient background lighting */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FF3B1F]/10 rounded-full blur-[140px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-xl bg-[#0E0E14] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6 relative z-10 text-center"
            >
                {/* Status Hero Icon */}
                <div className="w-16 h-16 rounded-2xl bg-[#FF3B1F] text-black flex items-center justify-center mx-auto text-2xl shadow-xl shadow-[#FF3B1F]/25">
                    <Trophy className="w-8 h-8" />
                </div>

                <div>
                    <span className="text-[0.65rem] font-mono font-bold uppercase tracking-widest text-[#FF3B1F] block mb-1">
                        Assessment Completed
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                        {report?.passed ? 'Assessment Passed' : 'Assessment Submitted'}
                    </h1>
                    <p className="text-xs text-white/50 mt-1">
                        Your assessment answers and code solutions have been verified and securely locked.
                    </p>
                </div>

                {!showResults ? (
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                        <ShieldCheck className="w-8 h-8 text-[#FF3B1F] mx-auto" />
                        <h4 className="text-sm font-bold text-white">Responses Under Review</h4>
                        <p className="text-xs text-white/50 max-w-sm mx-auto">
                            The administrator will review your results. You may view your results once published.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Score Hero Banner */}
                        <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-3 font-mono">
                            <div className="flex items-center justify-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                    report?.passed
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                }`}>
                                    {report?.passed ? 'Benchmark Achieved' : 'Needs Improvement'}
                                </span>
                            </div>

                            <div className="text-4xl font-bold text-white font-sans">
                                {report?.score} <span className="text-lg text-white/40 font-normal">/ {report?.maxScore}</span>
                            </div>
                            <div className="text-xs font-bold text-[#FF3B1F]">
                                Overall Score: {report?.percentage}%
                            </div>
                        </div>

                        {/* Metric Breakdown Grid */}
                        <div className="grid grid-cols-3 gap-2.5 text-center font-mono">
                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                <span className="text-[0.65rem] uppercase font-bold text-white/40 block">Accuracy</span>
                                <strong className="text-sm text-white font-sans">{report?.accuracy}%</strong>
                            </div>
                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                <span className="text-[0.65rem] uppercase font-bold text-white/40 block">Questions Solved</span>
                                <strong className="text-sm text-emerald-400 font-sans">{report?.correctCount} / {report?.totalQuestions}</strong>
                            </div>
                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                <span className="text-[0.65rem] uppercase font-bold text-white/40 block">Time Taken</span>
                                <strong className="text-sm text-[#FF3B1F] font-sans">
                                    {((report?.timeTakenSeconds || 0) / 60).toFixed(1)}m
                                </strong>
                            </div>
                        </div>

                        {/* Category Mastery Cards */}
                        {report?.categoryScores && (
                            <div className="text-left space-y-2 pt-2 font-mono">
                                <h5 className="text-[0.7rem] uppercase font-bold text-white/40 tracking-wider">
                                    Category Performance
                                </h5>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(report.categoryScores).map(([cat, data]: [string, any]) => (
                                        <div key={cat} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                                            <span className="text-white/70 font-medium truncate">{cat}</span>
                                            <strong className="text-[#FF3B1F] font-bold ml-2">{data.percentage}%</strong>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Return Buttons */}
                <div className="pt-3 flex gap-3">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                        <Home className="w-4 h-4" /> Go to Dashboard
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/assessments')}
                        className="rig-chamfer-btn flex-1 py-3 bg-[#FF3B1F] text-black font-bold text-xs hover:bg-[#E63219] shadow-lg shadow-[#FF3B1F]/20 flex items-center justify-center gap-1.5 transition-all"
                    >
                        <span>My Assessments</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AssessmentResultPage;
