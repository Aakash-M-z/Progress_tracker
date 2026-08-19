/**
 * src/features/assessment/MyAssessmentsPage.tsx
 * Candidate Dashboard View for Assigned & Completed Assessments
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Layers, Clock, Trophy, ArrowRight, Play, CheckCircle2,
    Calendar, ShieldCheck, AlertCircle, FileText
} from 'lucide-react';
import { assessmentApi } from '../../api/assessmentApi';
import { useAuth } from '../../contexts/AuthContext';

const MyAssessmentsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [assessments, setAssessments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAssessments = async () => {
            setIsLoading(true);
            try {
                const res = await assessmentApi.getMyAssessments();
                setAssessments(res.assessments || []);
            } catch (err) {
                console.error('Failed to load my assessments:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAssessments();
    }, []);

    return (
        <div className="section-gap animate-fadeIn pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
                        <span className="text-[#D4AF37]">◈</span> My Assigned Assessments
                    </h2>
                    <p className="text-gray-400 mt-1 text-xs">
                        View and take technical assessments, campus placements, and mock coding rounds assigned to you.
                    </p>
                </div>
            </div>

            {/* Assessment List */}
            {isLoading ? (
                <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold uppercase">Loading your assessments...</span>
                </div>
            ) : assessments.length === 0 ? (
                <div className="p-16 text-center border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                    <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h4 className="text-base font-bold text-white mb-1">No Assessments Assigned</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                        When an administrator assigns you an evaluation or placement test, it will appear here.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assessments.map(a => (
                        <div
                            key={a.id}
                            className="p-5 rounded-2xl bg-[#0e101a] border border-white/5 hover:border-indigo-500/30 transition-all flex flex-col justify-between shadow-lg space-y-4"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-2.5">
                                    <span className={`px-2.5 py-0.5 rounded text-[0.65rem] font-black uppercase tracking-wider ${
                                        a.attemptStatus === 'completed'
                                            ? a.attemptPassed
                                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                            : a.attemptStatus === 'in_progress'
                                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                    }`}>
                                        {a.attemptStatus === 'completed'
                                            ? a.attemptPassed ? 'Passed' : 'Needs Improvement'
                                            : a.attemptStatus === 'in_progress' ? 'In Progress' : 'Ready to Start'}
                                    </span>

                                    {a.attemptScore !== null && (
                                        <span className="text-xs font-black text-[#D4AF37]">
                                            Score: {a.attemptScore}%
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-base font-black text-white line-clamp-1">{a.title}</h3>
                                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                    {a.description || 'Comprehensive technical assessment.'}
                                </p>

                                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/5 text-[0.7rem] text-slate-400">
                                    <div>
                                        <span className="block text-[0.6rem] font-bold uppercase text-slate-500">Duration</span>
                                        <strong className="text-slate-200">{a.duration} Mins</strong>
                                    </div>
                                    <div>
                                        <span className="block text-[0.6rem] font-bold uppercase text-slate-500">Questions</span>
                                        <strong className="text-slate-200">{a.questionCount} Total</strong>
                                    </div>
                                    <div>
                                        <span className="block text-[0.6rem] font-bold uppercase text-slate-500">Passing</span>
                                        <strong className="text-emerald-400">{a.passingScore}%</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-3 border-t border-white/5">
                                {a.attemptStatus === 'completed' ? (
                                    <button
                                        onClick={() => navigate(`/assessment/${a.shareToken}/result`, {
                                            state: { attemptId: a.attemptId }
                                        })}
                                        className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-indigo-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                        <FileText className="w-3.5 h-3.5" /> View Detailed Scorecard
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => navigate(`/assessment/${a.shareToken}`)}
                                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8A2A] text-black font-black text-xs hover:brightness-110 shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-1.5 transition-all"
                                    >
                                        <Play className="w-3.5 h-3.5" />
                                        {a.attemptStatus === 'in_progress' ? 'Resume Assessment' : 'Start Assessment'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyAssessmentsPage;
