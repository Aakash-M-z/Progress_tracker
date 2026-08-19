/**
 * src/features/admin/components/assessments/AssessmentBuilderModal.tsx
 * Professional 4-Step Assessment Builder for AlgoAscent Admins
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Check, ArrowRight, ArrowLeft, Plus, Trash2, Layers,
    ShieldCheck, Clock, Settings, Sparkles, Code2, CheckSquare,
    AlertCircle, Search, UserPlus
} from 'lucide-react';
import { assessmentApi, Assessment, AssessmentQuestion } from '../../../../api/assessmentApi';
import QuestionBankModal from './QuestionBankModal';

interface AssessmentBuilderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (assessment: Assessment) => void;
    editingAssessment?: Assessment | null;
}

const CATEGORIES = [
    'Coding', 'DSA', 'Aptitude', 'Logical Reasoning', 'Quantitative Ability',
    'OOP', 'DBMS', 'SQL', 'OS', 'CN', 'Git', 'Technical'
];

const AssessmentBuilderModal: React.FC<AssessmentBuilderModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    editingAssessment
}) => {
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Question bank modal state
    const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);

    // Form fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [instructions, setInstructions] = useState('');
    const [duration, setDuration] = useState<number>(60);
    const [startAt, setStartAt] = useState<string>('');
    const [endAt, setEndAt] = useState<string>('');
    const [passingScore, setPassingScore] = useState<number>(60);
    const [maxAttempts, setMaxAttempts] = useState<number>(1);
    const [accessMode, setAccessMode] = useState<'public' | 'authenticated' | 'private'>('authenticated');

    // Anti-cheating & Settings
    const [requireFullscreen, setRequireFullscreen] = useState(true);
    const [trackTabSwitches, setTrackTabSwitches] = useState(true);
    const [randomizeQuestions, setRandomizeQuestions] = useState(false);
    const [randomizeOptions, setRandomizeOptions] = useState(false);
    const [showResultsImmediately, setShowResultsImmediately] = useState(true);
    const [negativeMarking, setNegativeMarking] = useState(false);
    const [negativeMarkingFactor, setNegativeMarkingFactor] = useState(0.25);

    // Questions
    const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);

    // Private assignment list
    const [assignedEmailsInput, setAssignedEmailsInput] = useState('');
    const [assignedEmails, setAssignedEmails] = useState<string[]>([]);

    // Custom question creator state
    const [isCustomCreatorOpen, setIsCustomCreatorOpen] = useState(false);
    const [customTitle, setCustomTitle] = useState('');
    const [customDesc, setCustomDesc] = useState('');
    const [customCategory, setCustomCategory] = useState('Technical');
    const [customType, setCustomType] = useState<'mcq' | 'coding'>('mcq');
    const [customDifficulty, setCustomDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
    const [customPoints, setCustomPoints] = useState(10);
    const [customOptions, setCustomOptions] = useState<{ id: string; text: string }[]>([
        { id: 'a', text: '' },
        { id: 'b', text: '' },
        { id: 'c', text: '' },
        { id: 'd', text: '' },
    ]);
    const [customCorrectAnswer, setCustomCorrectAnswer] = useState('a');
    const [customExplanation, setCustomExplanation] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        if (editingAssessment) {
            setTitle(editingAssessment.title || '');
            setDescription(editingAssessment.description || '');
            setInstructions(editingAssessment.instructions || '');
            setDuration(editingAssessment.duration || 60);
            setStartAt(editingAssessment.startAt ? new Date(editingAssessment.startAt).toISOString().slice(0, 16) : '');
            setEndAt(editingAssessment.endAt ? new Date(editingAssessment.endAt).toISOString().slice(0, 16) : '');
            setPassingScore(editingAssessment.passingScore || 60);
            setMaxAttempts(editingAssessment.maxAttempts || 1);
            setAccessMode(editingAssessment.accessMode || 'authenticated');
            setRequireFullscreen(editingAssessment.settings?.requireFullscreen !== false);
            setTrackTabSwitches(editingAssessment.settings?.trackTabSwitches !== false);
            setRandomizeQuestions(!!editingAssessment.settings?.randomizeQuestions);
            setRandomizeOptions(!!editingAssessment.settings?.randomizeOptions);
            setShowResultsImmediately(editingAssessment.settings?.showResultsImmediately !== false);
            setNegativeMarking(!!editingAssessment.settings?.negativeMarking);
            setNegativeMarkingFactor(editingAssessment.settings?.negativeMarkingFactor || 0.25);
            setQuestions(editingAssessment.questions || []);
            setAssignedEmails(editingAssessment.assignedEmails || []);
        } else {
            // Reset to defaults
            setTitle('');
            setDescription('');
            setInstructions('1. Do not refresh or close the browser tab during the assessment.\n2. Ensure a quiet, uninterrupted environment.\n3. Submit before the timer expires.');
            setDuration(60);
            setStartAt('');
            setEndAt('');
            setPassingScore(60);
            setMaxAttempts(1);
            setAccessMode('authenticated');
            setRequireFullscreen(true);
            setTrackTabSwitches(true);
            setRandomizeQuestions(false);
            setRandomizeOptions(false);
            setShowResultsImmediately(true);
            setNegativeMarking(false);
            setQuestions([]);
            setAssignedEmails([]);
        }
        setStep(1);
        setError(null);
    }, [isOpen, editingAssessment]);

    if (!isOpen) return null;

    const handleAddFromQuestionBank = (q: AssessmentQuestion) => {
        setQuestions(prev => [...prev, { ...q, id: `q_${Date.now()}_${prev.length + 1}` }]);
    };

    const handleRemoveQuestion = (idx: number) => {
        setQuestions(prev => prev.filter((_, i) => i !== idx));
    };

    const handleAddCustomQuestion = () => {
        if (!customTitle.trim()) return;

        const newQ: AssessmentQuestion = {
            id: `custom_${Date.now()}`,
            title: customTitle.trim(),
            description: customDesc.trim(),
            category: customCategory as any,
            questionType: customType,
            difficulty: customDifficulty,
            points: Number(customPoints) || 10,
            options: customType === 'mcq' ? customOptions.filter(o => o.text.trim()) : undefined,
            correctAnswer: customCorrectAnswer,
            explanation: customExplanation.trim(),
            tags: [customCategory]
        };

        setQuestions(prev => [...prev, newQ]);
        setIsCustomCreatorOpen(false);
        setCustomTitle('');
        setCustomDesc('');
        setCustomExplanation('');
    };

    const handleAddEmail = () => {
        const parts = assignedEmailsInput.split(/[\s,]+/).map(s => s.trim().toLowerCase()).filter(s => s && s.includes('@'));
        if (parts.length > 0) {
            setAssignedEmails(prev => Array.from(new Set([...prev, ...parts])));
            setAssignedEmailsInput('');
        }
    };

    const handleRemoveEmail = (email: string) => {
        setAssignedEmails(prev => prev.filter(e => e !== email));
    };

    const handleSubmit = async (publishStatus: 'published' | 'draft') => {
        if (!title.trim()) {
            setError('Please provide an assessment title.');
            setStep(1);
            return;
        }

        if (questions.length === 0) {
            setError('Please add at least one question to the assessment.');
            setStep(2);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const payload: Partial<Assessment> = {
                title: title.trim(),
                description: description.trim(),
                instructions: instructions.trim(),
                duration: Number(duration) || 60,
                startAt: startAt ? new Date(startAt).toISOString() : null,
                endAt: endAt ? new Date(endAt).toISOString() : null,
                passingScore: Number(passingScore) || 60,
                maxAttempts: Number(maxAttempts) || 1,
                accessMode,
                assignedEmails,
                settings: {
                    requireFullscreen,
                    trackTabSwitches,
                    randomizeQuestions,
                    randomizeOptions,
                    showResultsImmediately,
                    negativeMarking,
                    negativeMarkingFactor
                },
                status: publishStatus,
                questions
            };

            let res: Assessment;
            if (editingAssessment?.id) {
                res = await assessmentApi.updateAssessment(editingAssessment.id, payload);
            } else {
                res = await assessmentApi.createAssessment(payload);
            }

            onSuccess(res);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save assessment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalPoints = questions.reduce((sum, q) => sum + (Number(q.points) || 10), 0);

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
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#AA8A2A] flex items-center justify-center text-black font-black text-lg">
                            ◈
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white">
                                {editingAssessment ? 'Edit Assessment' : 'Create New Assessment'}
                            </h3>
                            <p className="text-xs text-slate-400">
                                Configure placement tests, algorithmic challenges, and core technical evaluations.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Step Wizard Breadcrumbs */}
                <div className="px-6 py-3 border-b border-white/[0.06] bg-black/30 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        {[
                            { num: 1, label: 'Basic Details' },
                            { num: 2, label: `Questions (${questions.length})` },
                            { num: 3, label: 'Access & Security' },
                            { num: 4, label: 'Review & Publish' },
                        ].map(s => (
                            <button
                                key={s.num}
                                onClick={() => setStep(s.num as any)}
                                className={`flex items-center gap-2 text-xs font-bold transition-all ${
                                    step === s.num
                                        ? 'text-[#D4AF37]'
                                        : step > s.num
                                            ? 'text-indigo-400 hover:text-white'
                                            : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[0.65rem] font-black ${
                                    step === s.num
                                        ? 'bg-[#D4AF37] text-black'
                                        : step > s.num
                                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                                            : 'bg-white/5 text-slate-500'
                                }`}>
                                    {step > s.num ? '✓' : s.num}
                                </span>
                                {s.label}
                            </button>
                        ))}
                    </div>

                    <div className="text-xs font-bold text-slate-400 hidden sm:block">
                        Total Points: <strong className="text-[#D4AF37]">{totalPoints} Pts</strong>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Wizard Steps */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* ── STEP 1: BASIC DETAILS ────────────────────────────────────────── */}
                    {step === 1 && (
                        <div className="space-y-4 max-w-2xl mx-auto">
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                                    Assessment Title *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Campus Placement Assessment — Software Engineer"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-[#141624] border border-white/10 text-white text-sm focus:border-indigo-400 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                                    Description & Scope
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Comprehensive assessment covering DSA, Coding, Aptitude, OS, and DBMS..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-[#141624] border border-white/10 text-white text-xs focus:border-indigo-400 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                                    Candidate Instructions
                                </label>
                                <textarea
                                    rows={3}
                                    value={instructions}
                                    onChange={e => setInstructions(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-[#141624] border border-white/10 text-white text-xs focus:border-indigo-400 focus:outline-none font-mono"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                                        Duration (Minutes)
                                    </label>
                                    <input
                                        type="number"
                                        min={5}
                                        max={300}
                                        value={duration}
                                        onChange={e => setDuration(Number(e.target.value))}
                                        className="w-full px-4 py-2.5 rounded-xl bg-[#141624] border border-white/10 text-white text-xs focus:border-indigo-400 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                                        Passing Score (%)
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={100}
                                        value={passingScore}
                                        onChange={e => setPassingScore(Number(e.target.value))}
                                        className="w-full px-4 py-2.5 rounded-xl bg-[#141624] border border-white/10 text-white text-xs focus:border-indigo-400 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                                        Max Attempts
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={maxAttempts}
                                        onChange={e => setMaxAttempts(Number(e.target.value))}
                                        className="w-full px-4 py-2.5 rounded-xl bg-[#141624] border border-white/10 text-white text-xs focus:border-indigo-400 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                                        Start Date & Time (Optional)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={startAt}
                                        onChange={e => setStartAt(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl bg-[#141624] border border-white/10 text-white text-xs focus:border-indigo-400 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                                        Deadline (Optional)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={endAt}
                                        onChange={e => setEndAt(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl bg-[#141624] border border-white/10 text-white text-xs focus:border-indigo-400 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2: QUESTIONS CONFIGURATION ──────────────────────────────── */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div>
                                    <h4 className="text-sm font-bold text-white">Configured Assessment Questions</h4>
                                    <p className="text-xs text-slate-400">Total {questions.length} questions • {totalPoints} Total Points</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsQuestionBankOpen(true)}
                                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
                                    >
                                        <Layers className="w-4 h-4" /> Select from Question Bank
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsCustomCreatorOpen(true)}
                                        className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1.5"
                                    >
                                        <Plus className="w-4 h-4" /> Custom Question
                                    </button>
                                </div>
                            </div>

                            {/* Custom Question Modal / Form Drawer */}
                            {isCustomCreatorOpen && (
                                <div className="p-4 rounded-xl bg-[#141624] border border-indigo-500/30 space-y-3">
                                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                        <span className="text-xs font-bold text-indigo-400 uppercase">Create Custom Question</span>
                                        <button onClick={() => setIsCustomCreatorOpen(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-[0.65rem] uppercase font-bold text-slate-400 block mb-1">Category</label>
                                            <select
                                                value={customCategory}
                                                onChange={e => setCustomCategory(e.target.value)}
                                                className="w-full px-3 py-1.5 rounded-lg bg-[#0c0d16] border border-white/10 text-xs text-white"
                                            >
                                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[0.65rem] uppercase font-bold text-slate-400 block mb-1">Type</label>
                                            <select
                                                value={customType}
                                                onChange={e => setCustomType(e.target.value as any)}
                                                className="w-full px-3 py-1.5 rounded-lg bg-[#0c0d16] border border-white/10 text-xs text-white"
                                            >
                                                <option value="mcq">MCQ / Single Choice</option>
                                                <option value="coding">Coding Problem</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[0.65rem] uppercase font-bold text-slate-400 block mb-1">Points</label>
                                            <input
                                                type="number"
                                                value={customPoints}
                                                onChange={e => setCustomPoints(Number(e.target.value))}
                                                className="w-full px-3 py-1.5 rounded-lg bg-[#0c0d16] border border-white/10 text-xs text-white"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[0.65rem] uppercase font-bold text-slate-400 block mb-1">Title</label>
                                        <input
                                            type="text"
                                            placeholder="Question Title"
                                            value={customTitle}
                                            onChange={e => setCustomTitle(e.target.value)}
                                            className="w-full px-3 py-1.5 rounded-lg bg-[#0c0d16] border border-white/10 text-xs text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[0.65rem] uppercase font-bold text-slate-400 block mb-1">Description</label>
                                        <textarea
                                            rows={2}
                                            placeholder="Question details or problem statement..."
                                            value={customDesc}
                                            onChange={e => setCustomDesc(e.target.value)}
                                            className="w-full px-3 py-1.5 rounded-lg bg-[#0c0d16] border border-white/10 text-xs text-white"
                                        />
                                    </div>

                                    {customType === 'mcq' && (
                                        <div className="space-y-2">
                                            <label className="text-[0.65rem] uppercase font-bold text-slate-400 block">Options & Correct Answer</label>
                                            {customOptions.map((opt, oIdx) => (
                                                <div key={opt.id} className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name="customCorrect"
                                                        checked={customCorrectAnswer === opt.id}
                                                        onChange={() => setCustomCorrectAnswer(opt.id)}
                                                        className="accent-[#D4AF37]"
                                                    />
                                                    <span className="text-xs font-bold text-slate-400 uppercase w-4">{opt.id}</span>
                                                    <input
                                                        type="text"
                                                        placeholder={`Option ${opt.id.toUpperCase()}`}
                                                        value={opt.text}
                                                        onChange={e => {
                                                            const newOpts = [...customOptions];
                                                            newOpts[oIdx].text = e.target.value;
                                                            setCustomOptions(newOpts);
                                                        }}
                                                        className="flex-1 px-3 py-1 rounded-lg bg-[#0c0d16] border border-white/10 text-xs text-white"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsCustomCreatorOpen(false)}
                                            className="px-3 py-1.5 rounded-lg text-xs text-slate-400"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleAddCustomQuestion}
                                            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                                        >
                                            Add Question
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Questions List */}
                            {questions.length === 0 ? (
                                <div className="p-12 text-center border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                                    <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                                    <h5 className="text-sm font-bold text-white mb-1">No Questions Added Yet</h5>
                                    <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                                        Click "Select from Question Bank" to choose from our curated pool or add custom questions.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setIsQuestionBankOpen(true)}
                                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-1.5"
                                    >
                                        <Layers className="w-4 h-4" /> Open Question Bank
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {questions.map((q, idx) => (
                                        <div
                                            key={q.id || idx}
                                            className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.07] flex items-center justify-between gap-4"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-slate-400">
                                                    {idx + 1}
                                                </span>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="px-2 py-0.5 rounded text-[0.65rem] font-bold uppercase bg-white/10 text-slate-300">
                                                            {q.category}
                                                        </span>
                                                        <span className="text-[0.65rem] text-slate-400 font-bold uppercase">
                                                            {q.questionType}
                                                        </span>
                                                        <span className="text-[0.65rem] text-amber-400 font-bold">
                                                            {q.points || 10} Pts
                                                        </span>
                                                    </div>
                                                    <h5 className="text-xs font-bold text-white truncate">{q.title}</h5>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveQuestion(idx)}
                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── STEP 3: ACCESS & SECURITY SETTINGS ───────────────────────────── */}
                    {step === 3 && (
                        <div className="space-y-6 max-w-2xl mx-auto">
                            {/* Access Mode Selector */}
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                                    Assessment Access Mode
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {[
                                        { id: 'authenticated', label: 'Authenticated', desc: 'Any logged-in AlgoAscent user' },
                                        { id: 'public', label: 'Public Link', desc: 'Anyone with link (optional guest login)' },
                                        { id: 'private', label: 'Private / Invited', desc: 'Strictly assigned users & emails' },
                                    ].map(m => (
                                        <div
                                            key={m.id}
                                            onClick={() => setAccessMode(m.id as any)}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                                accessMode === m.id
                                                    ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/20'
                                                    : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                                            }`}
                                        >
                                            <h5 className="text-xs font-bold text-white mb-1">{m.label}</h5>
                                            <p className="text-[0.7rem] text-slate-400">{m.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* If Private: User Invitations */}
                            {accessMode === 'private' && (
                                <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                                    <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider">
                                        Assigned Candidate Emails
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Enter emails (e.g., student1@gmail.com, student2@college.edu)"
                                            value={assignedEmailsInput}
                                            onChange={e => setAssignedEmailsInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddEmail())}
                                            className="flex-1 px-3.5 py-2 rounded-xl bg-[#141624] border border-white/10 text-white text-xs focus:border-indigo-400 focus:outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddEmail}
                                            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1"
                                        >
                                            <UserPlus className="w-3.5 h-3.5" /> Add
                                        </button>
                                    </div>

                                    {assignedEmails.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                                            {assignedEmails.map(email => (
                                                <span
                                                    key={email}
                                                    className="px-2.5 py-1 rounded-lg bg-white/10 text-xs text-slate-200 flex items-center gap-1.5"
                                                >
                                                    {email}
                                                    <button onClick={() => handleRemoveEmail(email)} className="text-slate-400 hover:text-white">✕</button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Anti-Cheating & Integrity Options */}
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                                    Assessment Integrity & Anti-Cheating Controls
                                </label>
                                <div className="space-y-2.5">
                                    {[
                                        {
                                            state: requireFullscreen,
                                            setter: setRequireFullscreen,
                                            label: 'Require Fullscreen Mode',
                                            desc: 'Forces candidate into fullscreen view and records whenever fullscreen is exited.'
                                        },
                                        {
                                            state: trackTabSwitches,
                                            setter: setTrackTabSwitches,
                                            label: 'Track Tab Switches & Window Blurs',
                                            desc: 'Monitors candidate focus changes and logs audit timestamps.'
                                        },
                                        {
                                            state: randomizeQuestions,
                                            setter: setRandomizeQuestions,
                                            label: 'Randomize Questions',
                                            desc: 'Shuffles question order snapshot uniquely for each candidate attempt.'
                                        },
                                        {
                                            state: showResultsImmediately,
                                            setter: setShowResultsImmediately,
                                            label: 'Show Scorecard Immediately on Submit',
                                            desc: 'If disabled, candidate sees only submission confirmation while admin reviews.'
                                        },
                                        {
                                            state: negativeMarking,
                                            setter: setNegativeMarking,
                                            label: 'Enable Negative Marking for MCQs',
                                            desc: 'Deducts 25% points for incorrect objective answers.'
                                        },
                                    ].map((opt, i) => (
                                        <div
                                            key={i}
                                            onClick={() => opt.setter(!opt.state)}
                                            className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/[0.04] transition-colors"
                                        >
                                            <div>
                                                <h6 className="text-xs font-bold text-white">{opt.label}</h6>
                                                <p className="text-[0.7rem] text-slate-400">{opt.desc}</p>
                                            </div>
                                            <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${opt.state ? 'bg-indigo-600' : 'bg-white/10'}`}>
                                                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${opt.state ? 'translate-x-4' : 'translate-x-0'}`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 4: REVIEW & PUBLISH ─────────────────────────────────────── */}
                    {step === 4 && (
                        <div className="space-y-6 max-w-2xl mx-auto">
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-black border border-indigo-500/30 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="px-2.5 py-1 rounded-md text-[0.65rem] font-black uppercase bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                                        Ready for Deployment
                                    </span>
                                    <span className="text-xs font-bold text-slate-400 capitalize">
                                        Access: <strong>{accessMode}</strong>
                                    </span>
                                </div>

                                <h3 className="text-xl font-black text-white">{title || 'Untitled Assessment'}</h3>
                                {description && <p className="text-xs text-slate-300">{description}</p>}

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center">
                                        <span className="text-[0.65rem] text-slate-400 uppercase font-bold block">Duration</span>
                                        <strong className="text-sm text-white">{duration} Mins</strong>
                                    </div>
                                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center">
                                        <span className="text-[0.65rem] text-slate-400 uppercase font-bold block">Questions</span>
                                        <strong className="text-sm text-white">{questions.length}</strong>
                                    </div>
                                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center">
                                        <span className="text-[0.65rem] text-slate-400 uppercase font-bold block">Total Points</span>
                                        <strong className="text-sm text-amber-400">{totalPoints} Pts</strong>
                                    </div>
                                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center">
                                        <span className="text-[0.65rem] text-slate-400 uppercase font-bold block">Passing %</span>
                                        <strong className="text-sm text-emerald-400">{passingScore}%</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Integrity checklist */}
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                                <h6 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Integrity & Monitoring Configuration</h6>
                                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                                    <div>• Fullscreen Mode: <strong>{requireFullscreen ? 'Enabled' : 'Disabled'}</strong></div>
                                    <div>• Tab Switch Audit: <strong>{trackTabSwitches ? 'Active' : 'Disabled'}</strong></div>
                                    <div>• Question Randomization: <strong>{randomizeQuestions ? 'Active' : 'Off'}</strong></div>
                                    <div>• Immediate Results: <strong>{showResultsImmediately ? 'Yes' : 'Manual'}</strong></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Navigation */}
                <div className="p-4 border-t border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
                    <div>
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={() => setStep((step - 1) as any)}
                                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold flex items-center gap-1.5"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {step < 4 ? (
                            <button
                                type="button"
                                onClick={() => setStep((step + 1) as any)}
                                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
                            >
                                Next Step <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => handleSubmit('draft')}
                                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold"
                                >
                                    Save as Draft
                                </button>
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => handleSubmit('published')}
                                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8A2A] text-black font-bold text-xs hover:brightness-110 shadow-lg shadow-[#D4AF37]/20 flex items-center gap-1.5"
                                >
                                    {isSubmitting ? 'Saving...' : '🚀 Publish Assessment'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Question Bank Explorer Modal */}
            <QuestionBankModal
                isOpen={isQuestionBankOpen}
                onClose={() => setIsQuestionBankOpen(false)}
                onSelectQuestion={handleAddFromQuestionBank}
                selectedQuestionIds={questions.map(q => q.id)}
            />
        </div>
    );
};

export default AssessmentBuilderModal;
