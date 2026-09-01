/**
 * src/features/assessment/AssessmentTakingSession.tsx
 * Production-Grade Candidate Assessment Environment with Monaco Editor & Multi-Case Test Runner
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, Bookmark, Play, Send, ChevronRight, ChevronLeft,
    RotateCcw, AlertTriangle, Code2, Maximize2, Minimize2,
    CheckCircle2, ChevronUp, ChevronDown, ListChecks, Terminal
} from 'lucide-react';
import { assessmentApi, AssessmentQuestion } from '../../api/assessmentApi';

const LANGUAGES = [
    { id: 'javascript', name: 'JavaScript', monaco: 'javascript' },
    { id: 'python', name: 'Python 3', monaco: 'python' },
    { id: 'java', name: 'Java', monaco: 'java' },
    { id: 'cpp', name: 'C++', monaco: 'cpp' },
];

const AssessmentTakingSession: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    // Session Data
    const [attemptId, setAttemptId] = useState<string>('');
    const [assessmentTitle, setAssessmentTitle] = useState('');
    const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
    const [settings, setSettings] = useState<any>({});
    const [expiresAt, setExpiresAt] = useState<Date | null>(null);

    // Current Navigation State
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [codingSubmissions, setCodingSubmissions] = useState<Record<string, { code: string; language: string }>>({});
    const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});

    // Coding Workspace State
    const [selectedLanguage, setSelectedLanguage] = useState<string>('javascript');
    const [activeTestCaseIndex, setActiveTestCaseIndex] = useState<number>(0);
    const [customInput, setCustomInput] = useState<string>('');
    const [isCustomTest, setIsCustomTest] = useState<boolean>(false);
    const [codeOutput, setCodeOutput] = useState<{ status?: string; stdout?: string; stderr?: string; results?: any[]; passed?: boolean; totalTests?: number; passedTests?: number; timeMs?: number } | null>(null);
    const [isRunningCode, setIsRunningCode] = useState(false);
    const [bottomDrawerTab, setBottomDrawerTab] = useState<'testcases' | 'results' | 'console'>('testcases');
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);

    // UI & Status
    const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(3600);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [integrityWarning, setIntegrityWarning] = useState<string | null>(null);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── 1. Initialize Assessment Session ───────────────────────────────────────
    useEffect(() => {
        if (!token) return;

        const storedRaw = sessionStorage.getItem(`assessment_attempt_${token}`);
        if (!storedRaw) {
            assessmentApi.startAssessment(token).then(data => {
                initializeSession(data);
            }).catch(() => {
                navigate(`/assessment/${token}`);
            });
            return;
        }

        try {
            const parsed = JSON.parse(storedRaw);
            initializeSession(parsed);
        } catch {
            navigate(`/assessment/${token}`);
        }
    }, [token]);

    const initializeSession = (data: any) => {
        if (!data) return;
        const attempt = data.attempt || data;
        const aid = data.attemptId || attempt?.id || attempt?._id || `att_${Date.now()}`;
        setAttemptId(aid);
        setAssessmentTitle(data.assessmentTitle || attempt?.assessmentTitle || 'Technical Assessment');
        setQuestions(data.questions || attempt?.questions || []);
        setSettings(data.settings || attempt?.settings || {});

        const rawExpiry = data.expiresAt || attempt?.expiresAt || (Date.now() + 3600000);
        const expDate = new Date(rawExpiry);
        setExpiresAt(isNaN(expDate.getTime()) ? new Date(Date.now() + 3600000) : expDate);

        const loadedAns: Record<string, any> = {};
        const savedAns = data.savedAnswers || attempt?.answers;
        if (savedAns) {
            for (const [k, v] of Object.entries(savedAns)) {
                loadedAns[k] = typeof v === 'object' && v !== null && 'value' in v ? (v as any).value : v;
            }
        }
        setAnswers(loadedAns);

        const savedCoding = data.savedCodingSubmissions || attempt?.codingSubmissions;
        if (savedCoding) {
            setCodingSubmissions(savedCoding);
        }
    };

    const currentQuestion: AssessmentQuestion | undefined = questions[currentIndex];
    const currentQId = currentQuestion ? (currentQuestion.id || (currentQuestion as any)._id) : '';

    // ── 2. Authoritative Timer Countdown ───────────────────────────────────────
    useEffect(() => {
        if (!expiresAt) return;
        const timer = setInterval(() => {
            const now = Date.now();
            const diff = Math.max(0, Math.floor((expiresAt.getTime() - now) / 1000));
            setTimeLeftSeconds(diff);
            if (diff === 0) {
                clearInterval(timer);
                handleFinalSubmit();
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [expiresAt]);

    const formatTimer = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // ── 3. Anti-Cheating & Integrity Listener ──────────────────────────────────
    useEffect(() => {
        if (!attemptId) return;
        const handleVisibilityChange = () => { if (document.hidden) triggerIntegrityAlert('TAB_SWITCH', 'Candidate switched browser tabs or minimized window.'); };
        const handleBlur = () => { triggerIntegrityAlert('WINDOW_BLUR', 'Candidate clicked outside the assessment window.'); };
        const handleFullscreenChange = () => {
            const inFull = !!document.fullscreenElement;
            setIsFullscreen(inFull);
            if (!inFull && settings.requireFullscreen) triggerIntegrityAlert('FULLSCREEN_EXIT', 'Candidate exited fullscreen mode.');
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [attemptId, settings]);

    const triggerIntegrityAlert = (type: string, details: string) => {
        setIntegrityWarning(`Notice: ${type.replace(/_/g, ' ')} detected and logged.`);
        setTimeout(() => setIntegrityWarning(null), 4000);
        assessmentApi.recordIntegrityEvent(attemptId, {
            type,
            details: { reason: details, timestamp: new Date().toISOString() }
        });
    };

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen().catch(() => {});
        } else {
            await document.exitFullscreen().catch(() => {});
        }
    };

    // ── 4. Real-Time Auto-Save Handler ─────────────────────────────────────────
    const triggerAutoSave = useCallback((qId: string, val?: any, codingSub?: any) => {
        if (!attemptId || !qId) return;
        setSaveStatus('saving');
        assessmentApi.autoSaveAnswer(attemptId, { questionId: qId, value: val, codingSubmission: codingSub })
            .then(() => setSaveStatus('saved'))
            .catch(() => setSaveStatus('error'));
    }, [attemptId]);

    const handleSelectOption = (optionId: string) => {
        setAnswers(prev => {
            const next = { ...prev, [currentQId]: optionId };
            triggerAutoSave(currentQId, optionId);
            return next;
        });
    };

    const handleCodeChange = (newCode: string | undefined) => {
        const codeVal = newCode || '';
        const submission = { code: codeVal, language: selectedLanguage };
        setCodingSubmissions(prev => {
            const next = { ...prev, [currentQId]: submission };
            triggerAutoSave(currentQId, undefined, submission);
            return next;
        });
    };

    const currentCode = useMemo(() => {
        if (!currentQuestion || currentQuestion.questionType !== 'coding') return '';
        const existing = codingSubmissions[currentQId];
        if (existing && existing.code) return existing.code;
        const starters = currentQuestion.starterCode || {};
        if (starters[selectedLanguage]) return starters[selectedLanguage];
        const fn = (currentQuestion as any).functionName || (currentQuestion.title ? currentQuestion.title.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_: any, chr: string) => chr.toUpperCase()).replace(/[^a-zA-Z0-9]/g, '') : 'solution') || 'solution';
        if (selectedLanguage === 'python') return `class Solution:\n    def ${fn}(self, *args):\n        # Write your solution here\n        pass\n`;
        if (selectedLanguage === 'java') return `class Solution {\n    public Object ${fn}(Object... args) {\n        // Write your solution here\n        return null;\n    }\n}`;
        if (selectedLanguage === 'cpp') return `#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    void ${fn}() {\n        // Write your solution here\n    }\n};`;
        return `/**\n * @param {any} input\n * @return {any}\n */\nfunction ${fn}(...args) {\n    // Write your solution here\n    \n}`;
    }, [currentQuestion, currentQId, codingSubmissions, selectedLanguage]);

    const handleResetCode = () => {
        if (!currentQuestion) return;
        const starters = currentQuestion.starterCode || {};
        if (starters[selectedLanguage]) {
            handleCodeChange(starters[selectedLanguage]);
            return;
        }
        const fn = (currentQuestion as any).functionName || (currentQuestion.title ? currentQuestion.title.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_: any, chr: string) => chr.toUpperCase()).replace(/[^a-zA-Z0-9]/g, '') : 'solution') || 'solution';
        if (selectedLanguage === 'python') handleCodeChange(`class Solution:\n    def ${fn}(self, *args):\n        # Write your solution here\n        pass\n`);
        else if (selectedLanguage === 'java') handleCodeChange(`class Solution {\n    public Object ${fn}(Object... args) {\n        // Write your solution here\n        return null;\n    }\n}`);
        else if (selectedLanguage === 'cpp') handleCodeChange(`#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    void ${fn}() {\n        // Write your solution here\n    }\n};`);
        else handleCodeChange(`function ${fn}(...args) {\n    // Write your solution here\n    \n}`);
    };

    // ── 5. Run Sample Code (Visible Test Cases) ────────────────────────────────
    const handleRunSampleCode = async () => {
        if (!attemptId || !currentQuestion) return;
        setIsRunningCode(true);
        setIsDrawerOpen(true);
        setBottomDrawerTab('results');
        try {
            const res = await assessmentApi.runCode(attemptId, {
                questionId: currentQId,
                code: currentCode,
                language: selectedLanguage,
                customInput: isCustomTest ? customInput : undefined
            });
            setCodeOutput(res);
        } catch (err: any) {
            setCodeOutput({ status: 'Runtime Error', stderr: err.message || 'Execution failed' });
        } finally {
            setIsRunningCode(false);
        }
    };

    // ── 6. Final Assessment Submission ─────────────────────────────────────────
    const handleFinalSubmit = async () => {
        if (!attemptId) return;
        setIsSubmitting(true);
        try {
            const res = await assessmentApi.submitAssessment(attemptId, {
                finalAnswers: answers,
                finalCodingSubmissions: codingSubmissions
            });
            sessionStorage.removeItem(`assessment_attempt_${token}`);
            navigate(`/assessment/${token}/result`, {
                state: { attemptId, report: res.attempt || res.report }
            });
        } catch (err: any) {
            alert(err.message || 'Submission failed. Please try again.');
            setIsSubmitting(false);
        }
    };

    const answeredCount = useMemo(() => {
        let count = 0;
        questions.forEach(q => {
            const qId = q.id || (q as any)._id;
            if (q.questionType === 'coding') {
                if (codingSubmissions[qId]?.code?.trim().length > 10) count++;
            } else {
                if (answers[qId] !== undefined && answers[qId] !== null && answers[qId] !== '') count++;
            }
        });
        return count;
    }, [questions, answers, codingSubmissions]);

    const unansweredCount = Math.max(0, questions.length - answeredCount);

    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-[#07070a] text-white flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 border-2 border-[#FF3B1F] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading exam hall...</span>
            </div>
        );
    }

    const testCases = currentQuestion?.testCases && currentQuestion.testCases.length > 0 ? currentQuestion.testCases : [
        { input: [[2, 7, 11, 15], 9], expectedOutput: [0, 1], description: 'Default case 1' }
    ];

    return (
        <div className="min-h-screen h-screen bg-[#070709] text-slate-200 flex flex-col overflow-hidden font-sans select-none">
            <header className="h-14 border-b border-[#181a24] bg-[#090a0f] px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-20">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF3B1F] to-[#AA8A2A] flex items-center justify-center text-black font-black text-sm shadow-md">◈</div>
                    <div className="min-w-0">
                        <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">{assessmentTitle}</h1>
                        <span className="text-[0.65rem] text-slate-400 flex items-center gap-1.5">
                            Category: <strong className="text-[#FF3B1F]">{currentQuestion?.category}</strong>
                            <span className="text-slate-600">•</span>
                            <span className={saveStatus === 'saving' ? 'text-amber-400' : 'text-emerald-400'}>
                                {saveStatus === 'saving' ? '● Syncing...' : '✓ Persisted'}
                            </span>
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#0e1018] border border-[#1f2232] shadow-inner">
                    <Clock className={`w-4 h-4 ${timeLeftSeconds < 300 ? 'text-rose-400 animate-pulse' : 'text-[#FF3B1F]'}`} />
                    <span className={`text-sm sm:text-base font-black font-mono tracking-wider ${timeLeftSeconds < 300 ? 'text-rose-400 font-bold' : 'text-white'}`}>
                        {formatTimer(timeLeftSeconds)}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={toggleFullscreen} title="Toggle Fullscreen" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer hidden sm:block">
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setIsSubmitModalOpen(true)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF3B1F] to-[#AA8A2A] text-black font-black text-xs hover:brightness-110 shadow-lg shadow-[#FF3B1F]/20 flex items-center gap-1.5 transition-all cursor-pointer">
                        <Send className="w-3.5 h-3.5" /> Submit Assessment
                    </button>
                </div>
            </header>

            <AnimatePresence>
                {integrityWarning && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-2xl flex items-center gap-2 backdrop-blur-md">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{integrityWarning}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-1 flex overflow-hidden">
                <aside className="w-60 border-r border-[#181a24] bg-[#07070a] p-4 flex flex-col justify-between hidden md:flex flex-shrink-0">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2.5 border-b border-[#181a24]">
                            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Questions</h3>
                            <span className="text-xs font-bold text-[#FF3B1F]">{answeredCount} / {questions.length}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#181a24] overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#AA8A2A] to-[#FF3B1F] transition-all duration-300" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
                        </div>
                        <div className="grid grid-cols-4 gap-2 max-h-[calc(100vh-290px)] overflow-y-auto pr-1">
                            {questions.map((q, idx) => {
                                const qId = q.id || (q as any)._id;
                                const isCurrent = idx === currentIndex;
                                const isMarked = markedForReview[qId];
                                const isAnswered = q.questionType === 'coding' ? !!(codingSubmissions[qId]?.code && codingSubmissions[qId].code.trim().length > 10) : (answers[qId] !== undefined && answers[qId] !== null && answers[qId] !== '');
                                return (
                                    <button key={qId} onClick={() => { setCurrentIndex(idx); setCodeOutput(null); }} className={`h-9 rounded-lg font-black text-xs transition-all relative flex items-center justify-center ${isCurrent ? 'border-2 border-[#FF3B1F] text-white bg-[#FF3B1F]/20 shadow-md shadow-[#FF3B1F]/20' : isMarked ? 'bg-purple-600/30 border border-purple-500/50 text-purple-300' : isAnswered ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' : 'bg-[#10121c] text-slate-400 hover:bg-white/10 hover:text-white border border-[#181a24]'}`}>
                                        {idx + 1}
                                        {isMarked && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-purple-400" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0c0d14] border border-[#181a24] space-y-1.5 text-[0.65rem] text-slate-400">
                        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-500/50" /> Answered</div>
                        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded bg-white/10 border border-white/20" /> Unanswered</div>
                        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded bg-purple-500/30 border border-purple-500/50" /> Marked for Review</div>
                    </div>
                </aside>

                <main className="flex-1 flex flex-col overflow-hidden bg-[#070709]">
                    <div className="px-5 py-2.5 border-b border-[#181a24] bg-[#090a0f] flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-2.5">
                            <span className="px-2.5 py-0.5 rounded text-[0.65rem] font-black uppercase tracking-wider bg-white/10 text-slate-200">Question {currentIndex + 1} of {questions.length}</span>
                            <span className="px-2 py-0.5 rounded text-[0.65rem] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">{currentQuestion?.category}</span>
                            <span className={`px-2 py-0.5 rounded text-[0.65rem] font-bold uppercase tracking-wider ${currentQuestion?.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-500/10' : currentQuestion?.difficulty === 'Medium' ? 'text-amber-400 bg-amber-500/10' : 'text-rose-400 bg-rose-500/10'}`}>{currentQuestion?.difficulty}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-[#FF3B1F]">{currentQuestion?.points || 10} Points</span>
                            <button onClick={() => setMarkedForReview(m => ({ ...m, [currentQId]: !m[currentQId] }))} className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${markedForReview[currentQId] ? 'bg-purple-600 text-white' : 'bg-[#0e1018] text-slate-400 hover:text-white'}`}>
                                <Bookmark className="w-3.5 h-3.5" /> {markedForReview[currentQId] ? 'Marked' : 'Mark for Review'}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col">
                        {currentQuestion?.questionType === 'coding' ? (
                            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                                <div className="w-full md:w-1/2 p-5 overflow-y-auto border-r border-[#181a24] space-y-4 bg-[#08090d]">
                                    <div>
                                        <h2 className="text-lg font-black text-white">{currentQuestion.title}</h2>
                                        <p className="text-xs text-slate-300 mt-2 whitespace-pre-wrap leading-relaxed">{currentQuestion.description}</p>
                                    </div>
                                    <div className="space-y-3 pt-2">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><ListChecks className="w-3.5 h-3.5 text-[#FF3B1F]" /> Example Test Cases & Expected Outputs</h4>
                                        {testCases.map((tc, idx) => (
                                            <div key={idx} className="p-3.5 rounded-xl bg-[#0e1018] border border-[#181a24] text-xs font-mono space-y-1.5">
                                                <div className="flex items-center justify-between text-[0.7rem] text-slate-500 font-bold"><span>Case {idx + 1}</span>{tc.description && <span>{tc.description}</span>}</div>
                                                <div className="text-slate-300 bg-[#070709] p-2 rounded-lg border border-[#181a24]"><span className="text-indigo-400 font-bold">Input: </span><span>{Array.isArray(tc.input) ? tc.input.map(i => JSON.stringify(i)).join(', ') : JSON.stringify(tc.input)}</span></div>
                                                <div className="text-slate-300 bg-[#070709] p-2 rounded-lg border border-[#181a24]"><span className="text-emerald-400 font-bold">Expected: </span><span>{JSON.stringify(tc.expectedOutput)}</span></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="w-full md:w-1/2 flex flex-col overflow-hidden bg-[#090a0f]">
                                    <div className="p-2.5 border-b border-[#181a24] bg-[#0c0d14] flex items-center justify-between flex-shrink-0">
                                        <div className="flex items-center gap-2">
                                            <Code2 className="w-4 h-4 text-[#FF3B1F]" />
                                            <select value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value)} className="px-2.5 py-1 rounded-lg bg-[#141624] border border-[#1f2232] text-xs font-bold text-white focus:outline-none focus:border-[#FF3B1F]">
                                                {LANGUAGES.map(l => (<option key={l.id} value={l.id}>{l.name}</option>))}
                                            </select>
                                            <button onClick={handleResetCode} title="Reset code to initial boilerplate" className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"><RotateCcw className="w-3.5 h-3.5" /></button>
                                        </div>
                                        <button onClick={handleRunSampleCode} disabled={isRunningCode} className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50">
                                            {isRunningCode ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Running...</span></> : <><Play className="w-3.5 h-3.5 fill-current" /><span>Run Code</span></>}
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-hidden relative">
                                        <Editor height="100%" language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage === 'python' ? 'python' : selectedLanguage} theme="vs-dark" value={currentCode} onChange={handleCodeChange} options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, lineNumbers: 'on', automaticLayout: true, tabSize: 4, padding: { top: 12, bottom: 12 } }} />
                                    </div>

                                    <div className={`border-t border-[#181a24] bg-[#070709] flex flex-col transition-all duration-200 ${isDrawerOpen ? 'h-52' : 'h-8'}`}>
                                        <div className="h-8 bg-[#0b0c12] border-b border-[#181a24] px-3 flex items-center justify-between text-xs font-bold text-slate-400">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => { setBottomDrawerTab('testcases'); setIsDrawerOpen(true); }} className={`h-8 px-2 flex items-center gap-1.5 border-b-2 transition-colors ${bottomDrawerTab === 'testcases' && isDrawerOpen ? 'border-[#FF3B1F] text-white' : 'border-transparent text-slate-400 hover:text-white'}`}><ListChecks className="w-3.5 h-3.5" /> Testcases</button>
                                                <button onClick={() => { setBottomDrawerTab('results'); setIsDrawerOpen(true); }} className={`h-8 px-2 flex items-center gap-1.5 border-b-2 transition-colors ${bottomDrawerTab === 'results' && isDrawerOpen ? 'border-[#FF3B1F] text-white' : 'border-transparent text-slate-400 hover:text-white'}`}><CheckCircle2 className="w-3.5 h-3.5" /> Test Result {codeOutput && <span className={`w-2 h-2 rounded-full ${codeOutput.passed ? 'bg-emerald-400' : 'bg-rose-400'}`} />}</button>
                                                <button onClick={() => { setBottomDrawerTab('console'); setIsDrawerOpen(true); }} className={`h-8 px-2 flex items-center gap-1.5 border-b-2 transition-colors ${bottomDrawerTab === 'console' && isDrawerOpen ? 'border-[#FF3B1F] text-white' : 'border-transparent text-slate-400 hover:text-white'}`}><Terminal className="w-3.5 h-3.5" /> Console</button>
                                            </div>
                                            <button onClick={() => setIsDrawerOpen(o => !o)} className="text-slate-400 hover:text-white p-1 cursor-pointer">{isDrawerOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}</button>
                                        </div>
                                        {isDrawerOpen && (
                                            <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-slate-300">
                                                {bottomDrawerTab === 'testcases' && (
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-1.5">
                                                            {testCases.map((_, idx) => (
                                                                <button key={idx} onClick={() => { setActiveTestCaseIndex(idx); setIsCustomTest(false); }} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${!isCustomTest && activeTestCaseIndex === idx ? 'bg-[#141624] text-[#FF3B1F] border border-[#282b3d]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>Case {idx + 1}</button>
                                                            ))}
                                                        </div>
                                                        {testCases[activeTestCaseIndex] && (
                                                            <div className="space-y-2 bg-[#090a0f] p-2.5 rounded-xl border border-[#181a24]">
                                                                <div><span className="text-[0.65rem] font-bold text-slate-500 uppercase block mb-0.5">Input</span><div className="bg-[#10121c] p-2 rounded-lg text-white font-mono text-xs">{Array.isArray(testCases[activeTestCaseIndex].input) ? testCases[activeTestCaseIndex].input.map(i => JSON.stringify(i)).join(', ') : JSON.stringify(testCases[activeTestCaseIndex].input)}</div></div>
                                                                <div><span className="text-[0.65rem] font-bold text-slate-500 uppercase block mb-0.5">Expected Output</span><div className="bg-[#10121c] p-2 rounded-lg text-emerald-400 font-mono text-xs">{JSON.stringify(testCases[activeTestCaseIndex].expectedOutput)}</div></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {bottomDrawerTab === 'results' && (
                                                    <div className="space-y-2.5">
                                                        {!codeOutput ? (<div className="text-center py-6 text-slate-500 text-xs">Click <strong className="text-emerald-400">Run Code</strong> to test your solution against visible testcases.</div>) : codeOutput.stderr ? (<div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs whitespace-pre-wrap">{codeOutput.stderr}</div>) : (
                                                            <div className="space-y-3">
                                                                <div className="flex items-center justify-between pb-2 border-b border-[#181a24]">
                                                                    <div className="flex items-center gap-2"><span className={`px-2.5 py-0.5 rounded-md text-xs font-black uppercase ${codeOutput.passed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'}`}>{codeOutput.status || (codeOutput.passed ? 'Accepted' : 'Wrong Answer')}</span><span className="text-xs text-slate-400">{codeOutput.passedTests ?? (codeOutput.passed ? codeOutput.results?.length : 0)} / {codeOutput.totalTests ?? codeOutput.results?.length ?? 1} testcases passed</span></div>
                                                                    {codeOutput.timeMs && <span className="text-[0.7rem] text-slate-500">Runtime: {codeOutput.timeMs}ms</span>}
                                                                </div>
                                                                {codeOutput.results && (
                                                                    <div className="space-y-2">
                                                                        {codeOutput.results.map((r: any, idx: number) => (
                                                                            <div key={idx} className="p-2.5 rounded-xl bg-[#090a0f] border border-[#181a24] text-xs space-y-1">
                                                                                <div className="flex items-center justify-between"><span className="font-bold text-slate-400">Case {r.index || idx + 1}</span><span className={`text-[0.7rem] font-bold ${r.passed ? 'text-emerald-400' : 'text-rose-400'}`}>{r.passed ? '✓ Passed' : '✕ Wrong Output'}</span></div>
                                                                                <div className="text-[0.7rem] text-slate-400"><span className="text-slate-500">Input: </span><span>{JSON.stringify(r.input)}</span></div>
                                                                                <div className="text-[0.7rem]"><span className="text-slate-500">Expected: </span><span className="text-emerald-400">{JSON.stringify(r.expectedOutput)}</span></div>
                                                                                <div className="text-[0.7rem]"><span className="text-slate-500">Your Output: </span><span className={r.passed ? 'text-emerald-400' : 'text-rose-400'}>{JSON.stringify(r.actualOutput)}</span></div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {bottomDrawerTab === 'console' && (<div className="text-xs font-mono text-slate-300 whitespace-pre-wrap">{codeOutput?.stdout || 'No standard output recorded. Use console.log() or print() in your code to debug.'}</div>)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 p-6 md:p-12 overflow-y-auto max-w-3xl mx-auto w-full space-y-6">
                                <div><h2 className="text-lg md:text-xl font-bold text-white leading-relaxed">{currentQuestion?.description || currentQuestion?.title}</h2></div>
                                <div className="space-y-3 pt-2">
                                    {(currentQuestion?.options || []).map(opt => {
                                        const isSelected = answers[currentQId] === opt.id;
                                        return (
                                            <div key={opt.id} onClick={() => handleSelectOption(opt.id)} className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${isSelected ? 'bg-indigo-950/40 border-[#FF3B1F] shadow-lg shadow-[#FF3B1F]/20 text-white' : 'bg-[#0e1018] border-[#181a24] hover:border-[#282b3d] hover:bg-[#141624] text-slate-300'}`}>
                                                <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black uppercase transition-all ${isSelected ? 'bg-[#FF3B1F] text-black shadow-md' : 'bg-white/5 text-slate-400'}`}>{opt.id}</div>
                                                <span className="text-sm font-medium leading-normal flex-1">{opt.text}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <footer className="h-16 border-t border-[#181a24] bg-[#090a0f] px-6 flex items-center justify-between flex-shrink-0 z-20">
                        <button disabled={currentIndex === 0} onClick={() => { setCurrentIndex(i => Math.max(0, i - 1)); setCodeOutput(null); }} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                            <ChevronLeft className="w-4 h-4" /> Previous
                        </button>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400 font-semibold hidden sm:inline">{answeredCount} answered of {questions.length}</span>
                            {currentIndex < questions.length - 1 ? (
                                <button onClick={() => { setCurrentIndex(i => Math.min(questions.length - 1, i + 1)); setCodeOutput(null); }} className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer">
                                    Save & Next <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button onClick={() => setIsSubmitModalOpen(true)} className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF3B1F] to-[#AA8A2A] text-black font-bold text-xs hover:brightness-110 shadow-lg shadow-[#FF3B1F]/20 flex items-center gap-1.5 transition-all cursor-pointer">
                                    Review & Submit <Send className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </footer>
                </main>
            </div>

            <AnimatePresence>
                {isSubmitModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="w-full max-w-md bg-[#090a0f] border border-[#1f2232] rounded-2xl p-6 shadow-2xl space-y-5 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-[#FF3B1F]/10 text-[#FF3B1F] flex items-center justify-center mx-auto text-xl font-black">◈</div>
                            <div>
                                <h3 className="text-lg font-black text-white">Final Assessment Submission</h3>
                                <p className="text-xs text-slate-400 mt-1">Please review your completion status before locking your attempt.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-black/40 border border-white/5 text-center">
                                <div><span className="text-[0.65rem] font-bold text-slate-500 uppercase block">Answered</span><strong className="text-lg text-emerald-400">{answeredCount}</strong></div>
                                <div><span className="text-[0.65rem] font-bold text-slate-500 uppercase block">Unanswered</span><strong className="text-lg text-rose-400">{unansweredCount}</strong></div>
                            </div>
                            {unansweredCount > 0 && <p className="text-xs text-amber-300/90 font-medium">⚠️ You still have {unansweredCount} unanswered question{unansweredCount !== 1 ? 's' : ''}.</p>}
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setIsSubmitModalOpen(false)} disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold cursor-pointer">Back to Questions</button>
                                <button onClick={handleFinalSubmit} disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#FF3B1F] to-[#AA8A2A] text-black text-xs font-black hover:brightness-110 shadow-lg shadow-[#FF3B1F]/20 flex items-center justify-center gap-1.5 cursor-pointer">{isSubmitting ? 'Evaluating...' : 'Confirm Submit'}</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AssessmentTakingSession;
