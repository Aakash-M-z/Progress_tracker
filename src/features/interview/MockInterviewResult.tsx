import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Award, CheckCircle2, XCircle, Sparkles, Copy, ArrowRight, RotateCcw, BarChart3, HelpCircle, Code2, Database } from 'lucide-react';

// ── Score Ring (SVG Animated) ────────────────────────────────
const ScoreRing: React.FC<{
    score: number;
    label: string;
    color?: string;
    size?: number;
    delay?: number;
}> = ({ score, label, size = 96, delay = 0 }) => {
    const [animatedScore, setAnimatedScore] = useState(0);
    const radius = (size - 12) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (animatedScore / 100) * circumference;

    useEffect(() => {
        const timer = setTimeout(() => {
            let start = 0;
            const duration = 1200;
            const step = (timestamp: number) => {
                if (!start) start = timestamp;
                const elapsed = timestamp - start;
                const current = Math.min(Math.floor((elapsed / duration) * score), score);
                setAnimatedScore(current);
                if (elapsed < duration) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        }, delay);
        return () => clearTimeout(timer);
    }, [score, delay]);

    const getColor = (val: number) => {
        if (val >= 80) return '#10B981';
        if (val >= 65) return '#6366F1';
        if (val >= 50) return '#F59E0B';
        return '#EF4444';
    };

    const ringColor = getColor(animatedScore);

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    <circle
                        cx={size / 2} cy={size / 2} r={radius}
                        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"
                    />
                    <motion.circle
                        cx={size / 2} cy={size / 2} r={radius}
                        fill="none" stroke={ringColor}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: circumference - progress }}
                        transition={{ duration: 1.2, delay: delay / 1000, ease: 'easeOut' }}
                        style={{ filter: `drop-shadow(0 0 10px ${ringColor}60)` }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white font-mono">{animatedScore}</span>
                </div>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 text-center max-w-[110px]">{label}</span>
        </div>
    );
};

// ── Hire Verdict Card ────────────────────────────────────────
const HireVerdictCard: React.FC<{
    verdict: string;
    confidence: number;
    reasoning: string;
    role?: string;
}> = ({ verdict, confidence, reasoning, role }) => {
    const configs: Record<string, { label: string; color: string; bg: string; border: string; icon: string; glow: string }> = {
        STRONG_HIRE: {
            label: 'STRONG HIRE', color: 'text-emerald-300', bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/40', icon: '🏆', glow: 'shadow-[0_0_50px_rgba(16,185,129,0.25)]'
        },
        HIRE: {
            label: 'HIRE', color: 'text-green-400', bg: 'bg-green-500/10',
            border: 'border-green-500/30', icon: '✅', glow: 'shadow-[0_0_40px_rgba(34,197,94,0.2)]'
        },
        BORDERLINE: {
            label: 'BORDERLINE', color: 'text-amber-400', bg: 'bg-amber-500/10',
            border: 'border-amber-500/30', icon: '⚖️', glow: 'shadow-[0_0_40px_rgba(245,158,11,0.2)]'
        },
        NO_HIRE: {
            label: 'NO HIRE', color: 'text-red-400', bg: 'bg-red-500/10',
            border: 'border-red-500/30', icon: '❌', glow: 'shadow-[0_0_40px_rgba(239,68,68,0.2)]'
        }
    };

    const cfg = configs[verdict] || configs['BORDERLINE'];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
            className={`${cfg.bg} ${cfg.border} ${cfg.glow} border rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden backdrop-blur-xl`}
        >
            <div className="relative z-10">
                <div className="text-5xl mb-3">{cfg.icon}</div>
                <div className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1">Hiring Committee Verdict • {role || 'Software Engineer'}</div>
                <div className={`text-3xl sm:text-4xl font-black mb-3 tracking-wider ${cfg.color}`}>{cfg.label}</div>
                <div className="text-slate-400 text-xs uppercase tracking-widest mb-6">
                    Placement Confidence: <span className={`font-black ${cfg.color}`}>{confidence}%</span>
                </div>
                <div className="max-w-xl mx-auto text-sm sm:text-base text-slate-200 leading-relaxed italic border-t border-white/10 pt-6">
                    "{reasoning}"
                </div>
            </div>
        </motion.div>
    );
};

