/**
 * src/features/admin/components/assessments/AssessmentStudioBuilder.tsx
 * Precision Assessment Studio Builder for AlgoAscent
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Check, Plus, Trash2, Copy, Sparkles, Layers,
    ShieldCheck, Clock, Settings, Code2, CheckSquare, AlertCircle,
    UserPlus, ChevronUp, ChevronDown, Flame, Globe, Lock, Share2,
    Database, Cpu, Network, GitBranch, Layout, Server, Brain, HelpCircle
} from 'lucide-react';
import { assessmentApi, Assessment, AssessmentQuestion } from '../../../../api/assessmentApi';
import QuestionBankModal from './QuestionBankModal';
import AIQuestionAssistantDrawer from './AIQuestionAssistantDrawer';

interface AssessmentStudioBuilderProps {
    onBack: () => void;
    onSaveSuccess: (assessment: Assessment) => void;
    editingAssessment?: Assessment | null;
}

type BuilderStep = 'details' | 'questions' | 'access' | 'rules' | 'review';

const ADD_CATEGORIES = [
    { id: 'CODING', label: 'CODING', icon: Code2, desc: 'Evaluate implementation and problem solving.' },
    { id: 'DSA', label: 'DSA', icon: Flame, desc: 'Algorithms, complexity, and data structures.' },
    { id: 'APTITUDE', label: 'APTITUDE', icon: Brain, desc: 'Quantitative and numerical reasoning.' },
    { id: 'LOGICAL', label: 'LOGICAL', icon: HelpCircle, desc: 'Pattern recognition and logical deductions.' },
    { id: 'OOP', label: 'OOP', icon: Layout, desc: 'Object-oriented design, polymorphism & inheritance.' },
    { id: 'DBMS', label: 'DBMS / SQL', icon: Database, desc: 'Relational database schema and SQL query execution.' },
    { id: 'OS', label: 'OS', icon: Cpu, desc: 'Concurrency, process synchronization & memory.' },
    { id: 'CN', label: 'NETWORKING', icon: Network, desc: 'TCP/IP, HTTP, routing, sockets & protocols.' },
    { id: 'Git', label: 'GIT', icon: GitBranch, desc: 'Branching workflows, commits & rebase strategies.' },
    { id: 'Frontend', label: 'FRONTEND', icon: Layout, desc: 'DOM, React, modern JavaScript & UI engineering.' },
    { id: 'Backend', label: 'BACKEND', icon: Server, desc: 'REST APIs, authentication, caching & architectures.' },
    { id: 'Technical', label: 'GENERAL', icon: Layers, desc: 'Core technical engineering problem solving.' }
];

export const AssessmentStudioBuilder: React.FC<AssessmentStudioBuilderProps> = ({
    onBack,
    onSaveSuccess,
    editingAssessment
}) => {
    const [currentStep, setCurrentStep] = useState<BuilderStep>('details');
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatusText, setSaveStatusText] = useState('Draft • Auto-saved');
    const [error, setError] = useState<string | null>(null);

    // Modals & Drawers
    const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);
    const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);
    const [isAddPickerOpen, setIsAddPickerOpen] = useState(false);

    // 01 Details State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [instructions, setInstructions] = useState('');
    const [duration, setDuration] = useState<number>(60);
    const [passingScore, setPassingScore] = useState<number>(60);
    const [maxAttempts, setMaxAttempts] = useState<number>(1);
    const [startAt, setStartAt] = useState<string>('');
    const [endAt, setEndAt] = useState<string>('');

    // 02 Questions State
    const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
    const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

    // Custom Creator inline
    const [customCategory, setCustomCategory] = useState<string>('CODING');
    const [customType, setCustomType] = useState<'coding' | 'mcq'>('coding');
    const [customTitle, setCustomTitle] = useState('');
    const [customDesc, setCustomDesc] = useState('');
    const [customDifficulty, setCustomDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
    const [customPoints, setCustomPoints] = useState(10);
    const [customOptions, setCustomOptions] = useState<{ id: string; text: string }[]>([
        { id: 'a', text: '' },
        { id: 'b', text: '' },
        { id: 'c', text: '' },
        { id: 'd', text: '' }
    ]);
    const [customCorrect, setCustomCorrect] = useState('a');
    const [customExplanation, setCustomExplanation] = useState('');

    // 03 Access State
    const [accessMode, setAccessMode] = useState<'public' | 'authenticated' | 'private'>('authenticated');
    const [assignedEmailsInput, setAssignedEmailsInput] = useState('');
    const [assignedEmails, setAssignedEmails] = useState<string[]>([]);

    // 04 Rules State
    const [requireFullscreen, setRequireFullscreen] = useState(true);
    const [trackTabSwitches, setTrackTabSwitches] = useState(true);
    const [randomizeQuestions, setRandomizeQuestions] = useState(false);
    const [randomizeOptions, setRandomizeOptions] = useState(false);
    const [showResultsImmediately, setShowResultsImmediately] = useState(true);
    const [negativeMarking, setNegativeMarking] = useState(false);
    const [negativeMarkingFactor, setNegativeMarkingFactor] = useState(0.25);

    useEffect(() => {
        if (editingAssessment) {
            setTitle(editingAssessment.title || '');
            setDescription(editingAssessment.description || '');
            setInstructions(editingAssessment.instructions || '');
            setDuration(editingAssessment.duration || 60);
            setPassingScore(editingAssessment.passingScore || 60);
            setMaxAttempts(editingAssessment.maxAttempts || 1);
            setStartAt(editingAssessment.startAt ? new Date(editingAssessment.startAt).toISOString().slice(0, 16) : '');
            setEndAt(editingAssessment.endAt ? new Date(editingAssessment.endAt).toISOString().slice(0, 16) : '');
            setQuestions(editingAssessment.questions || []);
            setAccessMode(editingAssessment.accessMode || 'authenticated');
            setAssignedEmails(editingAssessment.assignedEmails || []);
            setRequireFullscreen(editingAssessment.settings?.requireFullscreen !== false);
            setTrackTabSwitches(editingAssessment.settings?.trackTabSwitches !== false);
            setRandomizeQuestions(!!editingAssessment.settings?.randomizeQuestions);
            setRandomizeOptions(!!editingAssessment.settings?.randomizeOptions);
            setShowResultsImmediately(editingAssessment.settings?.showResultsImmediately !== false);
            setNegativeMarking(!!editingAssessment.settings?.negativeMarking);
            setNegativeMarkingFactor(editingAssessment.settings?.negativeMarkingFactor || 0.25);
        } else {
            setTitle('');
            setDescription('');
            setInstructions('1. The assessment timer runs authoritatively on the server.\n2. Do not switch tabs or exit fullscreen mode during the session.\n3. Make sure all code solutions pass sample test cases before final submission.');
            setDuration(60);
            setPassingScore(60);
            setMaxAttempts(1);
            setQuestions([]);
            setAccessMode('authenticated');
            setAssignedEmails([]);
        }
    }, [editingAssessment]);

    const totalPoints = questions.reduce((sum, q) => sum + (Number(q.points) || 10), 0);

    const handleAddQuestionFromBank = (q: AssessmentQuestion) => {
        setQuestions(prev => [...prev, { ...q, id: `q_${Date.now()}_${prev.length + 1}` }]);
    };

    const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= questions.length) return;
        const newQuestions = [...questions];
        const temp = newQuestions[index];
        newQuestions[index] = newQuestions[targetIndex];
        newQuestions[targetIndex] = temp;
        setQuestions(newQuestions);
    };

    const handleDuplicateQuestion = (q: AssessmentQuestion) => {
        const duplicated: AssessmentQuestion = {
            ...q,
            id: `q_${Date.now()}`,
            title: `${q.title} (Copy)`
        };
        setQuestions(prev => [...prev, duplicated]);
    };

    const handleDeleteQuestion = (index: number) => {
        setQuestions(prev => prev.filter((_, i) => i !== index));
    };

    const handleCreateCategoryQuestion = (catId: string) => {
        setCustomCategory(catId);
        setCustomType(['CODING', 'DSA', 'Frontend', 'Backend'].includes(catId) ? 'coding' : 'mcq');
        setCustomTitle('');
        setCustomDesc('');
        setCustomPoints(catId === 'CODING' || catId === 'DSA' ? 20 : 10);
        setIsAddPickerOpen(false);
        setEditingQuestionIndex(-1); // -1 indicates new question in creation
    };

    const handleSaveCustomQuestion = () => {
        if (!customTitle.trim()) return;

        const newQ: AssessmentQuestion = {
            id: `q_${Date.now()}`,
            title: customTitle.trim(),
            description: customDesc.trim() || customTitle.trim(),
            category: customCategory as any,
            questionType: customType,
            difficulty: customDifficulty,
            points: Number(customPoints) || 10,
            options: customType === 'mcq' ? customOptions.filter(o => o.text.trim()) : undefined,
            correctAnswer: customCorrect,
            explanation: customExplanation.trim(),
            starterCode: customType === 'coding' ? {
                javascript: 'function solution(...args) {\n    // Implement your solution\n}',
                python: 'class Solution:\n    def solution(self, *args):\n        pass',
                java: 'class Solution {\n    public Object solution(Object... args) { return null; }\n}',
                cpp: 'class Solution {\npublic:\n    void solution() {}\n};'
            } : undefined,
            testCases: customType === 'coding' ? [
                { input: [1, 2, 3], expectedOutput: [1, 2, 3], description: 'Sample case 1' }
            ] : undefined,
            tags: [customCategory, customDifficulty]
        };

        if (editingQuestionIndex !== null && editingQuestionIndex >= 0) {
            const updated = [...questions];
            updated[editingQuestionIndex] = newQ;
            setQuestions(updated);
        } else {
            setQuestions(prev => [...prev, newQ]);
        }

        setEditingQuestionIndex(null);
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

    const handleSave = async (status: 'published' | 'draft') => {
        if (!title.trim()) {
            setError('Please enter an assessment name.');
            setCurrentStep('details');
            return;
        }

        if (questions.length === 0 && status === 'published') {
            setError('Please add at least one question before publishing.');
            setCurrentStep('questions');
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const payload: Partial<Assessment> = {
                title: title.trim(),
                description: description.trim(),
                instructions: instructions.trim(),
                duration: Number(duration) || 60,
                passingScore: Number(passingScore) || 60,
                maxAttempts: Number(maxAttempts) || 1,
                startAt: startAt ? new Date(startAt).toISOString() : null,
                endAt: endAt ? new Date(endAt).toISOString() : null,
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
                status,
                questions
            };

            let saved: Assessment;
            if (editingAssessment?.id) {
                saved = await assessmentApi.updateAssessment(editingAssessment.id, payload);
            } else {
                saved = await assessmentApi.createAssessment(payload);
            }

            setSaveStatusText(status === 'published' ? 'Published ✓' : 'Saved ✓');
            onSaveSuccess(saved);
        } catch (err: any) {
            setError(err.message || 'Failed to save assessment');
        } finally {
            setIsSaving(false);
        }
    };

    const stepsList: { id: BuilderStep; num: string; label: string; meta?: string }[] = [
        { id: 'details', num: '01', label: 'Details', meta: `${duration}m · ${passingScore}% pass` },
        { id: 'questions', num: '02', label: 'Questions', meta: `${questions.length} · ${totalPoints} pts` },
        { id: 'access', num: '03', label: 'Access', meta: accessMode },
        { id: 'rules', num: '04', label: 'Rules', meta: 'Integrity & timer' },
        { id: 'review', num: '05', label: 'Review', meta: 'Verify & deploy' }
    ];

    const uniqueSections = Array.from(new Set(questions.map(q => q.category)));

    return (
        <div className="min-h-screen bg-[#070709] text-slate-200 flex flex-col font-sans select-none">
            {/* ── TOP HEADER BAR ──────────────────────────────────────────────── */}
            <header className="h-14 border-b border-[#181a24] bg-[#090a0f] px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-20">
                <div className="flex items-center gap-4 min-w-0">
                    <button
                        onClick={onBack}
                        className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-transparent hover:border-[#1f2232]"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Assessments
                    </button>
                    <div className="h-4 w-px bg-[#1f2232] hidden sm:block" />
                    <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                            {title || 'Untitled Assessment'}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[0.65rem] font-medium text-slate-400 bg-white/[0.03] border border-[#1f2232]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                            {saveStatusText}
                        </span>
                    </div>
                </div>

                {/* Top Action Buttons */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleSave('draft')}
                        className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors border border-[#1f2232]"
                    >
                        Save Draft
                    </button>
                    <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleSave('published')}
                        className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#AA8A2A] text-black font-black text-xs hover:brightness-110 shadow-md shadow-[#D4AF37]/20 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                        {isSaving ? 'Deploying...' : 'Publish Assessment'}
                    </button>
                </div>
            </header>

            {/* Error Banner */}
            {error && (
                <div className="bg-rose-500/10 border-b border-rose-500/30 px-6 py-2 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* ── MAIN STUDIO WORKSPACE LAYOUT ─────────────────────────────────── */}
            <div className="flex-1 flex overflow-hidden">
                {/* ── LEFT NAVIGATION SIDEBAR ─────────────────────────────────── */}
                <aside className="w-60 border-r border-[#181a24] bg-[#08090e] p-4 flex flex-col justify-between flex-shrink-0 hidden md:flex">
                    <div className="space-y-6">
                        <div>
                            <span className="text-[0.65rem] font-black uppercase tracking-widest text-slate-300 block mb-3 px-3">
                                BUILD STUDIO
                            </span>
                            <nav className="space-y-1">
                                {stepsList.map(step => {
                                    const isActive = currentStep === step.id;
                                    return (
                                        <button
                                            key={step.id}
                                            onClick={() => setCurrentStep(step.id)}
                                            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold flex items-center justify-between transition-all ${
                                                isActive
                                                    ? 'bg-[#141622] text-[#D4AF37] border border-[#282b3d] shadow-sm'
                                                    : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <span className={`font-mono text-[0.7rem] ${isActive ? 'text-[#D4AF37]' : 'text-slate-300'}`}>
                                                    {step.num}
                                                </span>
                                                <span>{step.label}</span>
                                            </div>
                                            {step.meta && (
                                                <span className="text-[0.65rem] text-slate-300 font-normal">
                                                    {step.meta}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Quick Specs summary */}
                        <div className="p-3.5 rounded-xl bg-[#0e1018] border border-[#181a24] space-y-2 text-[0.7rem]">
                            <div className="flex justify-between text-slate-400">
                                <span>Total Questions</span>
                                <strong className="text-white">{questions.length}</strong>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>Total Points</span>
                                <strong className="text-[#D4AF37]">{totalPoints} pts</strong>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>Duration</span>
                                <strong className="text-white">{duration} mins</strong>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>Passing Score</span>
                                <strong className="text-emerald-400">{passingScore}%</strong>
                            </div>
                        </div>
                    </div>

                    <div className="text-[0.7rem] text-slate-300 px-2 font-mono">
                        ALGOASCENT STUDIO v2.4
                    </div>
                </aside>

                {/* ── RIGHT CONFIGURATION WORKSPACE ───────────────────────────── */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-[#070709]">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* ── STEP 01: DETAILS ────────────────────────────────────────── */}
                        {currentStep === 'details' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">Build an assessment</h2>
                                    <p className="text-xs text-slate-400 mt-1">Configure the assessment before adding questions.</p>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <div>
                                        <label className="block text-[0.7rem] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                            Assessment Name *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Campus Placement 2026 — Software Engineer"
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-lg bg-[#0e1018] border border-[#1f2232] text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[0.7rem] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                            Description & Technical Scope
                                        </label>
                                        <textarea
                                            rows={2}
                                            placeholder="Comprehensive placement challenge evaluating DSA, Algorithmic Problem Solving, DBMS, and OS..."
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-lg bg-[#0e1018] border border-[#1f2232] text-white text-xs focus:border-[#D4AF37] focus:outline-none leading-relaxed"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[0.7rem] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                            Candidate Instructions
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={instructions}
                                            onChange={e => setInstructions(e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg bg-[#0e1018] border border-[#1f2232] text-white text-xs font-mono focus:border-[#D4AF37] focus:outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                        <div>
                                            <label className="block text-[0.7rem] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                                Duration (Minutes)
                                            </label>
                                            <input
                                                type="number"
                                                min={5}
                                                max={300}
                                                value={duration}
                                                onChange={e => setDuration(Number(e.target.value))}
                                                className="w-full px-3.5 py-2 rounded-lg bg-[#0e1018] border border-[#1f2232] text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[0.7rem] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                                Passing Score (%)
                                            </label>
                                            <input
                                                type="number"
                                                min={1}
                                                max={100}
                                                value={passingScore}
                                                onChange={e => setPassingScore(Number(e.target.value))}
                                                className="w-full px-3.5 py-2 rounded-lg bg-[#0e1018] border border-[#1f2232] text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[0.7rem] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                                Maximum Attempts
                                            </label>
                                            <input
                                                type="number"
                                                min={1}
                                                max={10}
                                                value={maxAttempts}
                                                onChange={e => setMaxAttempts(Number(e.target.value))}
                                                className="w-full px-3.5 py-2 rounded-lg bg-[#0e1018] border border-[#1f2232] text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[0.7rem] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                                Assessment Start Window (Optional)
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={startAt}
                                                onChange={e => setStartAt(e.target.value)}
                                                className="w-full px-3.5 py-2 rounded-lg bg-[#0e1018] border border-[#1f2232] text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[0.7rem] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                                Assessment Deadline (Optional)
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={endAt}
                                                onChange={e => setEndAt(e.target.value)}
                                                className="w-full px-3.5 py-2 rounded-lg bg-[#0e1018] border border-[#1f2232] text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep('questions')}
                                        className="px-5 py-2 rounded-lg bg-[#181a26] hover:bg-[#202334] text-white font-bold text-xs border border-[#282b3d] transition-colors"
                                    >
                                        Continue to Questions →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 02: QUESTIONS BUILDER (STRONGEST SCREEN) ───────────── */}
                        {currentStep === 'questions' && (
                            <div className="space-y-6 animate-fadeIn">
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#181a24]">
                                    <div>
                                        <h2 className="text-xl font-bold text-white tracking-tight">Questions</h2>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {questions.length} question{questions.length !== 1 ? 's' : ''} · <strong className="text-[#D4AF37]">{totalPoints} points</strong>
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsAIDrawerOpen(true)}
                                            className="px-3.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30 flex items-center gap-1.5 transition-colors"
                                        >
                                            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                            AI Question Assistant
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsQuestionBankOpen(true)}
                                            className="px-3.5 py-1.5 rounded-lg bg-[#141622] hover:bg-[#1a1d2c] text-slate-200 font-bold text-xs border border-[#272a3d] flex items-center gap-1.5 transition-colors"
                                        >
                                            <Flame className="w-3.5 h-3.5 text-orange-400" />
                                            LeetCode / Question Bank
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsAddPickerOpen(true)}
                                            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#AA8A2A] text-black font-black text-xs hover:brightness-110 flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> Add Question
                                        </button>
                                    </div>
                                </div>

                                {/* What would you like to add? Category Picker Modal */}
                                {isAddPickerOpen && (
                                    <div className="p-5 rounded-xl bg-[#0b0d14] border border-[#1f2232] space-y-4">
                                        <div className="flex items-center justify-between pb-2 border-b border-[#181a24]">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                                                What would you like to add?
                                            </h4>
                                            <button onClick={() => setIsAddPickerOpen(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                            {ADD_CATEGORIES.map(cat => {
                                                const Icon = cat.icon;
                                                return (
                                                    <div
                                                        key={cat.id}
                                                        onClick={() => handleCreateCategoryQuestion(cat.id)}
                                                        className="p-3 rounded-lg bg-[#0e1018] border border-[#181a24] hover:border-[#D4AF37]/50 hover:bg-[#131622] cursor-pointer transition-all flex items-start gap-2.5 group"
                                                    >
                                                        <div className="w-7 h-7 rounded bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-[#D4AF37] flex-shrink-0 mt-0.5">
                                                            <Icon className="w-4 h-4" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h5 className="text-xs font-bold text-white group-hover:text-[#D4AF37] transition-colors">{cat.label}</h5>
                                                            <p className="text-[0.65rem] text-slate-400 line-clamp-1">{cat.desc}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Inline Question Editor / Creator */}
                                {editingQuestionIndex !== null && (
                                    <div className="p-5 rounded-xl bg-[#0c0e16] border border-[#D4AF37]/30 space-y-4">
                                        <div className="flex items-center justify-between pb-2 border-b border-[#1f2232]">
                                            <span className="text-xs font-bold text-[#D4AF37] uppercase">
                                                {editingQuestionIndex >= 0 ? 'Edit Question' : `Create ${customCategory} Question`}
                                            </span>
                                            <button onClick={() => setEditingQuestionIndex(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="text-[0.65rem] font-bold uppercase text-slate-400 block mb-1">Type</label>
                                                <select
                                                    value={customType}
                                                    onChange={e => setCustomType(e.target.value as any)}
                                                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#070709] border border-[#1f2232] text-xs text-white"
                                                >
                                                    <option value="coding">Coding Problem</option>
                                                    <option value="mcq">Multiple Choice (MCQ)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[0.65rem] font-bold uppercase text-slate-400 block mb-1">Difficulty</label>
                                                <select
                                                    value={customDifficulty}
                                                    onChange={e => setCustomDifficulty(e.target.value as any)}
                                                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#070709] border border-[#1f2232] text-xs text-white"
                                                >
                                                    <option value="Easy">Easy</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="Hard">Hard</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[0.65rem] font-bold uppercase text-slate-400 block mb-1">Points</label>
                                                <input
                                                    type="number"
                                                    value={customPoints}
                                                    onChange={e => setCustomPoints(Number(e.target.value))}
                                                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#070709] border border-[#1f2232] text-xs text-white"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[0.65rem] font-bold uppercase text-slate-400 block mb-1">Problem Title</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Invert Binary Tree or SQL Group By Analysis"
                                                value={customTitle}
                                                onChange={e => setCustomTitle(e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg bg-[#070709] border border-[#1f2232] text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[0.65rem] font-bold uppercase text-slate-400 block mb-1">Description / Problem Statement</label>
                                            <textarea
                                                rows={3}
                                                placeholder="State the problem requirements, expected output, and constraints..."
                                                value={customDesc}
                                                onChange={e => setCustomDesc(e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg bg-[#070709] border border-[#1f2232] text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                                            />
                                        </div>

                                        {customType === 'mcq' && (
                                            <div className="space-y-2">
                                                <label className="text-[0.65rem] font-bold uppercase text-slate-400 block">Options & Correct Selection</label>
                                                {customOptions.map((opt, oIdx) => (
                                                    <div key={opt.id} className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            name="customOpt"
                                                            checked={customCorrect === opt.id}
                                                            onChange={() => setCustomCorrect(opt.id)}
                                                            className="accent-[#D4AF37]"
                                                        />
                                                        <span className="text-xs font-bold uppercase text-slate-400 w-4">{opt.id}</span>
                                                        <input
                                                            type="text"
                                                            placeholder={`Option ${opt.id.toUpperCase()}`}
                                                            value={opt.text}
                                                            onChange={e => {
                                                                const updated = [...customOptions];
                                                                updated[oIdx].text = e.target.value;
                                                                setCustomOptions(updated);
                                                            }}
                                                            className="flex-1 px-3 py-1.5 rounded-lg bg-[#070709] border border-[#1f2232] text-xs text-white"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex justify-end gap-2 pt-2 border-t border-[#1f2232]">
                                            <button
                                                type="button"
                                                onClick={() => setEditingQuestionIndex(null)}
                                                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSaveCustomQuestion}
                                                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#AA8A2A] text-black font-black text-xs hover:brightness-110"
                                            >
                                                Save Question
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Configured Questions List (Clean Row Items) */}
                                {questions.length === 0 ? (
                                    <div className="p-12 text-center border border-dashed border-[#1f2232] rounded-xl bg-[#090a0f]">
                                        <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                        <h4 className="text-sm font-bold text-white mb-1">No questions added yet</h4>
                                        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                                            Select from our 100+ LeetCode DSA problem dataset, AI Assistant, or add custom technical questions.
                                        </p>
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsQuestionBankOpen(true)}
                                                className="px-3.5 py-1.5 rounded-lg bg-[#141622] text-slate-200 text-xs font-bold border border-[#272a3d]"
                                            >
                                                Browse Question Bank
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsAIDrawerOpen(true)}
                                                className="px-3.5 py-1.5 rounded-lg bg-purple-500/10 text-purple-300 text-xs font-bold border border-purple-500/30"
                                            >
                                                Use AI Assistant
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {questions.map((q, idx) => {
                                            const isLeetCode = (q as any).source === 'LeetCode' || (q.tags && q.tags.includes('LeetCode'));
                                            return (
                                                <div
                                                    key={q.id || idx}
                                                    className="p-3.5 rounded-lg bg-[#0c0e16] border border-[#181a24] hover:border-[#272a3d] transition-all flex items-center justify-between gap-4 group"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <span className="font-mono text-xs text-slate-300 font-bold w-6">
                                                            {idx < 9 ? `0${idx + 1}` : idx + 1}
                                                        </span>

                                                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                                                            <span className="px-2 py-0.5 rounded text-[0.65rem] font-black uppercase tracking-wider bg-white/[0.04] text-slate-300 border border-white/5">
                                                                {q.category}
                                                            </span>

                                                            <span className={`px-2 py-0.5 rounded text-[0.65rem] font-bold uppercase ${
                                                                q.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-500/10'
                                                                    : q.difficulty === 'Medium' ? 'text-amber-400 bg-amber-500/10'
                                                                    : 'text-rose-400 bg-rose-500/10'
                                                            }`}>
                                                                {q.difficulty}
                                                            </span>

                                                            <span className="text-[0.65rem] font-bold text-[#D4AF37]">
                                                                {q.points || 10} pts
                                                            </span>

                                                            <span className="text-xs font-bold text-white truncate max-w-sm sm:max-w-md ml-1">
                                                                {q.title}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Row Actions */}
                                                    <div className="flex items-center gap-1 flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMoveQuestion(idx, 'up')}
                                                            disabled={idx === 0}
                                                            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20"
                                                        >
                                                            <ChevronUp className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMoveQuestion(idx, 'down')}
                                                            disabled={idx === questions.length - 1}
                                                            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20"
                                                        >
                                                            <ChevronDown className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDuplicateQuestion(q)}
                                                            className="p-1 rounded text-slate-400 hover:text-white"
                                                            title="Duplicate"
                                                        >
                                                            <Copy className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteQuestion(idx)}
                                                            className="p-1 rounded text-slate-500 hover:text-rose-400"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="pt-4 flex justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep('details')}
                                        className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-bold"
                                    >
                                        ← Back to Details
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep('access')}
                                        className="px-5 py-2 rounded-lg bg-[#181a26] hover:bg-[#202334] text-white font-bold text-xs border border-[#282b3d]"
                                    >
                                        Continue to Access →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 03: ACCESS ─────────────────────────────────────────── */}
                        {currentStep === 'access' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">Who can take this assessment?</h2>
                                    <p className="text-xs text-slate-400 mt-1">Configure candidate authorization and link distribution.</p>
                                </div>

                                <div className="space-y-4 pt-2">
                                    {/* Option 1: Authenticated Link */}
                                    <div
                                        onClick={() => setAccessMode('authenticated')}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                            accessMode === 'authenticated'
                                                ? 'bg-[#10121d] border-[#D4AF37]'
                                                : 'bg-[#0b0d14] border-[#181a24] hover:border-[#272a3d]'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-xs font-bold text-white flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-indigo-400" />
                                                AUTHENTICATED LINK
                                            </h4>
                                            <span className="text-[0.65rem] font-bold text-slate-300">Default</span>
                                        </div>
                                        <p className="text-xs text-slate-400 leading-relaxed">
                                            Any logged-in candidate with the link can participate. Results will link to their AlgoAscent profile.
                                        </p>
                                    </div>

                                    {/* Option 2: Private Assignment */}
                                    <div
                                        onClick={() => setAccessMode('private')}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                            accessMode === 'private'
                                                ? 'bg-[#10121d] border-[#D4AF37]'
                                                : 'bg-[#0b0d14] border-[#181a24] hover:border-[#272a3d]'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-xs font-bold text-white flex items-center gap-2">
                                                <Lock className="w-4 h-4 text-purple-400" />
                                                PRIVATE ASSIGNMENT
                                            </h4>
                                            <span className="text-[0.65rem] font-bold text-purple-300">Restricted</span>
                                        </div>
                                        <p className="text-xs text-slate-400 leading-relaxed">
                                            Strictly restricted to designated email addresses. Unassigned users cannot start the assessment.
                                        </p>
                                    </div>

                                    {/* Option 3: Public Link */}
                                    <div
                                        onClick={() => setAccessMode('public')}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                            accessMode === 'public'
                                                ? 'bg-[#10121d] border-[#D4AF37]'
                                                : 'bg-[#0b0d14] border-[#181a24] hover:border-[#272a3d]'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-xs font-bold text-white flex items-center gap-2">
                                                <Share2 className="w-4 h-4 text-emerald-400" />
                                                PUBLIC GUEST LINK
                                            </h4>
                                            <span className="text-[0.65rem] font-bold text-emerald-300">Open</span>
                                        </div>
                                        <p className="text-xs text-slate-400 leading-relaxed">
                                            Anyone with the URL can participate without logging in by entering their name and email.
                                        </p>
                                    </div>

                                    {/* Email Invite Box if Private */}
                                    {accessMode === 'private' && (
                                        <div className="p-4 rounded-xl bg-[#090a0f] border border-[#1f2232] space-y-3 pt-4">
                                            <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
                                                Assigned Candidate Emails ({assignedEmails.length})
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Enter candidate emails (separated by commas or spaces)..."
                                                    value={assignedEmailsInput}
                                                    onChange={e => setAssignedEmailsInput(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddEmail())}
                                                    className="flex-1 px-3.5 py-2 rounded-lg bg-[#0e1018] border border-[#1f2232] text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAddEmail}
                                                    className="px-4 py-2 rounded-lg bg-[#141622] text-white text-xs font-bold border border-[#272a3d]"
                                                >
                                                    Add
                                                </button>
                                            </div>

                                            {assignedEmails.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pt-1">
                                                    {assignedEmails.map(email => (
                                                        <span
                                                            key={email}
                                                            className="px-2.5 py-1 rounded-md bg-white/5 border border-[#1f2232] text-xs text-slate-300 flex items-center gap-1.5 font-mono text-[0.7rem]"
                                                        >
                                                            {email}
                                                            <button onClick={() => handleRemoveEmail(email)} className="text-slate-400 hover:text-white">✕</button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 flex justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep('questions')}
                                        className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-bold"
                                    >
                                        ← Back to Questions
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep('rules')}
                                        className="px-5 py-2 rounded-lg bg-[#181a26] hover:bg-[#202334] text-white font-bold text-xs border border-[#282b3d]"
                                    >
                                        Continue to Rules →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 04: RULES & INTEGRITY ──────────────────────────────── */}
                        {currentStep === 'rules' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">Assessment Rules & Integrity</h2>
                                    <p className="text-xs text-slate-400 mt-1">Configure anti-cheating, timer behavior, and test presentation.</p>
                                </div>

                                <div className="space-y-3 pt-2">
                                    {[
                                        {
                                            state: requireFullscreen,
                                            setter: setRequireFullscreen,
                                            title: 'Enforce Fullscreen Examination Mode',
                                            desc: 'Locks candidate in fullscreen view and flags fullscreen exits.'
                                        },
                                        {
                                            state: trackTabSwitches,
                                            setter: setTrackTabSwitches,
                                            title: 'Track Tab Switches & Window Blurs',
                                            desc: 'Monitors focus changes and generates an integrity event audit log.'
                                        },
                                        {
                                            state: randomizeQuestions,
                                            setter: setRandomizeQuestions,
                                            title: 'Randomize Questions Order',
                                            desc: 'Shuffles the question list uniquely for each candidate attempt.'
                                        },
                                        {
                                            state: randomizeOptions,
                                            setter: setRandomizeOptions,
                                            title: 'Randomize MCQ Options Order',
                                            desc: 'Permutes multiple-choice answer choices for every candidate.'
                                        },
                                        {
                                            state: showResultsImmediately,
                                            setter: setShowResultsImmediately,
                                            title: 'Show Scorecard Immediately on Submit',
                                            desc: 'If disabled, candidate sees submission confirmation while scores remain confidential.'
                                        },
                                        {
                                            state: negativeMarking,
                                            setter: setNegativeMarking,
                                            title: 'Enable Negative Marking for Wrong MCQs',
                                            desc: 'Deducts 25% points for incorrect objective choices.'
                                        }
                                    ].map((rule, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => rule.setter(!rule.state)}
                                            className="p-4 rounded-xl bg-[#0b0d14] border border-[#181a24] hover:border-[#272a3d] flex items-center justify-between cursor-pointer transition-colors"
                                        >
                                            <div className="pr-4">
                                                <h4 className="text-xs font-bold text-white">{rule.title}</h4>
                                                <p className="text-[0.7rem] text-slate-400 mt-0.5">{rule.desc}</p>
                                            </div>
                                            <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors flex-shrink-0 ${
                                                rule.state ? 'bg-[#D4AF37]' : 'bg-[#1f2232]'
                                            }`}>
                                                <div className={`w-3.5 h-3.5 rounded-full bg-black transition-transform ${
                                                    rule.state ? 'translate-x-3.5' : 'translate-x-0'
                                                }`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 flex justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep('access')}
                                        className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-bold"
                                    >
                                        ← Back to Access
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep('review')}
                                        className="px-5 py-2 rounded-lg bg-[#181a26] hover:bg-[#202334] text-white font-bold text-xs border border-[#282b3d]"
                                    >
                                        Review & Finalize →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 05: REVIEW ─────────────────────────────────────────── */}
                        {currentStep === 'review' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div>
                                    <span className="text-[0.65rem] font-black uppercase tracking-widest text-[#D4AF37] block mb-1">
                                        READY FOR DEPLOYMENT
                                    </span>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">{title || 'Untitled Assessment'}</h2>
                                    {description && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{description}</p>}
                                </div>

                                {/* Summary Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[#0b0d14] border border-[#181a24]">
                                    <div>
                                        <span className="text-[0.65rem] uppercase font-bold text-slate-300 block">Questions</span>
                                        <strong className="text-base text-white">{questions.length}</strong>
                                    </div>
                                    <div>
                                        <span className="text-[0.65rem] uppercase font-bold text-slate-300 block">Duration</span>
                                        <strong className="text-base text-white">{duration} Mins</strong>
                                    </div>
                                    <div>
                                        <span className="text-[0.65rem] uppercase font-bold text-slate-300 block">Total Points</span>
                                        <strong className="text-base text-[#D4AF37]">{totalPoints} Pts</strong>
                                    </div>
                                    <div>
                                        <span className="text-[0.65rem] uppercase font-bold text-slate-300 block">Passing Benchmark</span>
                                        <strong className="text-base text-emerald-400">{passingScore}%</strong>
                                    </div>
                                </div>

                                {/* Sections breakdown */}
                                {uniqueSections.length > 0 && (
                                    <div className="space-y-2">
                                        <span className="text-[0.7rem] uppercase font-bold text-slate-400 block tracking-wider">
                                            Evaluation Sections ({uniqueSections.length})
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                            {uniqueSections.map(sec => (
                                                <span
                                                    key={sec}
                                                    className="px-3 py-1 rounded-md bg-[#10121d] border border-[#1f2232] text-xs font-bold text-slate-300"
                                                >
                                                    {sec} ({questions.filter(q => q.category === sec).length})
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Access mode recap */}
                                <div className="p-4 rounded-xl bg-[#0b0d14] border border-[#181a24] space-y-1 text-xs text-slate-400">
                                    <div className="flex justify-between">
                                        <span>Access Mode</span>
                                        <strong className="text-white capitalize">{accessMode}</strong>
                                    </div>
                                    {accessMode === 'private' && (
                                        <div className="flex justify-between">
                                            <span>Authorized Candidates</span>
                                            <strong className="text-[#D4AF37]">{assignedEmails.length} Emails</strong>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 flex justify-between items-center border-t border-[#181a24]">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep('details')}
                                        className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-bold"
                                    >
                                        ← Back to Edit
                                    </button>

                                    <button
                                        type="button"
                                        disabled={isSaving}
                                        onClick={() => handleSave('published')}
                                        className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#AA8A2A] text-black font-black text-xs hover:brightness-110 shadow-lg shadow-[#D4AF37]/20 flex items-center gap-2 cursor-pointer transition-all"
                                    >
                                        {isSaving ? 'Deploying...' : '🚀 PUBLISH ASSESSMENT'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Central Question Bank Explorer Modal with LeetCode dataset */}
            <QuestionBankModal
                isOpen={isQuestionBankOpen}
                onClose={() => setIsQuestionBankOpen(false)}
                onSelectQuestion={handleAddQuestionFromBank}
                selectedQuestionIds={questions.map(q => q.id)}
            />

            {/* AI Question Assistant Side Panel */}
            <AIQuestionAssistantDrawer
                isOpen={isAIDrawerOpen}
                onClose={() => setIsAIDrawerOpen(false)}
                onAddQuestion={handleAddQuestionFromBank}
            />
        </div>
    );
};

export default AssessmentStudioBuilder;
