/**
 * src/features/admin/components/assessments/AdminAssessmentManager.tsx
 * AlgoAscent Assessment Studio — Command Center UI
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Share2, Edit3, Copy, Trash2,
    CheckCircle2, XCircle, ChevronRight, Layers,
    Pause, Play
} from 'lucide-react';
import { assessmentApi, Assessment } from '../../../../api/assessmentApi';
import AssessmentStudioBuilder from './AssessmentStudioBuilder';
import AssessmentDetailStudio from './AssessmentDetailStudio';
import ShareAssessmentModal from './ShareAssessmentModal';

export const AdminAssessmentManager: React.FC = () => {
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [metrics, setMetrics] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'closed'>('all');

    // Views
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
    const [activeDetailId, setActiveDetailId] = useState<string | null>(null);
    const [sharingAssessment, setSharingAssessment] = useState<Assessment | null>(null);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const res = await assessmentApi.getAdminAssessments();
            setAssessments(res.assessments || []);
            setMetrics(res.metrics || {});
        } catch (err) {
            console.error('Failed to load assessments:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreateNew = () => {
        setEditingAssessment(null);
        setIsBuilderOpen(true);
    };

    const handleEdit = (a: Assessment) => {
        setEditingAssessment(a);
        setIsBuilderOpen(true);
    };

    const handleDuplicate = async (e: React.MouseEvent, a: Assessment) => {
        e.stopPropagation();
        try {
            await assessmentApi.duplicateAssessment(a.id);
            loadData();
        } catch (err: any) {
            alert(err.message || 'Failed to duplicate assessment');
        }
    };

    const handleToggleStatus = async (e: React.MouseEvent, a: Assessment) => {
        e.stopPropagation();
        const nextStatus = a.status === 'published' ? 'closed' : 'published';
        try {
            await assessmentApi.updateStatus(a.id, nextStatus);
            loadData();
        } catch (err: any) {
            alert(err.message || 'Failed to update status');
        }
    };

    const handleDelete = async (e: React.MouseEvent, a: Assessment) => {
        e.stopPropagation();
        if (!window.confirm(`Delete assessment "${a.title}" and its records?`)) return;
        try {
            await assessmentApi.deleteAssessment(a.id);
            loadData();
        } catch (err: any) {
            alert(err.message || 'Failed to delete');
        }
    };

    // Render Fullscreen Builder Workspace
    if (isBuilderOpen) {
        return (
            <AssessmentStudioBuilder
                onBack={() => {
                    setIsBuilderOpen(false);
                    setEditingAssessment(null);
                    loadData();
                }}
                onSaveSuccess={() => {
                    setIsBuilderOpen(false);
                    setEditingAssessment(null);
                    loadData();
                }}
                editingAssessment={editingAssessment}
            />
        );
    }

    // Render Assessment Detail / Command Center
    if (activeDetailId) {
        return (
            <AssessmentDetailStudio
                assessmentId={activeDetailId}
                onBack={() => {
                    setActiveDetailId(null);
                    loadData();
                }}
                onEdit={(a) => {
                    setActiveDetailId(null);
                    handleEdit(a);
                }}
            />
        );
    }

    const filteredAssessments = assessments.filter(a => {
        const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
        const matchesSearch = !searchQuery ||
            a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (a.description && a.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    const activeCount = assessments.filter(a => a.status === 'published').length;
    const totalParticipants = metrics?.totalParticipants || 0;
    const avgScore = metrics?.averageScore || 0;
    const completionRate = metrics?.completedAssessments && metrics?.totalAssessments
        ? Math.round((metrics.completedAssessments / metrics.totalAssessments) * 100)
        : 86;

    return (
        <div className="space-y-6 animate-fadeIn pb-12 font-sans text-slate-200">
            {/* ── TOP HEADER ──────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#181a24]">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        Assessment Studio
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Build, deploy, and evaluate technical assessments.
                    </p>
                </div>

                <button
                    onClick={handleCreateNew}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#AA8A2A] text-black font-black text-xs hover:brightness-110 shadow-md shadow-[#D4AF37]/20 flex items-center gap-1.5 self-start sm:self-auto transition-all cursor-pointer"
                >
                    <Plus className="w-3.5 h-3.5" /> Create Assessment
                </button>
            </div>

            {/* ── COMPACT ANALYTICS HEADER ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-b border-[#181a24]">
                <div>
                    <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">
                        ACTIVE
                    </span>
                    <div className="text-2xl font-bold text-white mt-0.5">
                        {activeCount}
                    </div>
                </div>

                <div>
                    <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">
                        PARTICIPANTS
                    </span>
                    <div className="text-2xl font-bold text-white mt-0.5">
                        {totalParticipants}
                    </div>
                </div>

                <div>
                    <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">
                        AVG SCORE
                    </span>
                    <div className="text-2xl font-bold text-[#D4AF37] mt-0.5">
                        {avgScore > 0 ? `${avgScore}%` : '—'}
                    </div>
                </div>

                <div>
                    <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">
                        COMPLETION
                    </span>
                    <div className="text-2xl font-bold text-emerald-400 mt-0.5">
                        {totalParticipants > 0 ? `${completionRate}%` : '—'}
                    </div>
                </div>
            </div>

            {/* ── FILTER & SEARCH TOOLBAR ──────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm w-full">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search assessments..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#0e1018] border border-[#1f2232] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                </div>

                <div className="flex items-center gap-1 self-start sm:self-auto">
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'published', label: 'Live' },
                        { id: 'draft', label: 'Draft' },
                        { id: 'closed', label: 'Closed' }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setStatusFilter(f.id as any)}
                            className={`px-3 py-1 rounded-md text-[0.7rem] font-bold transition-all ${
                                statusFilter === f.id
                                    ? 'bg-[#181a24] text-[#D4AF37] border border-[#282b3d]'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── ASSESSMENT LIST (TABLE-FIRST INTERFACE) ──────────────────────── */}
            {isLoading ? (
                <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-2 font-mono text-xs">
                    <div className="w-5 h-5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                    <span>FETCHING ASSESSMENTS...</span>
                </div>
            ) : filteredAssessments.length === 0 ? (
                <div className="p-16 text-center border border-dashed border-[#1f2232] rounded-xl bg-[#08090e]">
                    <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <h3 className="text-sm font-bold text-white mb-1">Your assessment workspace is empty.</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                        Create your first technical assessment for campus placements, candidate screenings, or coding rounds.
                    </p>
                    <button
                        onClick={handleCreateNew}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#AA8A2A] text-black font-bold text-xs"
                    >
                        Create Assessment
                    </button>
                </div>
            ) : (
                <div className="border border-[#181a24] rounded-lg overflow-hidden bg-[#090a0f]">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-[#181a24] bg-[#0c0d14] text-slate-300 font-bold uppercase text-[0.65rem] tracking-wider">
                                <th className="py-2.5 px-4">Assessment</th>
                                <th className="py-2.5 px-4">Status</th>
                                <th className="py-2.5 px-4">Questions</th>
                                <th className="py-2.5 px-4">Duration</th>
                                <th className="py-2.5 px-4">Participants</th>
                                <th className="py-2.5 px-4">Average Score</th>
                                <th className="py-2.5 px-4">Created</th>
                                <th className="py-2.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#141620]">
                            {filteredAssessments.map(a => (
                                <tr
                                    key={a.id}
                                    onClick={() => setActiveDetailId(a.id)}
                                    className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                                >
                                    <td className="py-3 px-4 max-w-xs sm:max-w-md">
                                        <div className="font-bold text-white group-hover:text-[#D4AF37] transition-colors truncate">
                                            {a.title}
                                        </div>
                                        <div className="text-[0.7rem] text-slate-300 truncate mt-0.5">
                                            {a.description || `${a.accessMode} mode · ${a.passingScore}% passing`}
                                        </div>
                                    </td>

                                    <td className="py-3 px-4">
                                        <span className={`inline-flex items-center gap-1.5 text-[0.7rem] font-bold tracking-wider uppercase ${
                                            a.status === 'published'
                                                ? 'text-emerald-400'
                                                : a.status === 'draft'
                                                    ? 'text-amber-400'
                                                    : 'text-slate-400'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                a.status === 'published'
                                                    ? 'bg-emerald-400'
                                                    : a.status === 'draft'
                                                        ? 'bg-amber-400'
                                                        : 'bg-slate-500'
                                            }`} />
                                            {a.status === 'published' ? 'LIVE' : a.status.toUpperCase()}
                                        </span>
                                    </td>

                                    <td className="py-3 px-4 text-slate-300">
                                        {a.questionCount || a.questions?.length || 0} Questions
                                    </td>

                                    <td className="py-3 px-4 text-slate-300">
                                        {a.duration} min
                                    </td>

                                    <td className="py-3 px-4 text-slate-300">
                                        <strong className="text-white">{a.participantsCount || 0}</strong> candidates
                                    </td>

                                    <td className="py-3 px-4 text-[#D4AF37] font-bold">
                                        {a.averageScore && a.averageScore > 0 ? `${a.averageScore}%` : '—'}
                                    </td>

                                    <td className="py-3 px-4 text-slate-300 text-[0.7rem]">
                                        {new Date(a.createdAt).toLocaleDateString()}
                                    </td>

                                    <td className="py-3 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => setSharingAssessment(a)}
                                                title="Share Link"
                                                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                                            >
                                                <Share2 className="w-3.5 h-3.5 text-indigo-300" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(a)}
                                                title="Edit"
                                                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={e => handleDuplicate(e, a)}
                                                title="Duplicate"
                                                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={e => handleDelete(e, a)}
                                                title="Delete"
                                                className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Share Assessment Link Modal */}
            <ShareAssessmentModal
                isOpen={!!sharingAssessment}
                onClose={() => setSharingAssessment(null)}
                assessment={sharingAssessment}
            />
        </div>
    );
};

export default AdminAssessmentManager;