const MockInterviewResult: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [showIdeal, setShowIdeal] = useState(false);

    // Retrieve state from router location or sessionStorage fallback
    const result = location.state || (() => {
        try {
            const raw = sessionStorage.getItem('last_interview_result');
            if (raw) return JSON.parse(raw);
        } catch {}
        return null;
    })();

    if (!result) {
        return (
            <div className="w-full max-w-2xl mx-auto text-center py-20">
                <p className="text-slate-400 mb-6">No recent interview result found.</p>
                <button
                    onClick={() => navigate('/dashboard/interview')}
                    className="px-6 py-3 rounded-2xl bg-white text-black font-extrabold text-sm"
                >
                    Start a New Interview
                </button>
            </div>
        );
    }

    const { score, feedback, role = 'Software Engineer', duration = 15 } = result;

    const hireVerdict = feedback?.hireVerdict || (score?.overallScore >= 80 ? 'HIRE' : 'BORDERLINE');
    const hireConfidence = feedback?.hireConfidence || 82;
    const hireReasoning = feedback?.hireReasoning || 'Candidate demonstrated solid problem solving and core engineering knowledge.';
    const categoryScores = score?.categoryScores || {
        dsa: score?.correctness || 75,
        coreCS: score?.optimization || 80,
        projectDefense: score?.clarity || 80,
        communication: score?.communication || 75,
    };
    const questionAudit = feedback?.questionAudit || [];
    const resumeBullet = feedback?.resumeBullet || '';

    const handleCopyBullet = () => {
        if (resumeBullet) {
            navigator.clipboard.writeText(resumeBullet);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-5xl mx-auto space-y-8 pb-16">

            {/* Header */}
            <div className="text-center space-y-2">
                <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-block bg-white/[0.06] text-slate-300 border border-white/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
                >
                    {duration}-Minute Placement Mock • {role}
                </motion.span>
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
                >
                    Interview Evaluation & Placement Report
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-slate-400 text-xs sm:text-sm"
                >
                    Comprehensive AI multi-domain breakdown, strengths, weaknesses, and model answers.
                </motion.p>
            </div>

            {/* Hiring Verdict Card */}
            <HireVerdictCard verdict={hireVerdict} confidence={hireConfidence} reasoning={hireReasoning} role={role} />

            {/* Multi-Domain Score Breakdown */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-8 rounded-3xl bg-[#090b14] border border-white/[0.08] shadow-[0_0_50px_rgba(0,0,0,0.6)]"
            >
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2.5">
                        <BarChart3 className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                            Multi-Pillar Performance Scores
                        </h3>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">Weighted Average: <strong className="text-white">{score?.overallScore || 80}/100</strong></span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 justify-items-center">
                    <ScoreRing score={categoryScores.dsa || 75} label="Live DSA & Coding" delay={0} />
                    <ScoreRing score={categoryScores.coreCS || 80} label="Core CS (OOP/OS/SQL/CN/Git)" delay={150} />
                    <ScoreRing score={categoryScores.projectDefense || 80} label="Project & Resume Defense" delay={300} />
                    <ScoreRing score={categoryScores.communication || 75} label="Communication & Clarity" delay={450} />
                </div>
            </motion.div>

            {/* Strengths & Areas to Strengthen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-6 sm:p-8 rounded-3xl bg-[#090b14] border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]"
                >
                    <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Key Strengths</span>
                    </h3>
                    <ul className="space-y-3">
                        {(feedback?.strengths || ['Clear architectural description', 'Good problem decomposition']).map((str: string, i: number) => (
                            <li key={i} className="flex gap-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                                <span className="text-emerald-400 font-bold">✓</span>
                                <span>{str}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 }}
                    className="p-6 sm:p-8 rounded-3xl bg-[#090b14] border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.05)]"
                >
                    <h3 className="text-sm font-bold uppercase tracking-wider text-red-400 mb-4 flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        <span>Areas to Strengthen</span>
                    </h3>
                    <ul className="space-y-3">
                        {(feedback?.weaknesses || ['Handle edge cases under scale', 'Deepen SQL indexing explanation']).map((w: string, i: number) => (
                            <li key={i} className="flex gap-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                                <span className="text-red-400 font-bold">✕</span>
                                <span>{w}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            </div>

            {/* Action Items */}
            {(feedback?.improvements || []).length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-6 sm:p-8 rounded-3xl bg-[#090b14] border border-indigo-500/20"
                >
                    <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Priority Actionable Improvements</span>
                    </h3>
                    <div className="space-y-3">
                        {feedback.improvements.map((imp: string, i: number) => (
                            <div key={i} className="flex gap-3 items-start p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 text-xs sm:text-sm text-slate-300 leading-relaxed">
                                <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                                    {i + 1}
                                </span>
                                <span>{imp}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Question-by-Question Audit */}
            {questionAudit.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    className="p-6 sm:p-8 rounded-3xl bg-[#090b14] border border-white/[0.08]"
                >
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-6 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-sky-400" />
                        <span>Question-by-Question Detailed Review</span>
                    </h3>
                    <div className="space-y-4">
                        {questionAudit.map((q: any, idx: number) => (
                            <div key={idx} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-extrabold text-white">Q{idx + 1}: {q.question}</span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400 font-mono">
                                        {q.category}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-300 bg-black/40 p-3 rounded-xl border border-white/5">
                                    <strong className="text-slate-400">Your Answer: </strong>
                                    {q.candidateAnswer}
                                </div>
                                <div className="text-xs text-indigo-300 leading-relaxed">
                                    <strong className="text-indigo-400">Feedback: </strong>
                                    {q.evaluation}
                                </div>
                                {q.idealAnswer && (
                                    <div className="text-xs text-emerald-300/90 leading-relaxed pt-2 border-t border-white/5">
                                        <strong className="text-emerald-400">Ideal Answer: </strong>
                                        {q.idealAnswer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Resume Bullet */}
            {resumeBullet && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="p-6 sm:p-8 rounded-3xl bg-[#090b14] border border-white/[0.08]"
                >
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                            <span>📄</span>
                            <span>Resume-Ready Bullet Point</span>
                        </h3>
                        <button
                            onClick={handleCopyBullet}
                            className="text-xs text-slate-300 hover:text-white font-bold transition-colors border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                        >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copied ? 'Copied!' : 'Copy'}</span>
                        </button>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs sm:text-sm text-slate-200 font-mono">
                        • {resumeBullet}
                    </div>
                </motion.div>
            )}

            {/* Bottom Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
                <button
                    onClick={() => navigate('/dashboard/interview')}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white text-black font-extrabold text-xs uppercase tracking-wider hover:bg-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95"
                >
                    <RotateCcw className="w-4 h-4" />
                    <span>Take Another Mock Interview</span>
                </button>
                <button
                    onClick={() => navigate('/dashboard/analytics')}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/[0.08] transition-all flex items-center justify-center gap-2"
                >
                    <span>View Analytics & Streaks</span>
                </button>
            </motion.div>
        </motion.div>
    );
};

export default MockInterviewResult;
