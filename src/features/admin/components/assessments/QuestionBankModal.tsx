/**
 * src/features/admin/components/assessments/QuestionBankModal.tsx
 * Central Question Bank Explorer with LeetCode Problem Dataset Integration
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Plus, Check, Filter, Code2, CheckSquare, Layers,
    X, Sparkles, Terminal, Flame, BookOpen, Tag
} from 'lucide-react';
import { assessmentApi, AssessmentQuestion } from '../../../../api/assessmentApi';

interface QuestionBankModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectQuestion: (question: AssessmentQuestion) => void;
    selectedQuestionIds: string[];
}

const LEETCODE_TOPICS = [
    'All', 'Arrays', 'Two Pointers', 'Sliding Window', 'Stacks', 'Binary Search',
    'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Heaps', 'Backtracking',
    'Design', 'Greedy', 'Bit Manipulation', 'Math', 'Intervals', 'Strings', 'Trie'
];

const CATEGORIES = [
    'All', 'DSA', 'Coding', 'Aptitude', 'Logical Reasoning', 'Quantitative Ability',
    'OOP', 'DBMS', 'SQL', 'OS', 'CN', 'Git', 'Technical'
];

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

const QuestionBankModal: React.FC<QuestionBankModalProps> = ({
    isOpen,
    onClose,
    onSelectQuestion,
    selectedQuestionIds
}) => {
    const [sourceTab, setSourceTab] = useState<'leetcode' | 'core' | 'all'>('leetcode');
    const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedTopic, setSelectedTopic] = useState('All');
    const [selectedDifficulty, setSelectedDifficulty] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [previewQuestion, setPreviewQuestion] = useState<AssessmentQuestion | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        const fetchQuestions = async () => {
            setIsLoading(true);
            try {
                const res = await assessmentApi.getQuestionBank({
                    source: sourceTab,
                    category: sourceTab === 'core' ? (selectedCategory !== 'All' ? selectedCategory : undefined) : undefined,
                    topic: sourceTab === 'leetcode' ? (selectedTopic !== 'All' ? selectedTopic : undefined) : undefined,
                    difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : undefined,
                    search: searchQuery || undefined
                });
                setQuestions(res.questions || []);
            } catch (err) {
                console.error('Failed to load question bank:', err);
            } finally {
                setIsLoading(false);
            }
        };

        const debounceTimer = setTimeout(fetchQuestions, 200);
        return () => clearTimeout(debounceTimer);
    }, [isOpen, sourceTab, selectedCategory, selectedTopic, selectedDifficulty, searchQuery]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-6xl h-[88vh] bg-[#0c0d16] border border-indigo-500/20 rounded-2xl flex flex-col overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#AA8A2A] flex items-center justify-center text-black font-black text-lg shadow-lg shadow-[#D4AF37]/20">
                            ◈
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white flex items-center gap-2">
                                AlgoAscent Question Bank Repository
                            </h3>
                            <p className="text-xs text-slate-400">
                                Curate questions from LeetCode curated DSA problems, Aptitude, Core CS, and Engineering MCQs.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Main Source Tabs: LeetCode vs Core Engineering */}
                <div className="px-6 py-2.5 border-b border-white/[0.08] bg-black/40 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                setSourceTab('leetcode');
                                setSelectedTopic('All');
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
                                sourceTab === 'leetcode'
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/20'
                                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <Flame className="w-4 h-4 text-yellow-300" />
                            LeetCode Problem Dataset (100+ Curated DSA)
                        </button>

                        <button
                            onClick={() => {
                                setSourceTab('core');
                                setSelectedCategory('All');
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
                                sourceTab === 'core'
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <BookOpen className="w-4 h-4 text-indigo-300" />
                            Core CS & Aptitude MCQs
                        </button>

                        <button
                            onClick={() => setSourceTab('all')}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                                sourceTab === 'all'
                                    ? 'bg-white/15 text-white'
                                    : 'bg-white/5 text-slate-400 hover:text-white'
                            }`}
                        >
                            All Pool
                        </button>
                    </div>

                    <div className="text-xs font-bold text-slate-400">
                        Showing <strong className="text-white">{questions.length}</strong> available questions
                    </div>
                </div>

                {/* Filters & Search Bar */}
                <div className="p-4 border-b border-white/[0.06] bg-[#090a10] flex flex-wrap items-center justify-between gap-3">
                    <div className="relative flex-1 min-w-[240px]">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder={sourceTab === 'leetcode' ? "Search LeetCode problem title, number (#1, #15), topic or tag..." : "Search questions by topic, keyword, or title..."}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#141624] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
                        />
                    </div>

                    {/* LeetCode Topic Scrollbar OR Category Scrollbar */}
                    <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
                        {sourceTab === 'leetcode' ? (
                            LEETCODE_TOPICS.map(topic => (
                                <button
                                    key={topic}
                                    onClick={() => setSelectedTopic(topic)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                                        selectedTopic === topic
                                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                                            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    {topic}
                                </button>
                            ))
                        ) : (
                            CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                                        selectedCategory === cat
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))
                        )}
                    </div>

                    {/* Difficulty select */}
                    <div className="flex items-center gap-1">
                        {DIFFICULTIES.map(diff => (
                            <button
                                key={diff}
                                onClick={() => setSelectedDifficulty(diff)}
                                className={`px-2.5 py-1 rounded-md text-[0.7rem] font-bold uppercase tracking-wider transition-all ${
                                    selectedDifficulty === diff
                                        ? diff === 'Easy' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                            : diff === 'Medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                            : diff === 'Hard' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                            : 'bg-indigo-600 text-white'
                                        : 'bg-white/5 text-slate-400 hover:text-white'
                                }`}
                            >
                                {diff}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-hidden flex">
                    {/* Questions List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {isLoading ? (
                            <div className="py-16 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
                                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                Loading question repository...
                            </div>
                        ) : questions.length === 0 ? (
                            <div className="py-16 text-center text-slate-500 text-sm">
                                No questions found matching your filter criteria.
                            </div>
                        ) : (
                            questions.map(q => {
                                const qId = q.id || q.questionId || (q as any)._id;
                                const isSelected = selectedQuestionIds.includes(qId);
                                const isLeetCode = (q as any).source === 'LeetCode' || (q.tags && q.tags.includes('LeetCode'));

                                return (
                                    <div
                                        key={qId}
                                        onClick={() => setPreviewQuestion(q)}
                                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                                            previewQuestion?.title === q.title
                                                ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-500/10'
                                                : 'bg-white/[0.02] border-white/[0.07] hover:border-white/20 hover:bg-white/[0.04]'
                                        }`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                {isLeetCode ? (
                                                    <span className="px-2 py-0.5 rounded text-[0.65rem] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                                        <Flame className="w-3 h-3 text-orange-400" /> LeetCode
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded text-[0.65rem] font-black uppercase tracking-wider bg-white/10 text-slate-300">
                                                        {q.category}
                                                    </span>
                                                )}

                                                <span className={`px-2 py-0.5 rounded text-[0.65rem] font-black uppercase tracking-wider ${
                                                    q.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-500/10'
                                                        : q.difficulty === 'Medium' ? 'text-amber-400 bg-amber-500/10'
                                                        : 'text-rose-400 bg-rose-500/10'
                                                }`}>
                                                    {q.difficulty}
                                                </span>

                                                <span className="text-[0.65rem] text-slate-400 flex items-center gap-1 font-semibold">
                                                    {q.questionType === 'coding' ? <Code2 className="w-3 h-3 text-indigo-400" /> : <CheckSquare className="w-3 h-3 text-purple-400" />}
                                                    {q.questionType.toUpperCase()}
                                                </span>

                                                <span className="text-[0.65rem] font-bold text-amber-400 ml-auto">
                                                    {q.points || 10} Points
                                                </span>
                                            </div>

                                            <h4 className="text-sm font-bold text-white mb-1 truncate">{q.title}</h4>
                                            <p className="text-xs text-slate-400 line-clamp-2">{q.description}</p>

                                            {/* Tags preview */}
                                            {q.tags && q.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {q.tags.slice(0, 4).map((tag, tIdx) => (
                                                        <span key={tIdx} className="px-2 py-0.5 rounded text-[0.6rem] bg-white/5 text-slate-400">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectQuestion(q);
                                            }}
                                            disabled={isSelected}
                                            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 flex-shrink-0 transition-all ${
                                                isSelected
                                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                                                    : isLeetCode
                                                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA8A2A] text-black font-black hover:brightness-110 shadow-lg shadow-[#D4AF37]/20'
                                                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                                            }`}
                                        >
                                            {isSelected ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5" /> Added
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="w-3.5 h-3.5" /> Add to Test
                                                </>
                                            )}
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Question Preview Drawer */}
                    {previewQuestion && (
                        <div className="w-96 border-l border-white/[0.08] bg-[#090a10] p-5 overflow-y-auto hidden md:block">
                            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
                                <h5 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                                    Question Details
                                </h5>
                                <button
                                    onClick={() => setPreviewQuestion(null)}
                                    className="text-slate-500 hover:text-white text-xs"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-[0.65rem] font-black uppercase ${
                                            previewQuestion.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-500/10'
                                                : previewQuestion.difficulty === 'Medium' ? 'text-amber-400 bg-amber-500/10'
                                                : 'text-rose-400 bg-rose-500/10'
                                        }`}>
                                            {previewQuestion.difficulty}
                                        </span>
                                        <span className="text-xs font-bold text-amber-400">{previewQuestion.points} Pts</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-white mb-2">{previewQuestion.title}</h4>
                                    <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto p-2 rounded-lg bg-black/40 border border-white/5">
                                        {previewQuestion.description}
                                    </div>
                                </div>

                                {previewQuestion.questionType === 'coding' && previewQuestion.starterCode && (
                                    <div>
                                        <label className="text-[0.65rem] uppercase font-bold text-indigo-400 mb-1.5 flex items-center gap-1">
                                            <Code2 className="w-3 h-3" /> JavaScript Starter Code
                                        </label>
                                        <pre className="p-3 rounded-xl bg-black border border-white/10 text-indigo-300 font-mono text-[0.7rem] overflow-x-auto max-h-36">
                                            {previewQuestion.starterCode.javascript || '// No starter code'}
                                        </pre>
                                    </div>
                                )}

                                {previewQuestion.options && previewQuestion.options.length > 0 && (
                                    <div>
                                        <label className="text-[0.65rem] uppercase font-bold text-slate-400 mb-1.5 block">Options</label>
                                        <div className="space-y-1.5">
                                            {previewQuestion.options.map(opt => (
                                                <div
                                                    key={opt.id}
                                                    className={`p-2 rounded-lg text-xs font-medium border ${
                                                        opt.id === previewQuestion.correctAnswer
                                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                                            : 'bg-white/[0.02] border-white/5 text-slate-400'
                                                    }`}
                                                >
                                                    <strong className="uppercase mr-1">{opt.id}.</strong> {opt.text}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {previewQuestion.testCases && previewQuestion.testCases.length > 0 && (
                                    <div>
                                        <label className="text-[0.65rem] uppercase font-bold text-slate-400 mb-1 block">Sample Test Cases</label>
                                        <div className="text-[0.7rem] bg-black/50 p-2.5 rounded-lg text-slate-300 font-mono space-y-1">
                                            {previewQuestion.testCases.map((tc, idx) => (
                                                <div key={idx}>
                                                    <div><strong>In:</strong> {JSON.stringify(tc.input)}</div>
                                                    <div><strong>Out:</strong> {JSON.stringify(tc.expectedOutput)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                        {selectedQuestionIds.length} question{selectedQuestionIds.length !== 1 ? 's' : ''} in your current assessment.
                    </span>
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8A2A] text-black font-bold text-xs hover:brightness-110 shadow-lg shadow-[#D4AF37]/20"
                    >
                        Done Selecting
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default QuestionBankModal;
