/**
 * src/features/admin/components/assessments/AssessmentDetailStudio.tsx
 * Assessment Command Center & Candidate Analytics for AlgoAscent Studio
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Share2, Edit3, CheckCircle2, XCircle, Clock,
    Trophy, Users, ShieldAlert, BarChart3, Download, FileSpreadsheet,
    Printer, Search, ChevronRight, AlertTriangle, Play, Pause,
    Code2, CheckSquare, Layers, FileText
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { assessmentApi, Assessment } from '../../../../api/assessmentApi';
import { assessmentExporter, ExportParticipant } from '../../../../utils/assessmentExporter';
import ShareAssessmentModal from './ShareAssessmentModal';
import CandidateReportModal from './CandidateReportModal';

interface AssessmentDetailStudioProps {
    assessmentId: string;
    onBack: () => void;
    onEdit: (assessment: Assessment) => void;
}

type DetailTab = 'overview' | 'candidates' | 'questions' | 'analytics' | 'integrity' | 'reports';

export const AssessmentDetailStudio: React.FC<AssessmentDetailStudioProps> = ({
    assessmentId,
    onBack,
    onEdit
}) => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<DetailTab>('candidates');
    const [candidateSearch, setCandidateSearch] = useState('');
    const [candidateFilter, setCandidateFilter] = useState<'all' | 'completed' | 'in_progress' | 'passed' | 'failed'>('all');

    // Modals
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const res = await assessmentApi.getAssessmentResults(assessmentId);
            setData(res);
        } catch (err) {
            console.error('Failed to load assessment details:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [assessmentId]);

    if (isLoading) {
        return (
            <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center gap-2 font-mono text-xs">
                <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                <span>CONNECTING TO ASSESSMENT COMMAND CENTER...</span>
            </div>
        );
    }

    if (!data || !data.assessment) {
        return (
            <div className="py-16 text-center text-slate-500 text-xs">
                <p>Assessment record could not be loaded.</p>
                <button onClick={onBack} className="mt-3 px-4 py-1.5 rounded-lg bg-white/10 text-white font-bold">
                    Return to Assessments
                </button>
            </div>
        );
    }

    const assessment = data?.assessment || {
        id: assessmentId,
        title: 'Technical Assessment',
        duration: 60,
        passingScore: 60,
        totalPoints: 50,
        status: 'published',
        accessMode: 'public',
        questions: []
    };
    const summary = data?.summary || {
        started: 0,
        completed: 0,
        completionRate: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        averageTimeSeconds: 0
    };
    const scoreDistribution = data?.scoreDistribution || [];
    const categoryPerformance = data?.categoryPerformance || [];
    const questionAnalytics = data?.questionAnalytics || [];
    const participants = data?.participants || [];

    const filteredParticipants: ExportParticipant[] = (participants || []).filter((p: any) => {
        const matchesSearch = (p?.name || '').toLowerCase().includes(candidateSearch.toLowerCase()) ||
            (p?.email || '').toLowerCase().includes(candidateSearch.toLowerCase());

        let matchesFilter = true;
        if (candidateFilter === 'completed') matchesFilter = p.status === 'completed';
        if (candidateFilter === 'in_progress') matchesFilter = p.status === 'in_progress';
        if (candidateFilter === 'passed') matchesFilter = p.passed === true;
        if (candidateFilter === 'failed') matchesFilter = p.status === 'completed' && p.passed === false;

        return matchesSearch && matchesFilter;
    });

    const handleToggleStatus = async () => {
        const nextStatus = assessment.status === 'published' ? 'closed' : 'published';
        try {
            await assessmentApi.updateStatus(assessment.id, nextStatus);
            loadData();
        } catch (err: any) {
            alert(err.message || 'Failed to change status');
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn pb-12 font-sans text-slate-200">
            {/* ── TOP ACTION HEADER ────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#181a24]">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={onBack}
                        className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-transparent hover:border-[#1f2232]"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                    <div className="h-4 w-px bg-[#1f2232] hidden sm:block" />
                    <div>
                        <div className="flex items-center gap-2.5 mb-0.5">
                            <span className="text-lg font-bold text-white tracking-tight truncate max-w-md">
                                {assessment.title}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[0.65rem] font-bold uppercase tracking-wider ${
                                assessment.status === 'published'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : assessment.status === 'draft'
                                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                        : 'bg-white/5 text-slate-400 border border-white/10'
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                    assessment.status === 'published' ? 'bg-emerald-400' : assessment.status === 'draft' ? 'bg-amber-400' : 'bg-slate-500'
                                }`} />
                                {assessment.status === 'published' ? 'LIVE' : assessment.status.toUpperCase()}
                            </span>
                        </div>
                        <p className="text-[0.7rem] text-slate-400">
                            {assessment.duration}m duration · {assessment.questions?.length || 0} questions · {assessment.totalPoints} points · {assessment.accessMode} access
                        </p>
                    </div>
                </div>

                {/* Top Action Buttons */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsShareModalOpen(true)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#141622] hover:bg-[#1a1d2c] text-indigo-300 font-bold text-xs border border-indigo-500/30 flex items-center gap-1.5 transition-colors"
                    >
                        <Share2 className="w-3.5 h-3.5" /> Share Link
                    </button>
                    <button
                        type="button"
                        onClick={() => onEdit(assessment)}
                        className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs border border-[#1f2232] flex items-center gap-1.5 transition-colors"
                    >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                        type="button"
                        onClick={handleToggleStatus}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                            assessment.status === 'published'
                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                        }`}
                    >
                        {assessment.status === 'published' ? (
                            <>
                                <Pause className="w-3.5 h-3.5" /> Close Assessment
                            </>
                        ) : (
                            <>
                                <Play className="w-3.5 h-3.5" /> Publish Live
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* ── COMPACT METRIC HEADER (PRECISION ANALYTICS) ───────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-b border-[#181a24]">
                <div>
                    <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">
                        PARTICIPATION
                    </span>
                    <div className="text-xl font-bold text-white mt-0.5">
                        {summary.completed} <span className="text-xs text-slate-300 font-normal">/ {summary.started}</span>
                    </div>
                    <span className="text-[0.7rem] text-slate-400">{summary.completionRate}% completion</span>
                </div>

                <div>
                    <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">
                        AVG SCORE
                    </span>
                    <div className="text-xl font-bold text-[#D4AF37] mt-0.5">
                        {summary.averageScore}%
                    </div>
                    <span className="text-[0.7rem] text-slate-400">Benchmark: {assessment.passingScore}%</span>
                </div>

                <div>
                    <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">
                        AVG TIME
                    </span>
                    <div className="text-xl font-bold text-white mt-0.5">
                        {(summary.averageTimeSeconds / 60).toFixed(0)}m
                    </div>
                    <span className="text-[0.7rem] text-slate-400">Limit: {assessment.duration}m</span>
                </div>

                <div>
                    <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">
                        TOP SCORE
                    </span>
                    <div className="text-xl font-bold text-emerald-400 mt-0.5">
                        {summary.highestScore}%
                    </div>
                    <span className="text-[0.7rem] text-slate-400">Lowest: {summary.lowestScore}%</span>
                </div>
            </div>

            {/* ── NAVIGATION TABS ──────────────────────────────────────────────── */}
            <div className="flex items-center gap-1 border-b border-[#181a24] overflow-x-auto pb-px">
                {[
                    { id: 'candidates', label: `Candidates (${participants?.length || 0})` },
                    { id: 'questions', label: `Questions (${questionAnalytics?.length || 0})` },
                    { id: 'analytics', label: 'Analytics' },
                    { id: 'overview', label: 'Overview' },
                    { id: 'reports', label: 'Reports & Export' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                            activeTab === tab.id
                                ? 'border-[#D4AF37] text-white'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── TAB CONTENT ─────────────────────────────────────────────────── */}
            <div>
                {/* ── 1. CANDIDATES (LIVE PARTICIPATION TABLE) ───────────────── */}
                {activeTab === 'candidates' && (
                    <div className="space-y-4">
                        {/* Search & Filter bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search candidate name or email..."
                                    value={candidateSearch}
                                    onChange={e => setCandidateSearch(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#0e1018] border border-[#1f2232] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37]"
                                />
                            </div>

                            <div className="flex items-center gap-1 text-xs">
                                {[
                                    { id: 'all', label: 'All' },
                                    { id: 'completed', label: 'Completed' },
                                    { id: 'in_progress', label: 'In Progress' },
                                    { id: 'passed', label: 'Passed' },
                                    { id: 'failed', label: 'Failed' }
                                ].map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => setCandidateFilter(f.id as any)}
                                        className={`px-3 py-1 rounded-md text-[0.7rem] font-bold transition-all ${
                                            candidateFilter === f.id
                                                ? 'bg-[#181a24] text-[#D4AF37] border border-[#282b3d]'
                                                : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Candidates Table */}
                        <div className="border border-[#181a24] rounded-lg overflow-hidden bg-[#090a0f]">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-[#181a24] bg-[#0c0d14] text-slate-300 font-bold uppercase text-[0.65rem] tracking-wider">
                                        <th className="py-2.5 px-4">Candidate</th>
                                        <th className="py-2.5 px-4">Status</th>
                                        <th className="py-2.5 px-4">Score</th>
                                        <th className="py-2.5 px-4">Time</th>
                                        <th className="py-2.5 px-4">Accuracy</th>
                                        <th className="py-2.5 px-4">Integrity</th>
                                        <th className="py-2.5 px-4 text-right">Audit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#141620]">
                                    {filteredParticipants.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-14 text-center">
                                                <div className="flex flex-col items-center justify-center gap-1">
                                                    <span className="text-xs font-semibold text-slate-300">No candidate submissions recorded yet.</span>
                                                    <span className="text-[0.7rem] text-slate-500 max-w-sm">
                                                        Share the assessment link with verified Gmail or registered candidates to evaluate their technical performance.
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredParticipants.map((p: any) => (
                                            <tr key={p.attemptId} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="py-2.5 px-4">
                                                    <div className="font-bold text-white">{p.name || 'Candidate'}</div>
                                                    <div className="text-[0.7rem] text-slate-300">{p.email || '—'}</div>
                                                </td>
                                                <td className="py-2.5 px-4">
                                                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                                                        p.status === 'completed'
                                                            ? p.passed ? 'text-emerald-400' : 'text-rose-400'
                                                            : 'text-amber-400'
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                                            p.status === 'completed'
                                                                ? p.passed ? 'bg-emerald-400' : 'bg-rose-400'
                                                                : 'bg-amber-400'
                                                        }`} />
                                                        {p.status === 'completed' ? (p.passed ? 'Passed' : 'Failed') : 'In Progress'}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-4">
                                                    <span className="font-bold text-white">{p.score}</span>
                                                    <span className="text-slate-300 font-normal"> / {p.maxScore}</span>
                                                    <span className="text-[0.7rem] text-[#D4AF37] ml-1 font-bold">({p.percentage}%)</span>
                                                </td>
                                                <td className="py-2.5 px-4 text-slate-300">
                                                    {(p.timeTakenSeconds / 60).toFixed(1)}m
                                                </td>
                                                <td className="py-2.5 px-4 text-slate-300">
                                                    {p.accuracy}%
                                                </td>
                                                <td className="py-2.5 px-4">
                                                    <span className={`font-mono text-xs ${
                                                        p.integrityScore >= 80 ? 'text-emerald-400' : 'text-rose-400'
                                                    }`}>
                                                        {p.integrityScore}/100
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-4 text-right">
                                                    <button
                                                        onClick={() => setSelectedAttemptId(p.attemptId)}
                                                        className="px-2.5 py-1 rounded text-xs font-bold text-indigo-300 hover:text-white hover:bg-indigo-600/20 transition-colors"
                                                    >
                                                        View Report →
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── 2. QUESTIONS DIAGNOSTICS ───────────────────────────────── */}
                {activeTab === 'questions' && (
                    <div className="space-y-4">
                        <div className="border border-[#181a24] rounded-lg overflow-hidden bg-[#090a0f]">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-[#181a24] bg-[#0c0d14] text-slate-300 font-bold uppercase text-[0.65rem] tracking-wider">
                                        <th className="py-2.5 px-4">Question</th>
                                        <th className="py-2.5 px-4">Category</th>
                                        <th className="py-2.5 px-4">Difficulty</th>
                                        <th className="py-2.5 px-4">Attempts</th>
                                        <th className="py-2.5 px-4">Correct</th>
                                        <th className="py-2.5 px-4">Skipped</th>
                                        <th className="py-2.5 px-4 text-right">Success Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#141620]">
                                    {(questionAnalytics || []).map((q: any, idx: number) => (
                                        <tr key={q.id || idx} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="py-2.5 px-4 font-bold text-white max-w-xs truncate">{q.title}</td>
                                            <td className="py-2.5 px-4 text-slate-300">{q.category}</td>
                                            <td className="py-2.5 px-4">
                                                <span className={`text-[0.7rem] font-bold ${
                                                    q.difficulty === 'Easy' ? 'text-emerald-400'
                                                        : q.difficulty === 'Medium' ? 'text-amber-400' : 'text-rose-400'
                                                }`}>
                                                    {q.difficulty}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-4 text-slate-300">{q.attempts}</td>
                                            <td className="py-2.5 px-4 text-emerald-400 font-semibold">{q.correct}</td>
                                            <td className="py-2.5 px-4 text-slate-300">{q.skipped}</td>
                                            <td className="py-2.5 px-4 text-right font-mono font-bold text-white">
                                                <span className={q.successRate >= 60 ? 'text-emerald-400' : 'text-rose-400'}>
                                                    {q.successRate}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── 3. ANALYTICS (RECHARTS VISUALS) ────────────────────────── */}
                {activeTab === 'analytics' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="p-5 rounded-xl bg-[#090a0f] border border-[#181a24] space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                                Score Distribution Brackets
                            </h4>
                            <div className="h-56 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={scoreDistribution}>
                                        <XAxis dataKey="range" stroke="#475569" fontSize={11} />
                                        <YAxis stroke="#475569" fontSize={11} allowDecimals={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#090a0f', borderColor: '#1f2232', borderRadius: '8px' }}
                                            labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                                        />
                                        <Bar dataKey="count" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="p-5 rounded-xl bg-[#090a0f] border border-[#181a24] space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                                Category Performance Average
                            </h4>
                            <div className="h-56 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={categoryPerformance} layout="vertical">
                                        <XAxis type="number" domain={[0, 100]} stroke="#475569" fontSize={11} unit="%" />
                                        <YAxis type="category" dataKey="category" stroke="#475569" fontSize={11} width={80} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#090a0f', borderColor: '#1f2232', borderRadius: '8px' }}
                                            labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                                        />
                                        <Bar dataKey="averagePercentage" fill="#6366f1" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── 4. OVERVIEW ────────────────────────────────────────────── */}
                {activeTab === 'overview' && (
                    <div className="p-6 rounded-xl bg-[#090a0f] border border-[#181a24] space-y-4 text-xs">
                        <div>
                            <span className="text-[0.65rem] uppercase font-bold text-slate-300 block mb-1">Description</span>
                            <p className="text-slate-300 leading-relaxed">{assessment.description || 'No description provided.'}</p>
                        </div>

                        <div>
                            <span className="text-[0.65rem] uppercase font-bold text-slate-300 block mb-1">Candidate Instructions</span>
                            <pre className="p-3 rounded-lg bg-black border border-[#181a24] text-slate-300 font-mono text-[0.7rem] whitespace-pre-wrap">
                                {assessment.instructions || 'Standard assessment instructions apply.'}
                            </pre>
                        </div>
                    </div>
                )}

                {/* ── 5. REPORTS & EXPORT ─────────────────────────────────────── */}
                {activeTab === 'reports' && (
                    <div className="p-6 rounded-xl bg-[#090a0f] border border-[#181a24] space-y-6">
                        <div>
                            <h4 className="text-sm font-bold text-white">Assessment Data Exports</h4>
                            <p className="text-xs text-slate-400">Download formatted reports in CSV, Excel, or printable audit PDF format.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button
                                onClick={() => assessmentExporter.exportCSV(assessment.title, filteredParticipants)}
                                className="p-4 rounded-lg bg-[#0e1018] border border-[#181a24] hover:border-[#D4AF37]/40 text-left transition-colors flex items-center justify-between"
                            >
                                <div>
                                    <h5 className="text-xs font-bold text-white">Download CSV</h5>
                                    <p className="text-[0.7rem] text-slate-400">Full raw participant metrics</p>
                                </div>
                                <Download className="w-4 h-4 text-emerald-400" />
                            </button>

                            <button
                                onClick={() => assessmentExporter.exportExcel(assessment.title, filteredParticipants)}
                                className="p-4 rounded-lg bg-[#0e1018] border border-[#181a24] hover:border-[#D4AF37]/40 text-left transition-colors flex items-center justify-between"
                            >
                                <div>
                                    <h5 className="text-xs font-bold text-white">Download Excel</h5>
                                    <p className="text-[0.7rem] text-slate-400">Multi-column spreadsheet dataset</p>
                                </div>
                                <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                            </button>

                            <button
                                onClick={() => assessmentExporter.printAssessmentSummaryPDF(assessment, summary, filteredParticipants, categoryPerformance)}
                                className="p-4 rounded-lg bg-[#0e1018] border border-[#181a24] hover:border-[#D4AF37]/40 text-left transition-colors flex items-center justify-between"
                            >
                                <div>
                                    <h5 className="text-xs font-bold text-white">Printable PDF Report</h5>
                                    <p className="text-[0.7rem] text-slate-400">Branded PDF executive audit</p>
                                </div>
                                <Printer className="w-4 h-4 text-[#D4AF37]" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <ShareAssessmentModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                assessment={assessment}
            />

            {selectedAttemptId && (
                <CandidateReportModal
                    isOpen={!!selectedAttemptId}
                    onClose={() => setSelectedAttemptId(null)}
                    assessmentId={assessment.id}
                    attemptId={selectedAttemptId}
                />
            )}
        </div>
    );
};

export default AssessmentDetailStudio;
