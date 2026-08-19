/**
 * src/features/admin/components/assessments/CandidateReportModal.tsx
 * Individual Candidate Assessment Audit & Detailed Report Modal
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User, CheckCircle2, XCircle, Clock, ShieldAlert, Award,
    Printer, X, Code2, AlertTriangle, ChevronDown, ChevronRight, FileText
} from 'lucide-react';
import { assessmentApi } from '../../../../api/assessmentApi';
import { assessmentExporter } from '../../../../utils/assessmentExporter';

interface CandidateReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    assessmentId: string;
    attemptId: string;
}

const CandidateReportModal: React.FC<CandidateReportModalProps> = ({
    isOpen,
    onClose,
    assessmentId,
    attemptId
}) => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'questions' | 'integrity' | 'coding'>('questions');
    const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !assessmentId || !attemptId) return;
        const fetchReport = async () => {
            setIsLoading(true);
            try {
                const res = await assessmentApi.getCandidateAttemptReport(assessmentId, attemptId);
                setData(res);
            } catch (err) {
                console.error('Failed to load candidate report:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReport();
    }, [isOpen, assessmentId, attemptId]);

    if (!isOpen) return null;

    const attempt = data?.attempt;
    const assessment = data?.assessment || {
        id: assessmentId,
        title: attempt?.assessmentTitle || 'Technical Assessment',
        duration: 60,
        passingScore: 60,
        totalPoints: attempt?.maxScore || 50,
        questions: data?.questions || []
    };
    const userProfile = data?.userProfile;

    const handlePrintPDF = () => {
        if (!attempt) return;
        assessmentExporter.printCandidateReportPDF(assessment, attempt, userProfile);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-full max-w-4xl h-[90vh] bg-[#0c0d16] border border-indigo-500/20 rounded-2xl flex flex-col overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#AA8A2A] flex items-center justify-center text-black font-black text-lg shadow-lg shadow-[#D4AF37]/20">
                            {userProfile?.name?.charAt(0) || attempt?.userName?.charAt(0) || 'C'}
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white">
                                {userProfile?.name || attempt?.userName || 'Candidate Report'}
                            </h3>
                            <p className="text-xs text-slate-400">
                                {userProfile?.email || attempt?.userEmail || '—'} • {assessment?.title || 'Assessment'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrintPDF}
                            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-white/10 transition-colors"
                        >
                            <Printer className="w-3.5 h-3.5 text-indigo-400" /> Export PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2">
                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        Loading candidate assessment data...
                    </div>
                ) : !attempt ? (
                    <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                        Attempt record could not be loaded.
                    </div>
                ) : (
                    <>
                        {/* KPI Metric Summary Ribbon */}
                        <div className="p-6 border-b border-white/[0.06] bg-black/40 grid grid-cols-2 sm:grid-cols-5 gap-3">
                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">Final Score</span>
                                <div className="text-xl font-black text-white mt-1">
                                    {attempt.score} <span className="text-xs text-slate-400 font-normal">/ {attempt.maxScore}</span>
                                </div>
                                <span className={`text-[0.65rem] font-bold ${attempt.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {attempt.percentage}% ({attempt.passed ? 'PASSED' : 'FAILED'})
                                </span>
                            </div>

                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">Accuracy</span>
                                <div className="text-xl font-black text-indigo-400 mt-1">
                                    {attempt.accuracy}%
                                </div>
                                <span className="text-[0.65rem] text-slate-400">
                                    {attempt.correctCount} / {attempt.attemptedCount} Solved
                                </span>
                            </div>

                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">Time Taken</span>
                                <div className="text-xl font-black text-amber-400 mt-1">
                                    {(attempt.timeTakenSeconds / 60).toFixed(1)}m
                                </div>
                                <span className="text-[0.65rem] text-slate-400">
                                    Limit: {assessment.duration} mins
                                </span>
                            </div>

                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">Integrity Score</span>
                                <div className={`text-xl font-black mt-1 ${attempt.integrityScore >= 80 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {attempt.integrityScore || 100} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                                </div>
                                <span className="text-[0.65rem] text-slate-400">
                                    {attempt.tabSwitchCount || 0} Tab switches
                                </span>
                            </div>

                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 col-span-2 sm:col-span-1">
                                <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">Submitted At</span>
                                <div className="text-xs font-bold text-slate-200 mt-1.5 truncate">
                                    {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : 'In Progress'}
                                </div>
                                <span className="text-[0.65rem] text-slate-400">
                                    {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleTimeString() : ''}
                                </span>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="px-6 border-b border-white/[0.06] flex items-center gap-4 bg-white/[0.01]">
                            <button
                                onClick={() => setActiveTab('questions')}
                                className={`py-3 text-xs font-bold border-b-2 transition-all ${
                                    activeTab === 'questions'
                                        ? 'border-[#D4AF37] text-white'
                                        : 'border-transparent text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                Question Breakdown ({assessment.questions?.length || 0})
                            </button>
                            <button
                                onClick={() => setActiveTab('integrity')}
                                className={`py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
                                    activeTab === 'integrity'
                                        ? 'border-indigo-500 text-white'
                                        : 'border-transparent text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" /> Integrity Audit ({attempt.integrityEvents?.length || 0})
                            </button>
                        </div>

                        {/* Tab Contents */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {activeTab === 'questions' && (
                                <div className="space-y-3">
                                    {(assessment.questions || []).map((q: any, idx: number) => {
                                        const qId = q.id || `q_${idx + 1}`;
                                        const isExpanded = expandedQuestion === qId;

                                        const rawAns = attempt.answers?.[qId];
                                        const userAns = typeof rawAns === 'object' && rawAns !== null && 'value' in rawAns ? rawAns.value : rawAns;
                                        const coding = attempt.codingSubmissions?.[qId];

                                        const isAttempted = q.questionType === 'coding' ? !!(coding && coding.code) : (userAns !== undefined && userAns !== null && userAns !== '');
                                        const isCorrect = q.questionType === 'coding' ? (coding && coding.passed) : (userAns === q.correctAnswer);

                                        return (
                                            <div
                                                key={qId}
                                                className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden"
                                            >
                                                <div
                                                    onClick={() => setExpandedQuestion(isExpanded ? null : qId)}
                                                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-shrink-0">
                                                            {isCorrect ? (
                                                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                                            ) : isAttempted ? (
                                                                <XCircle className="w-5 h-5 text-rose-400" />
                                                            ) : (
                                                                <div className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center text-[0.65rem] text-slate-500 font-bold">
                                                                    —
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <span className="text-[0.65rem] font-black uppercase text-indigo-400">
                                                                    Q{idx + 1} • {q.category}
                                                                </span>
                                                                <span className="text-[0.65rem] text-slate-500 font-bold uppercase">
                                                                    {q.questionType}
                                                                </span>
                                                            </div>
                                                            <h4 className="text-sm font-bold text-white">{q.title}</h4>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <span className="text-xs font-bold text-amber-400">
                                                            {isCorrect ? q.points : 0} / {q.points} Pts
                                                        </span>
                                                        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                                                    </div>
                                                </div>

                                                {/* Expanded Details */}
                                                {isExpanded && (
                                                    <div className="p-4 border-t border-white/[0.06] bg-black/40 space-y-3 text-xs">
                                                        <p className="text-slate-300 whitespace-pre-wrap">{q.description}</p>

                                                        {q.questionType === 'coding' ? (
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between text-[0.7rem] text-slate-400">
                                                                    <span>Language: <strong>{coding?.language || 'JavaScript'}</strong></span>
                                                                    <span>Test Cases: <strong>{coding?.passedCount || 0} passed</strong></span>
                                                                </div>
                                                                <pre className="p-3 rounded-lg bg-[#08080c] border border-white/10 text-indigo-300 font-mono text-xs overflow-x-auto">
                                                                    {coding?.code || '// No code submitted'}
                                                                </pre>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                                                                        <span className="text-[0.65rem] font-bold text-slate-400 uppercase block mb-1">Candidate Answer</span>
                                                                        <span className={`font-semibold ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                                            {userAns !== undefined ? String(userAns) : 'Unanswered'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                                                                        <span className="text-[0.65rem] font-bold text-slate-400 uppercase block mb-1">Correct Answer</span>
                                                                        <span className="font-semibold text-emerald-400">
                                                                            {String(q.correctAnswer)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                {q.explanation && (
                                                                    <p className="p-2.5 rounded-lg bg-indigo-950/20 text-indigo-300 text-xs">
                                                                        <strong>Explanation:</strong> {q.explanation}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {activeTab === 'integrity' && (
                                <div className="space-y-3">
                                    {(!attempt.integrityEvents || attempt.integrityEvents.length === 0) ? (
                                        <div className="p-8 text-center text-slate-500 text-xs bg-white/[0.02] border border-white/5 rounded-xl">
                                            ✅ Clean assessment session. No tab switches or fullscreen exits detected.
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {attempt.integrityEvents.map((evt: any, i: number) => (
                                                <div
                                                    key={i}
                                                    className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between text-xs"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                                                        <div>
                                                            <span className="font-bold text-rose-300">{evt.type}</span>
                                                            {evt.details && <span className="text-slate-400 ml-2">— {evt.details}</span>}
                                                        </div>
                                                    </div>
                                                    <span className="text-[0.7rem] text-slate-400 font-mono">
                                                        {new Date(evt.timestamp).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default CandidateReportModal;
