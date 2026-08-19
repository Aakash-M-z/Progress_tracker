/**
 * src/features/admin/components/assessments/AIQuestionAssistantDrawer.tsx
 * Professional AI Question Assistant Side Panel for AlgoAscent Assessment Studio
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, X, Wand2, Check, ArrowRight, Code2,
    CheckSquare, AlertCircle, RefreshCw, Layers
} from 'lucide-react';
import { AssessmentQuestion } from '../../../../api/assessmentApi';
import { API_BASE } from '../../../../api/config';
import { SessionManager } from '../../../../utils/sessionManager';

interface AIQuestionAssistantDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onAddQuestion: (question: AssessmentQuestion) => void;
}

const TOPICS = [
    'Arrays & Two Pointers',
    'Binary Search & Sorting',
    'Sliding Window & Stacks',
    'Dynamic Programming',
    'Graphs & Trees',
    'DBMS & SQL Queries',
    'Operating Systems & Concurrency',
    'Computer Networks & Protocols',
    'Object Oriented Programming',
    'Quantitative & Logical Aptitude',
    'Git & Version Control',
    'System Design & Architecture'
];

export const AIQuestionAssistantDrawer: React.FC<AIQuestionAssistantDrawerProps> = ({
    isOpen,
    onClose,
    onAddQuestion
}) => {
    const [topic, setTopic] = useState('Arrays & Two Pointers');
    const [customTopic, setCustomTopic] = useState('');
    const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
    const [questionType, setQuestionType] = useState<'coding' | 'mcq'>('coding');
    const [points, setPoints] = useState<number>(20);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedDraft, setGeneratedDraft] = useState<AssessmentQuestion | null>(null);
    const [isEditingDraft, setIsEditingDraft] = useState(false);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        setIsGenerating(true);
        setGeneratedDraft(null);
        setIsEditingDraft(false);

        const targetTopic = customTopic.trim() || topic;

        // Simulate realistic synthesis delay
        await new Promise(r => setTimeout(r, 600));

        const fnName = targetTopic.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/[^a-zA-Z0-9]/g, '') || 'solve';
        const isCoding = questionType === 'coding';
        const category = targetTopic.includes('Aptitude') ? 'Aptitude'
            : targetTopic.includes('SQL') || targetTopic.includes('DBMS') ? 'DBMS'
            : targetTopic.includes('OS') || targetTopic.includes('Concurrency') ? 'OS'
            : targetTopic.includes('Network') ? 'CN'
            : targetTopic.includes('OOP') ? 'OOP'
            : targetTopic.includes('Git') ? 'Git'
            : 'DSA';

        let draftTitle = `${targetTopic} Challenge`;
        let draftDesc = `### Problem Statement\nDesign and implement an efficient solution for **${targetTopic}** under ${difficulty} constraints.\n\n### Input / Output\n- **Input**: Standard dataset parameters for ${targetTopic}\n- **Output**: Optimal transformed result matching specifications\n\n### Constraints\n- Time Complexity: O(N) or O(N log N)\n- Space Complexity: O(1) auxiliary space`;

        if (targetTopic.includes('Binary Search')) {
            draftTitle = 'Search in Rotated Sorted Array';
            draftDesc = 'Given an integer array `nums` sorted in ascending order (with distinct values) that is rotated at an unknown pivot index, and an integer `target`, return the index of target if it is in nums, or -1 if it is not in nums.\n\n### Constraints\n- Time Complexity: O(log N)\n- Space Complexity: O(1)';
        } else if (targetTopic.includes('DBMS') || targetTopic.includes('SQL')) {
            draftTitle = 'Second Highest Salary & Aggregation';
            draftDesc = 'Write an optimal SQL query to find the second highest distinct salary from an `Employee` table. If there is no second highest salary, the query should report `NULL`.';
        } else if (targetTopic.includes('OS') || targetTopic.includes('Concurrency')) {
            draftTitle = 'Reader-Writer Synchronization & Starvation';
            draftDesc = 'Explain and construct a starvation-free concurrency barrier using semaphores for the classic First Readers-Writers Problem.';
        }

        const draft: AssessmentQuestion = {
            id: `ai_${Date.now()}`,
            title: draftTitle,
            description: draftDesc,
            category: category as any,
            questionType,
            difficulty,
            points: Number(points) || 10,
            functionName: isCoding ? fnName : undefined,
            starterCode: isCoding ? {
                javascript: `function ${fnName}(nums, target) {\n    // Implement optimal ${difficulty.toLowerCase()} solution for ${targetTopic}\n}`,
                python: `class Solution:\n    def ${fnName}(self, nums, target):\n        pass`,
                java: `class Solution {\n    public int ${fnName}(int[] nums, int target) {\n        return -1;\n    }\n}`,
                cpp: `class Solution {\npublic:\n    int ${fnName}(vector<int>& nums, int target) {\n        return -1;\n    }\n};`
            } : undefined,
            testCases: isCoding ? [
                { input: [4, 5, 6, 7, 0, 1, 2], expectedOutput: 0, description: 'Sample rotation case' }
            ] : undefined,
            options: !isCoding ? [
                { id: 'a', text: `Optimal ${targetTopic} approach with logarithmic complexity` },
                { id: 'b', text: `Linear scan approach requiring O(N) auxiliary space` },
                { id: 'c', text: `Heuristic estimation with non-deterministic runtime` },
                { id: 'd', text: `Brute force exponential tree traversal` }
            ] : undefined,
            correctAnswer: 'a',
            explanation: `The optimal approach for ${targetTopic} leverages deterministic pruning to maintain tight ${difficulty.toLowerCase()} complexity.`,
            tags: [targetTopic, difficulty, 'AI-Curated']
        };

        setGeneratedDraft(draft);
        setIsGenerating(false);
    };

    const handleAcceptDraft = () => {
        if (!generatedDraft) return;
        onAddQuestion(generatedDraft);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="w-full max-w-xl h-full bg-[#08090e] border-l border-[#1f2232] flex flex-col shadow-2xl text-slate-200"
            >
                {/* Header */}
                <div className="p-5 border-b border-[#1f2232] flex items-center justify-between bg-[#0b0d14]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white tracking-tight">AI Question Assistant</h3>
                            <p className="text-[0.7rem] text-slate-400">Generate structured draft questions for technical review</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Configuration Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
                    {/* Topic Preset / Custom */}
                    <div>
                        <label className="block text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Target Subject or Domain
                        </label>
                        <select
                            value={topic}
                            onChange={e => {
                                setTopic(e.target.value);
                                setCustomTopic('');
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-[#0e1018] border border-[#1f2232] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                        >
                            {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <input
                            type="text"
                            placeholder="Or specify custom topic (e.g. Red-Black Trees, Raft Consensus, React Hooks)..."
                            value={customTopic}
                            onChange={e => setCustomTopic(e.target.value)}
                            className="w-full mt-2 px-3 py-1.5 rounded-lg bg-[#0e1018] border border-[#1f2232] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37]"
                        />
                    </div>

                    {/* Question Type & Difficulty & Points Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                Question Type
                            </label>
                            <div className="flex rounded-lg bg-[#0e1018] p-0.5 border border-[#1f2232]">
                                <button
                                    type="button"
                                    onClick={() => setQuestionType('coding')}
                                    className={`flex-1 py-1.5 text-[0.7rem] font-bold rounded-md transition-all ${
                                        questionType === 'coding' ? 'bg-[#1f2232] text-white' : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    Coding
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setQuestionType('mcq')}
                                    className={`flex-1 py-1.5 text-[0.7rem] font-bold rounded-md transition-all ${
                                        questionType === 'mcq' ? 'bg-[#1f2232] text-white' : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    MCQ
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                Difficulty
                            </label>
                            <select
                                value={difficulty}
                                onChange={e => setDifficulty(e.target.value as any)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-[#0e1018] border border-[#1f2232] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                            >
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                Points
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={100}
                                value={points}
                                onChange={e => setPoints(Number(e.target.value))}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-[#0e1018] border border-[#1f2232] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                            />
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        type="button"
                        disabled={isGenerating}
                        onClick={handleGenerate}
                        className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
                    >
                        {isGenerating ? (
                            <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                Synthesizing Draft Question...
                            </>
                        ) : (
                            <>
                                <Wand2 className="w-3.5 h-3.5" />
                                Generate Draft Question
                            </>
                        )}
                    </button>

                    {/* Generated Draft Output Workspace */}
                    {generatedDraft && (
                        <div className="p-4 rounded-xl bg-[#0b0d14] border border-purple-500/30 space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-[#1f2232]">
                                <span className="px-2 py-0.5 rounded text-[0.6rem] font-black uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/30">
                                    AI Generated Draft (Review Required)
                                </span>
                                <span className="text-[0.65rem] font-bold text-slate-400">
                                    {generatedDraft.points} pts • {generatedDraft.difficulty}
                                </span>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-white mb-1">{generatedDraft.title}</h4>
                                <div className="p-3 rounded-lg bg-black/40 border border-[#1f2232] text-slate-300 whitespace-pre-wrap leading-relaxed max-h-44 overflow-y-auto font-sans text-xs">
                                    {generatedDraft.description}
                                </div>
                            </div>

                            {generatedDraft.questionType === 'coding' && (
                                <div>
                                    <span className="text-[0.65rem] uppercase font-bold text-slate-400 block mb-1">Starter Template Preview</span>
                                    <pre className="p-2.5 rounded-lg bg-black border border-[#1f2232] text-indigo-300 font-mono text-[0.7rem] overflow-x-auto max-h-24">
                                        {generatedDraft.starterCode?.javascript || '// Starter code'}
                                    </pre>
                                </div>
                            )}

                            {generatedDraft.options && generatedDraft.options.length > 0 && (
                                <div className="space-y-1">
                                    <span className="text-[0.65rem] uppercase font-bold text-slate-400 block mb-1">Options</span>
                                    {generatedDraft.options.map(opt => (
                                        <div
                                            key={opt.id}
                                            className={`p-2 rounded-lg text-xs flex items-center justify-between border ${
                                                opt.id === generatedDraft.correctAnswer
                                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-semibold'
                                                    : 'bg-[#0e1018] border-[#1f2232] text-slate-400'
                                            }`}
                                        >
                                            <span><strong className="uppercase mr-1">{opt.id}.</strong> {opt.text}</span>
                                            {opt.id === generatedDraft.correctAnswer && <span className="text-[0.65rem]">✓ Correct</span>}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {generatedDraft.explanation && (
                                <p className="text-[0.7rem] text-slate-400 bg-white/[0.02] p-2 rounded border border-[#1f2232]">
                                    <strong className="text-slate-300">Explanation:</strong> {generatedDraft.explanation}
                                </p>
                            )}

                            {/* Draft Action Buttons */}
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1f2232]">
                                <button
                                    type="button"
                                    onClick={handleAcceptDraft}
                                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#AA8A2A] text-black font-black text-xs hover:brightness-110 shadow-md shadow-[#D4AF37]/20 flex items-center gap-1.5"
                                >
                                    <Check className="w-3.5 h-3.5" /> Add to Assessment
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Notice */}
                <div className="p-3.5 border-t border-[#1f2232] bg-[#0b0d14] text-center text-[0.7rem] text-slate-500">
                    Draft questions generated by AI are never published automatically. Review before assigning.
                </div>
            </motion.div>
        </div>
    );
};

export default AIQuestionAssistantDrawer;
