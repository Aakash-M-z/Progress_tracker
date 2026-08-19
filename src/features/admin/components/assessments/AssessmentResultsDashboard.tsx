/**
 * src/features/admin/components/assessments/AssessmentResultsDashboard.tsx
 * Deep Assessment Analytics & Participant Results Management
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, Trophy, Clock, CheckCircle2, XCircle, AlertTriangle,
    Download, Printer, Search, ArrowLeft, ShieldAlert, BarChart3,
    FileSpreadsheet, ExternalLink, ChevronRight
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    Cell
} from 'recharts';
import { assessmentApi } from '../../../../api/assessmentApi';
import { assessmentExporter, ExportParticipant } from '../../../../utils/assessmentExporter';
import CandidateReportModal from './CandidateReportModal';

interface AssessmentResultsDashboardProps {
    assessmentId: string;
    onBack: () => void;
}

const AssessmentResultsDashboard: React.FC<AssessmentResultsDashboardProps> = ({
    assessmentId,
    onBack
}) => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const res = await assessmentApi.getAssessmentResults(assessmentId);
            setData(res);
        } catch (err) {
            console.error('Failed to load assessment results:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [assessmentId]);

    if (isLoading) {
        return (
            <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold uppercase tracking-wider">Computing assessment analytics...</span>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="py-16 text-center text-slate-500">
                <p>Failed to load assessment data.</p>
                <button onClick={onBack} className="mt-4 px-4 py-2 bg-white/10 rounded-xl text-white text-xs font-bold">
                    Back to Assessments
                </button>
            </div>
        );
    }

    const assessment = data?.assessment || {
        id: assessmentId,
        title: 'Technical Assessment',
        duration: 60,
        passingScore: 60,
        totalPoints: 50
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

    const filteredParticipants: ExportParticipant[] = (participants || []).filter((p: any) =>
        (p?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p?.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleExportCSV = () => {
        assessmentExporter.exportCSV(assessment.title, filteredParticipants);
    };

    const handleExportExcel = () => {
        assessmentExporter.exportExcel(assessment.title, filteredParticipants);
    };

    const handlePrintSummaryPDF = () => {
        assessmentExporter.printAssessmentSummaryPDF(assessment, summary, filteredParticipants, categoryPerformance);
    };

    return (
        <div className="space-y-6 animate-fadeIn pb-12">
            {/* Top Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded text-[0.65rem] font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                Results & Analytics
                            </span>
                            <span className="text-xs text-slate-500 font-mono">ID: {assessment.id}</span>
                        </div>
                        <h2 className="text-2xl font-black text-white">{assessment.title}</h2>
                    </div>
                </div>

                {/* Export Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={handleExportCSV}
                        className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-white/10 transition-colors"
                    >
                        <Download className="w-3.5 h-3.5 text-emerald-400" /> Export CSV
                    </button>
                    <button
                        onClick={handleExportExcel}
                        className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-white/10 transition-colors"
                    >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" /> Export Excel
                    </button>
                    <button
                        onClick={handlePrintSummaryPDF}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8A2A] text-black font-bold text-xs hover:brightness-110 shadow-lg shadow-[#D4AF37]/20 flex items-center gap-1.5"
                    >
                        <Printer className="w-3.5 h-3.5" /> Printable PDF Report
                    </button>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                <div className="p-4 rounded-2xl bg-[#0e101a] border border-white/5 shadow-md">
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 block">Participants</span>
                    <div className="text-2xl font-black text-white mt-1">{summary.completed} <span className="text-xs text-slate-500 font-normal">/ {summary.started}</span></div>
                    <span className="text-[0.7rem] text-slate-500">{summary.completionRate}% completion</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0e101a] border border-white/5 shadow-md">
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 block">Average Score</span>
                    <div className="text-2xl font-black text-[#D4AF37] mt-1">{summary.averageScore}%</div>
                    <span className="text-[0.7rem] text-slate-500">Benchmark: {assessment.passingScore}%</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0e101a] border border-white/5 shadow-md">
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 block">Highest Score</span>
                    <div className="text-2xl font-black text-emerald-400 mt-1">{summary.highestScore}%</div>
                    <span className="text-[0.7rem] text-slate-500">Top performer</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0e101a] border border-white/5 shadow-md">
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 block">Lowest Score</span>
                    <div className="text-2xl font-black text-rose-400 mt-1">{summary.lowestScore}%</div>
                    <span className="text-[0.7rem] text-slate-500">Needs review</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0e101a] border border-white/5 shadow-md">
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 block">Average Time</span>
                    <div className="text-2xl font-black text-indigo-400 mt-1">{(summary.averageTimeSeconds / 60).toFixed(1)}m</div>
                    <span className="text-[0.7rem] text-slate-500">Limit: {assessment.duration}m</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0e101a] border border-white/5 shadow-md">
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 block">Total Questions</span>
                    <div className="text-2xl font-black text-purple-400 mt-1">{questionAnalytics?.length || 0}</div>
                    <span className="text-[0.7rem] text-slate-500">{assessment.totalPoints} points</span>
                </div>
            </div>

            {/* Visual Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Score Distribution Chart */}
                <div className="p-6 rounded-2xl bg-[#0e101a] border border-white/5 shadow-md space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-indigo-400" /> Score Distribution Histogram
                            </h4>
                            <p className="text-xs text-slate-400">Candidate score distribution brackets</p>
                        </div>
                    </div>

                    <div className="h-60 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={scoreDistribution}>
                                <XAxis dataKey="range" stroke="#64748b" fontSize={11} />
                                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]}>
                                    {scoreDistribution.map((entry: any, index: number) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={index >= 3 ? '#10b981' : index === 2 ? '#f59e0b' : '#6366f1'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Mastery Bar Chart */}
                <div className="p-6 rounded-2xl bg-[#0e101a] border border-white/5 shadow-md space-y-4">
                    <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-[#D4AF37]" /> Category Performance Mastery
                        </h4>
                        <p className="text-xs text-slate-400">Average score achieved across technical domains</p>
                    </div>

                    <div className="h-60 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryPerformance} layout="vertical">
                                <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={11} unit="%" />
                                <YAxis type="category" dataKey="category" stroke="#64748b" fontSize={11} width={80} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="averagePercentage" fill="#D4AF37" radius={[0, 6, 6, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Question Analytics Table */}
            <div className="p-6 rounded-2xl bg-[#0e101a] border border-white/5 shadow-md space-y-4">
                <div>
                    <h4 className="text-base font-bold text-white">Question-Level Analytics</h4>
                    <p className="text-xs text-slate-400">Diagnostic metrics to identify question difficulty and pass rates</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                                <th className="pb-3 px-3">Question</th>
                                <th className="pb-3 px-3">Category</th>
                                <th className="pb-3 px-3">Type</th>
                                <th className="pb-3 px-3">Difficulty</th>
                                <th className="pb-3 px-3">Attempts</th>
                                <th className="pb-3 px-3">Correct</th>
                                <th className="pb-3 px-3">Skipped</th>
                                <th className="pb-3 px-3 text-right">Success Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {(questionAnalytics || []).map((q: any, idx: number) => (
                                <tr key={q.id || idx} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="py-3 px-3 font-bold text-white max-w-xs truncate">{q.title}</td>
                                    <td className="py-3 px-3 text-slate-300">{q.category}</td>
                                    <td className="py-3 px-3 uppercase text-[0.7rem] font-bold text-slate-400">{q.type}</td>
                                    <td className="py-3 px-3">
                                        <span className={`px-2 py-0.5 rounded text-[0.65rem] font-bold uppercase ${
                                            q.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-500/10'
                                                : q.difficulty === 'Medium' ? 'text-amber-400 bg-amber-500/10'
                                                : 'text-rose-400 bg-rose-500/10'
                                        }`}>
                                            {q.difficulty}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 text-slate-300 font-semibold">{q.attempts}</td>
                                    <td className="py-3 px-3 text-emerald-400 font-semibold">{q.correct}</td>
                                    <td className="py-3 px-3 text-slate-500">{q.skipped}</td>
                                    <td className="py-3 px-3 text-right font-black text-white">
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

            {/* Participant Results Table */}
            <div className="p-6 rounded-2xl bg-[#0e101a] border border-white/5 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h4 className="text-base font-bold text-white">Participant Attempts ({filteredParticipants.length})</h4>
                        <p className="text-xs text-slate-400">Detailed scorecard for all candidate submissions</p>
                    </div>

                    <div className="relative min-w-[240px]">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search candidate name or email..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#141624] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                                <th className="pb-3 px-3">Candidate</th>
                                <th className="pb-3 px-3">Status</th>
                                <th className="pb-3 px-3">Score</th>
                                <th className="pb-3 px-3">Percentage</th>
                                <th className="pb-3 px-3">Result</th>
                                <th className="pb-3 px-3">Accuracy</th>
                                <th className="pb-3 px-3">Time</th>
                                <th className="pb-3 px-3">Integrity</th>
                                <th className="pb-3 px-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredParticipants.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-8 text-center text-slate-500">
                                        No participant submissions found.
                                    </td>
                                </tr>
                            ) : (
                                filteredParticipants.map((p: any) => (
                                    <tr key={p.attemptId} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="py-3 px-3">
                                            <div className="font-bold text-white">{p.name || 'Candidate'}</div>
                                            <div className="text-[0.7rem] text-slate-400">{p.email || '—'}</div>
                                        </td>
                                        <td className="py-3 px-3">
                                            <span className={`px-2 py-0.5 rounded text-[0.65rem] font-bold uppercase ${
                                                p.status === 'completed'
                                                    ? 'bg-emerald-500/10 text-emerald-300'
                                                    : p.status === 'in_progress'
                                                        ? 'bg-amber-500/10 text-amber-300'
                                                        : 'bg-white/5 text-slate-400'
                                            }`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 font-semibold text-white">
                                            {p.score} <span className="text-slate-500 font-normal">/ {p.maxScore}</span>
                                        </td>
                                        <td className="py-3 px-3 font-black text-[#D4AF37]">{p.percentage}%</td>
                                        <td className="py-3 px-3">
                                            <span className={`px-2 py-0.5 rounded text-[0.65rem] font-black uppercase ${
                                                p.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                                            }`}>
                                                {p.passed ? 'PASSED' : 'FAILED'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 text-slate-300">{p.accuracy}%</td>
                                        <td className="py-3 px-3 text-slate-300">{(p.timeTakenSeconds / 60).toFixed(1)}m</td>
                                        <td className="py-3 px-3">
                                            <span className={`font-bold ${p.integrityScore >= 80 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {p.integrityScore}/100
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 text-right">
                                            <button
                                                onClick={() => setSelectedAttemptId(p.attemptId)}
                                                className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-bold border border-indigo-500/30 transition-colors inline-flex items-center gap-1"
                                            >
                                                View Report <ChevronRight className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Individual Candidate Report Modal */}
            {selectedAttemptId && (
                <CandidateReportModal
                    isOpen={!!selectedAttemptId}
                    onClose={() => setSelectedAttemptId(null)}
                    assessmentId={assessmentId}
                    attemptId={selectedAttemptId}
                />
            )}
        </div>
    );
};

export default AssessmentResultsDashboard;
