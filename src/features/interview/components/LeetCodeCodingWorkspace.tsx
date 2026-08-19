import React, { useState, useEffect, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import {
    Play, Send, Loader2, CheckCircle2, XCircle, AlertCircle,
    Info, RotateCcw, ChevronDown, Sparkles, Terminal, Code2,
    Lock, FileText, Check, ArrowRight, ShieldCheck
} from 'lucide-react';
import { API_BASE } from '../../../api/config';
import { mockInterviewApi } from '../../../api/mockInterviewApi';

interface TestCase {
    input: any[];
    expectedOutput: any;
    description?: string;
}

interface Example {
    input: string;
    output: string;
    explanation?: string;
}

interface QuestionData {
    title?: string;
    text: string;
    description?: string;
    examples?: Example[];
    constraints?: string[];
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    tags?: string[];
    company?: string[];
    functionName: string;
    testCases: TestCase[];
    hiddenTestCases?: TestCase[];
    initialCode?: Record<string, string>;
}

interface LeetCodeCodingWorkspaceProps {
    question: QuestionData;
    onCodeChange: (code: string) => void;
    onAllTestsPassed: (code: string, stats: { total: number; passed: number; runtimeMs: number }) => void;
}

const LANGUAGES = [
    { id: 63, name: 'JavaScript', monaco: 'javascript' },
    { id: 71, name: 'Python 3', monaco: 'python' },
    { id: 62, name: 'Java', monaco: 'java' },
    { id: 54, name: 'C++', monaco: 'cpp' },
];

// ── Built-in Comprehensive Problem Data ─────────────────────────────
const PROBLEM_DETAILS_BANK: Record<string, Partial<QuestionData>> = {
    merge: {
        title: "Merge Intervals",
        description: "Given an array of `intervals` where `intervals[i] = [starti, endi]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
        examples: [
            {
                input: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
                output: "[[1,6],[8,10],[15,18]]",
                explanation: "Since intervals [1,3] and [2,6] overlap, merge them into [1,6]."
            },
            {
                input: "intervals = [[1,4],[4,5]]",
                output: "[[1,5]]",
                explanation: "Intervals [1,4] and [4,5] are considered overlapping."
            }
        ],
        constraints: [
            "1 <= intervals.length <= 10^4",
            "intervals[i].length == 2",
            "0 <= starti <= endi <= 10^4",
            "Expected Time Complexity: O(n log n)",
            "Expected Space Complexity: O(n) or O(1)"
        ],
        testCases: [
            { input: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expectedOutput: [[1, 6], [8, 10], [15, 18]], description: "Standard overlapping intervals" },
            { input: [[[1, 4], [4, 5]]], expectedOutput: [[1, 5]], description: "Touching intervals" }
        ],
        hiddenTestCases: [
            { input: [[[1, 4], [0, 4]]], expectedOutput: [[0, 4]], description: "Unsorted intervals with zero start" },
            { input: [[[1, 4], [2, 3]]], expectedOutput: [[1, 4]], description: "Subset contained interval" },
            { input: [[[2, 3], [4, 5], [6, 7], [8, 9], [1, 10]]], expectedOutput: [[1, 10]], description: "Enveloping wide interval" }
        ]
    },
    twoSum: {
        title: "Two Sum",
        description: "Given an array of integers `nums` and an integer `target`, return **indices of the two numbers** such that they add up to `target`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.\n\nYou can return the answer in any order.",
        examples: [
            { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
            { input: "nums = [3,2,4], target = 6", output: "[1,2]", explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]." },
            { input: "nums = [3,3], target = 6", output: "[0,1]" }
        ],
        constraints: [
            "2 <= nums.length <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "-10^9 <= target <= 10^9",
            "Only one valid answer exists.",
            "Expected Time Complexity: O(n)",
            "Expected Space Complexity: O(n)"
        ],
        testCases: [
            { input: [[2, 7, 11, 15], 9], expectedOutput: [0, 1], description: "Standard positive array" },
            { input: [[3, 2, 4], 6], expectedOutput: [1, 2], description: "Middle elements" },
            { input: [[3, 3], 6], expectedOutput: [0, 1], description: "Identical elements" }
        ],
        hiddenTestCases: [
            { input: [[-1, -2, -3, -4, -5], -8], expectedOutput: [2, 4], description: "Negative integers" },
            { input: [[0, 4, 3, 0], 0], expectedOutput: [0, 3], description: "Zero elements" },
            { input: [[1000000, 500000, 500000], 1000000], expectedOutput: [1, 2], description: "Large values" }
        ]
    },
    isValid: {
        title: "Valid Parentheses",
        description: "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
        examples: [
            { input: 's = "()"', output: "true" },
            { input: 's = "()[]{}"', output: "true" },
            { input: 's = "(]"', output: "false" }
        ],
        constraints: [
            "1 <= s.length <= 10^4",
            "s consists of parentheses only '()[]{}'.",
            "Expected Time Complexity: O(n)",
            "Expected Space Complexity: O(n)"
        ],
        testCases: [
            { input: ["()[]{}"], expectedOutput: true, description: "Multiple valid pairs" },
            { input: ["(]"], expectedOutput: false, description: "Mismatch pair" },
            { input: ["{[]}"], expectedOutput: true, description: "Nested pairs" }
        ],
        hiddenTestCases: [
            { input: ["("], expectedOutput: false, description: "Single open" },
            { input: ["]"], expectedOutput: false, description: "Single close" },
            { input: ["((((((()))))))"], expectedOutput: true, description: "Deeply nested" },
            { input: ["[(])"], expectedOutput: false, description: "Interleaved invalid" }
        ]
    },
    maxSubArray: {
        title: "Maximum Subarray",
        description: "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.\n\nA **subarray** is a contiguous non-empty sequence of elements within an array.",
        examples: [
            { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "The subarray [4,-1,2,1] has the largest sum 6." },
            { input: "nums = [1]", output: "1" },
            { input: "nums = [5,4,-1,7,8]", output: "23" }
        ],
        constraints: [
            "1 <= nums.length <= 10^5",
            "-10^4 <= nums[i] <= 10^4",
            "Expected Time Complexity: O(n)",
            "Expected Space Complexity: O(1)"
        ],
        testCases: [
            { input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expectedOutput: 6, description: "Standard mixed array" },
            { input: [[1]], expectedOutput: 1, description: "Single element" },
            { input: [[5, 4, -1, 7, 8]], expectedOutput: 23, description: "All positive" }
        ],
        hiddenTestCases: [
            { input: [[-5, -3, -1, -4]], expectedOutput: -1, description: "All negative numbers" },
            { input: [[100, -200, 300]], expectedOutput: 300, description: "Separated peaks" },
            { input: [[0, 0, 0, 0]], expectedOutput: 0, description: "All zeros" }
        ]
    },
    climbStairs: {
        title: "Climbing Stairs",
        description: "You are climbing a staircase. It takes `n` steps to reach the top.\n\nEach time you can either climb `1` or `2` steps. In how many distinct ways can you climb to the top?",
        examples: [
            { input: "n = 2", output: "2", explanation: "There are two ways: 1 step + 1 step, or 2 steps." },
            { input: "n = 3", output: "3", explanation: "There are three ways: 1+1+1, 1+2, or 2+1." }
        ],
        constraints: [
            "1 <= n <= 45",
            "Expected Time Complexity: O(n)",
            "Expected Space Complexity: O(1) or O(n)"
        ],
        testCases: [
            { input: [2], expectedOutput: 2, description: "2 steps" },
            { input: [3], expectedOutput: 3, description: "3 steps" },
            { input: [5], expectedOutput: 8, description: "Fibonacci pattern" }
        ],
        hiddenTestCases: [
            { input: [1], expectedOutput: 1, description: "Base case 1 step" },
            { input: [6], expectedOutput: 13, description: "6 steps" },
            { input: [10], expectedOutput: 89, description: "10 steps" }
        ]
    },
    reverseList: {
        title: "Reverse Linked List",
        description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
        examples: [
            { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" },
            { input: "head = [1,2]", output: "[2,1]" },
            { input: "head = []", output: "[]" }
        ],
        constraints: [
            "The number of nodes in the list is the range [0, 5000].",
            "-5000 <= Node.val <= 5000",
            "Expected Time Complexity: O(n)",
            "Expected Space Complexity: O(1)"
        ],
        testCases: [
            { input: [[1, 2, 3, 4, 5]], expectedOutput: [5, 4, 3, 2, 1], description: "Standard list reversal" },
            { input: [[1, 2]], expectedOutput: [2, 1], description: "Two elements" }
        ],
        hiddenTestCases: [
            { input: [[]], expectedOutput: [], description: "Empty list" },
            { input: [[42]], expectedOutput: [42], description: "Single node" }
        ]
    }
};

export const LeetCodeCodingWorkspace: React.FC<LeetCodeCodingWorkspaceProps> = ({
    question: rawQuestion,
    onCodeChange,
    onAllTestsPassed,
}) => {
    // Merge provided question with rich metadata bank for complete problem view
    const question = useMemo(() => {
        const fn = rawQuestion?.functionName || 'twoSum';
        const fallback = PROBLEM_DETAILS_BANK[fn] || PROBLEM_DETAILS_BANK['twoSum'] || {};
        return {
            ...rawQuestion,
            title: rawQuestion.title || fallback.title || rawQuestion.text?.split(':')[0] || 'Coding Challenge',
            description: rawQuestion.description || fallback.description || rawQuestion.text,
            examples: (rawQuestion.examples && rawQuestion.examples.length > 0) ? rawQuestion.examples : (fallback.examples || []),
            constraints: (rawQuestion.constraints && rawQuestion.constraints.length > 0) ? rawQuestion.constraints : (fallback.constraints || []),
            testCases: (rawQuestion.testCases && rawQuestion.testCases.length > 0) ? rawQuestion.testCases : (fallback.testCases || []),
            hiddenTestCases: (rawQuestion.hiddenTestCases && rawQuestion.hiddenTestCases.length > 0) ? rawQuestion.hiddenTestCases : (fallback.hiddenTestCases || []),
            difficulty: rawQuestion.difficulty || fallback.difficulty || 'Medium',
            tags: rawQuestion.tags || fallback.tags || ['Arrays', 'Algorithms'],
            company: rawQuestion.company || fallback.company || ['Google', 'Amazon', 'Microsoft'],
        };
    }, [rawQuestion]);

    const [language, setLanguage] = useState<string>('javascript');
    const [code, setCode] = useState<string>('');
    const [activeLeftTab, setActiveLeftTab] = useState<'description' | 'examples' | 'constraints'>('description');
    const [activeBottomTab, setActiveBottomTab] = useState<'testcases' | 'console' | 'ai'>('testcases');
    const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState<number>(0);

    // Execution States
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isThinkingAI, setIsThinkingAI] = useState<boolean>(false);
    const [aiFeedback, setAiFeedback] = useState<string>('');

    // Pre-initialize Test Results so sample cases are immediately visible to candidate
    const [testResults, setTestResults] = useState<any[]>(() => {
        return (question.testCases || []).map((tc, idx) => ({
            index: idx + 1,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput: undefined,
            passed: undefined,
            status: 'Ready to Test',
            isHidden: false,
            description: tc.description,
        }));
    });

    useEffect(() => {
        setTestResults((question.testCases || []).map((tc, idx) => ({
            index: idx + 1,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput: undefined,
            passed: undefined,
            status: 'Ready to Test',
            isHidden: false,
            description: tc.description,
        })));
    }, [question]);

    const [submissionResult, setSubmissionResult] = useState<{
        allPassed: boolean;
        totalCases: number;
        passedCases: number;
        runtimeMs: number;
        failedCase?: { input: any; expected: any; actual: any; isHidden: boolean; index: number };
    } | null>(null);

    const [consoleOutput, setConsoleOutput] = useState<{ stdout?: string; stderr?: string } | null>(null);

    // Initial Code setup
    useEffect(() => {
        const initial = question.initialCode?.[language] || 
            (language === 'javascript' 
                ? `/**\n * @param {...any} args\n * @return {any}\n */\nfunction ${question.functionName || 'solution'}(...args) {\n    // Write your code here\n    \n}`
                : language === 'python'
                ? `def ${question.functionName || 'solution'}(*args):\n    # Write your code here\n    pass`
                : language === 'cpp'
                ? `class Solution {\npublic:\n    // Implement your solution\n};`
                : `class Solution {\n    // Implement your solution\n}`);
        setCode(initial);
        onCodeChange(initial);
    }, [language, question]);

    const handleEditorChange = (value: string | undefined) => {
        const newCode = value || '';
        setCode(newCode);
        onCodeChange(newCode);
    };

    // ── Safe In-Browser Client Runner for JavaScript ───────────────────
    const runJavaScriptLocally = (userCode: string, testCasesToRun: TestCase[]) => {
        const fnName = question.functionName || 'solution';
        const results: any[] = [];
        let passedCount = 0;

        try {
            // Build sandbox evaluator
            const sandboxFn = new Function(`
                ${userCode}
                if (typeof ${fnName} !== 'function') {
                    throw new Error("Function '${fnName}' is not defined. Please ensure your function name matches '${fnName}'.");
                }
                return ${fnName};
            `)();

            for (const tc of testCasesToRun) {
                try {
                    const args = Array.isArray(tc.input) ? tc.input : [tc.input];
                    // Deep clone input so function doesn't mutate test cases unexpectedly
                    const clonedArgs = JSON.parse(JSON.stringify(args));
                    const actual = sandboxFn(...clonedArgs);

                    const isMatch = JSON.stringify(actual) === JSON.stringify(tc.expectedOutput);
                    if (isMatch) passedCount++;

                    results.push({
                        input: tc.input,
                        expectedOutput: tc.expectedOutput,
                        actualOutput: actual,
                        passed: isMatch,
                        status: isMatch ? 'Passed' : 'Wrong Answer',
                        description: tc.description,
                    });
                } catch (execErr: any) {
                    results.push({
                        input: tc.input,
                        expectedOutput: tc.expectedOutput,
                        actualOutput: `Runtime Error: ${execErr.message}`,
                        passed: false,
                        status: 'Runtime Error',
                        description: tc.description,
                    });
                }
            }

            return {
                results,
                passedCount,
                stdout: `Evaluated ${testCasesToRun.length} test cases locally in sandbox.\nPassed: ${passedCount}/${testCasesToRun.length}`,
                stderr: passedCount === testCasesToRun.length ? undefined : `Wrong answer on some test cases. Review output diffs below.`,
            };
        } catch (compileErr: any) {
            return {
                results: testCasesToRun.map(tc => ({
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    actualOutput: `Syntax/Reference Error: ${compileErr.message}`,
                    passed: false,
                    status: 'Error',
                    description: tc.description,
                })),
                passedCount: 0,
                stdout: '',
                stderr: `Syntax Error: ${compileErr.message}`,
            };
        }
    };

    // ── Run Code (Visible Sample Cases) ───────────────────────────────
    const handleRunCode = async () => {
        setIsRunning(true);
        setActiveBottomTab('testcases');
        setConsoleOutput(null);

        const sampleCases = question.testCases || [];
        const startTime = performance.now();

        // 1. If JavaScript, run instantly in the browser sandbox for 100% reliability
        if (language === 'javascript') {
            const localRes = runJavaScriptLocally(code, sampleCases);
            const elapsed = Math.max(12, Math.round(performance.now() - startTime));

            setConsoleOutput({ stdout: localRes.stdout, stderr: localRes.stderr });
            setTestResults(localRes.results.map((r, idx) => ({
                index: idx + 1,
                ...r,
                isHidden: false,
            })));
            setIsRunning(false);
            return;
        }

        // 2. For Python / Java / C++, call backend execution runner
        try {
            const token = localStorage.getItem('pt_token');
            const res = await fetch(`${API_BASE}/api/interview/run`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    code,
                    language: language === 'python' ? 'python3' : language,
                    testCases: sampleCases,
                    functionName: question.functionName,
                }),
            });

            const data = await res.json();
            const elapsed = Math.round(performance.now() - startTime);

            setConsoleOutput({ stdout: data.stdout, stderr: data.stderr });

            if (data.results && Array.isArray(data.results)) {
                setTestResults(data.results.map((r: any, idx: number) => ({
                    index: idx + 1,
                    input: r.input,
                    expectedOutput: r.expected,
                    actualOutput: r.output ?? r.error,
                    passed: r.status === 'Passed',
                    status: r.status,
                    isHidden: false,
                })));
            } else {
                setTestResults(sampleCases.map((tc, idx) => ({
                    index: idx + 1,
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    actualOutput: data.stderr || 'Execution completed with warning',
                    passed: false,
                    status: 'Failed',
                    isHidden: false,
                })));
            }
        } catch (err: any) {
            setConsoleOutput({ stderr: 'Execution server connection error. Please switch to JavaScript or try again.' });
        } finally {
            setIsRunning(false);
        }
    };

    // ── Submit Solution (Visible + Hidden Test Cases) ─────────────────
    const handleSubmitSolution = async () => {
        setIsSubmitting(true);
        setActiveBottomTab('testcases');
        setConsoleOutput(null);

        const visibleCases = question.testCases || [];
        const hiddenCases = question.hiddenTestCases || [];
        const allCasesToRun = [...visibleCases, ...hiddenCases];

        const startTime = performance.now();

        // 1. If JavaScript, evaluate visible + hidden cases in sandbox
        if (language === 'javascript') {
            const localRes = runJavaScriptLocally(code, allCasesToRun);
            const elapsed = Math.max(24, Math.round(performance.now() - startTime));

            setConsoleOutput({ stdout: localRes.stdout, stderr: localRes.stderr });

            const formattedResults = localRes.results.map((r, idx) => ({
                index: idx + 1,
                ...r,
                isHidden: idx >= visibleCases.length,
            }));

            setTestResults(formattedResults);

            const allPassed = localRes.passedCount === allCasesToRun.length && allCasesToRun.length > 0;
            const failedIndex = formattedResults.findIndex(r => !r.passed);
            const failedCase = failedIndex >= 0 ? {
                input: formattedResults[failedIndex].input,
                expected: formattedResults[failedIndex].expectedOutput,
                actual: formattedResults[failedIndex].actualOutput,
                isHidden: formattedResults[failedIndex].isHidden,
                index: failedIndex + 1,
            } : undefined;

            setSubmissionResult({
                allPassed,
                totalCases: allCasesToRun.length,
                passedCases: localRes.passedCount,
                runtimeMs: elapsed,
                failedCase,
            });

            if (allPassed) {
                onAllTestsPassed(code, {
                    total: allCasesToRun.length,
                    passed: localRes.passedCount,
                    runtimeMs: elapsed,
                });
            }

            setIsSubmitting(false);
            return;
        }

        // 2. For Python / Java / C++, call backend runner
        try {
            const token = localStorage.getItem('pt_token');
            const res = await fetch(`${API_BASE}/api/interview/run`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    code,
                    language: language === 'python' ? 'python3' : language,
                    testCases: allCasesToRun,
                    functionName: question.functionName,
                }),
            });

            const data = await res.json();
            const elapsed = Math.max(35, Math.round(performance.now() - startTime));

            setConsoleOutput({ stdout: data.stdout, stderr: data.stderr });

            let passedCount = 0;
            let formattedResults: any[] = [];

            if (data.results && Array.isArray(data.results)) {
                formattedResults = data.results.map((r: any, idx: number) => {
                    const isPassed = r.status === 'Passed';
                    if (isPassed) passedCount++;
                    const isHidden = idx >= visibleCases.length;
                    return {
                        index: idx + 1,
                        input: r.input,
                        expectedOutput: r.expected,
                        actualOutput: r.output ?? r.error,
                        passed: isPassed,
                        status: r.status,
                        isHidden,
                    };
                });
            } else {
                passedCount = 0;
                formattedResults = allCasesToRun.map((tc, idx) => ({
                    index: idx + 1,
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    actualOutput: data.stderr || 'Execution failed',
                    passed: false,
                    status: 'Failed',
                    isHidden: idx >= visibleCases.length,
                }));
            }

            setTestResults(formattedResults);

            const allPassed = passedCount === allCasesToRun.length && allCasesToRun.length > 0;
            const failedIndex = formattedResults.findIndex(r => !r.passed);
            const failedCase = failedIndex >= 0 ? {
                input: formattedResults[failedIndex].input,
                expected: formattedResults[failedIndex].expectedOutput,
                actual: formattedResults[failedIndex].actualOutput,
                isHidden: formattedResults[failedIndex].isHidden,
                index: failedIndex + 1,
            } : undefined;

            setSubmissionResult({
                allPassed,
                totalCases: allCasesToRun.length,
                passedCases: passedCount,
                runtimeMs: elapsed,
                failedCase,
            });

            if (allPassed) {
                onAllTestsPassed(code, {
                    total: allCasesToRun.length,
                    passed: passedCount,
                    runtimeMs: elapsed,
                });
            }
        } catch (err: any) {
            setConsoleOutput({ stderr: 'Submission failed due to connection error.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── AI Code Review ───────────────────────────────────────────────
    const handleGetAIFeedback = async () => {
        setIsThinkingAI(true);
        setActiveBottomTab('ai');
        setAiFeedback('🤖 Dora is studying your algorithm logic, edge cases, and time/space complexity...');

        try {
            const data = await mockInterviewApi.getCodeFeedback({
                question: question.text,
                code,
                language,
            });
            setAiFeedback(data.feedback || 'Code reviewed.');
        } catch {
            setAiFeedback('AI review is currently offline. Please run test cases to verify your code.');
        } finally {
            setIsThinkingAI(false);
        }
    };

    const diffBadgeColor = 
        question.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
        question.difficulty === 'Hard' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' :
        'text-amber-400 bg-amber-500/10 border-amber-500/20';

    return (
        <div className="flex flex-col lg:flex-row h-full w-full bg-[#05060b] text-white overflow-hidden select-none font-sans">

            {/* ── LEFT PANEL: PROBLEM STATEMENT & EXAMPLES ───────────── */}
            <div className="w-full lg:w-1/2 h-1/2 lg:h-full flex flex-col bg-[#080912] border-b lg:border-b-0 lg:border-r border-white/[0.08] overflow-hidden">
                {/* Problem Header */}
                <div className="p-4 sm:p-5 border-b border-white/[0.06] bg-[#0c0e1a]">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                                {question.title}
                            </h2>
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${diffBadgeColor}`}>
                                {question.difficulty}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            <span>AlgoAscent Technical Assessment</span>
                        </div>
                    </div>

                    {/* Tags & Company Badges */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {(question.tags || []).map((t, idx) => (
                            <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/5">
                                #{t}
                            </span>
                        ))}
                        {(question.company || []).map((c, idx) => (
                            <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                🏢 {c}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Left Tabs */}
                <div className="flex items-center gap-1 px-4 bg-[#090b14] border-b border-white/[0.06] text-xs font-bold">
                    <button
                        onClick={() => setActiveLeftTab('description')}
                        className={`py-2.5 px-3 border-b-2 transition-all ${
                            activeLeftTab === 'description'
                                ? 'border-white text-white font-black'
                                : 'border-transparent text-slate-400 hover:text-white'
                        }`}
                    >
                        Description
                    </button>
                    <button
                        onClick={() => setActiveLeftTab('examples')}
                        className={`py-2.5 px-3 border-b-2 transition-all ${
                            activeLeftTab === 'examples'
                                ? 'border-white text-white font-black'
                                : 'border-transparent text-slate-400 hover:text-white'
                        }`}
                    >
                        Examples ({(question.examples || []).length})
                    </button>
                    <button
                        onClick={() => setActiveLeftTab('constraints')}
                        className={`py-2.5 px-3 border-b-2 transition-all ${
                            activeLeftTab === 'constraints'
                                ? 'border-white text-white font-black'
                                : 'border-transparent text-slate-400 hover:text-white'
                        }`}
                    >
                        Constraints
                    </button>
                </div>

                {/* Left Content Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                    {activeLeftTab === 'description' && (
                        <div className="space-y-4">
                            <div className="whitespace-pre-wrap leading-relaxed text-slate-200">
                                {question.description}
                            </div>

                            {/* Sample Examples Cards */}
                            <div className="space-y-3 pt-2">
                                {(question.examples || []).map((ex, idx) => (
                                    <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                                        <div className="font-extrabold text-white text-xs">Example {idx + 1}:</div>
                                        <div className="font-mono text-xs bg-black/60 p-3 rounded-xl border border-white/5 space-y-1">
                                            <div><strong className="text-slate-400">Input:</strong> <span className="text-white">{ex.input}</span></div>
                                            <div><strong className="text-slate-400">Output:</strong> <span className="text-emerald-400 font-bold">{ex.output}</span></div>
                                            {ex.explanation && (
                                                <div className="text-slate-400 pt-1 text-[11px] leading-normal">
                                                    <strong>Explanation:</strong> {ex.explanation}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeLeftTab === 'examples' && (
                        <div className="space-y-4">
                            {(question.examples || []).map((ex, idx) => (
                                <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                                    <div className="font-extrabold text-white text-sm">Example {idx + 1}</div>
                                    <div className="font-mono text-xs bg-black/60 p-3.5 rounded-xl border border-white/5 space-y-1.5">
                                        <div><span className="text-slate-400 font-bold">Input:</span> <span className="text-white">{ex.input}</span></div>
                                        <div><span className="text-slate-400 font-bold">Output:</span> <span className="text-emerald-400 font-bold">{ex.output}</span></div>
                                        {ex.explanation && (
                                            <div className="text-slate-300 text-[11px] pt-1"><strong>Explanation:</strong> {ex.explanation}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeLeftTab === 'constraints' && (
                        <div className="space-y-3">
                            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Problem Constraints:</h4>
                            <ul className="space-y-2 font-mono text-xs text-slate-300">
                                {(question.constraints || []).map((c, idx) => (
                                    <li key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                        <span>{c}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Test Suite Summary Card */}
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-300" />
                            <span>{(question.testCases || []).length} Sample Cases</span>
                        </span>
                        <span className="flex items-center gap-1.5 font-bold text-indigo-400">
                            <Lock className="w-3.5 h-3.5" />
                            <span>{(question.hiddenTestCases || []).length} Hidden Test Cases</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* ── RIGHT PANEL: ALGOASCENT CODE STUDIO & RUNNER ───────── */}
            <div className="w-full lg:w-1/2 h-1/2 lg:h-full flex flex-col bg-[#05060b] overflow-hidden">
                {/* Editor Header Toolbar */}
                <div className="h-12 px-4 bg-[#090b14] border-b border-white/[0.08] flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {/* Language Selector */}
                        <div className="relative">
                            <select
                                value={language}
                                onChange={e => setLanguage(e.target.value)}
                                className="appearance-none bg-[#141624] text-white text-xs font-bold px-3 py-1.5 pr-8 rounded-xl border border-white/10 focus:outline-none focus:border-white transition-all cursor-pointer"
                            >
                                {LANGUAGES.map(l => (
                                    <option key={l.id} value={l.monaco} className="bg-[#101222]">{l.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>

                        {language === 'javascript' && (
                            <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Fast Local Engine</span>
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* AI Review Button */}
                        <button
                            onClick={handleGetAIFeedback}
                            disabled={isThinkingAI}
                            className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold hover:bg-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                            {isThinkingAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline">AI Code Review</span>
                        </button>
                    </div>
                </div>

                {/* Monaco Code Editor */}
                <div className="flex-1 min-h-[180px] relative bg-[#07080f]">
                    <Editor
                        height="100%"
                        language={language}
                        value={code}
                        onChange={handleEditorChange}
                        theme="vs-dark"
                        options={{
                            minimap: { enabled: false },
                            fontSize: 13,
                            fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
                            lineNumbers: 'on',
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            tabSize: 4,
                            cursorBlinking: 'smooth',
                            smoothScrolling: true,
                            padding: { top: 12, bottom: 12 },
                        }}
                    />
                </div>

                {/* ── BOTTOM DRAWER: TEST RESULTS & CONSOLE ──────────── */}
                <div className="h-48 sm:h-56 bg-[#090b14] border-t border-white/[0.08] flex flex-col flex-shrink-0">
                    {/* Bottom Drawer Tabs */}
                    <div className="flex items-center justify-between px-4 bg-[#0d0f1c] border-b border-white/[0.06] text-xs font-bold">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setActiveBottomTab('testcases')}
                                className={`py-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                                    activeBottomTab === 'testcases'
                                        ? 'border-white text-white font-black'
                                        : 'border-transparent text-slate-400 hover:text-white'
                                }`}
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Sample Test Cases ({(question.testCases || []).length})</span>
                            </button>

                            <button
                                onClick={() => setActiveBottomTab('console')}
                                className={`py-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                                    activeBottomTab === 'console'
                                        ? 'border-white text-white font-black'
                                        : 'border-transparent text-slate-400 hover:text-white'
                                }`}
                            >
                                <Terminal className="w-3.5 h-3.5" />
                                <span>Console Output</span>
                            </button>

                            <button
                                onClick={() => setActiveBottomTab('ai')}
                                className={`py-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                                    activeBottomTab === 'ai'
                                        ? 'border-white text-white font-black'
                                        : 'border-transparent text-slate-400 hover:text-white'
                                }`}
                            >
                                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                <span>AI Review</span>
                            </button>
                        </div>

                        {/* Submission Outcome Pill */}
                        {submissionResult && (
                            <div className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                                submissionResult.allPassed 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}>
                                {submissionResult.allPassed 
                                    ? `🎉 All ${submissionResult.totalCases} Cases Passed (${submissionResult.runtimeMs}ms)`
                                    : `❌ Failed on Case ${submissionResult.failedCase?.index || 1}`}
                            </div>
                        )}
                    </div>

                    {/* Bottom Drawer Content */}
                    <div className="flex-1 overflow-y-auto p-3 text-xs font-mono">
                        {activeBottomTab === 'testcases' && (
                            <div className="space-y-3">
                                {/* Test Case Buttons */}
                                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                    {testResults.map((tc, idx) => {
                                        const isSelected = selectedTestCaseIndex === idx;
                                        const isPassed = tc.passed;
                                        const isHidden = tc.isHidden;

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedTestCaseIndex(idx)}
                                                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                                                        : isPassed === true
                                                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                                        : isPassed === false
                                                        ? 'bg-red-500/10 text-red-300 border-red-500/30'
                                                        : 'bg-white/[0.04] text-slate-400 border-white/10'
                                                }`}
                                            >
                                                {isPassed === true ? (
                                                    <Check className="w-3 h-3 text-emerald-400" />
                                                ) : isPassed === false ? (
                                                    <XCircle className="w-3 h-3 text-rose-400" />
                                                ) : isHidden ? (
                                                    <Lock className="w-3 h-3" />
                                                ) : null}
                                                <span>Case {idx + 1}{isHidden ? ' (Hidden)' : ''}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Active Case Details Diff Box */}
                                {(() => {
                                    const activeResult = testResults[selectedTestCaseIndex] || (question.testCases || [])[selectedTestCaseIndex];
                                    if (!activeResult) return <div className="text-slate-500">No test cases available.</div>;

                                    return (
                                        <div className="space-y-2">
                                            {activeResult.description && (
                                                <div className="text-[11px] text-slate-400 font-sans italic">
                                                    Case: {activeResult.description}
                                                </div>
                                            )}
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-black/50 p-3 rounded-xl border border-white/5">
                                                <div>
                                                    <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Input</div>
                                                    <div className="text-white bg-white/[0.03] p-2 rounded-lg truncate font-mono">
                                                        {JSON.stringify(activeResult.input)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Expected Output</div>
                                                    <div className="text-emerald-400 bg-white/[0.03] p-2 rounded-lg truncate font-mono font-bold">
                                                        {JSON.stringify(activeResult.expectedOutput)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Your Output</div>
                                                    <div className={`p-2 rounded-lg truncate font-mono ${
                                                        activeResult.passed === true
                                                            ? 'text-emerald-400 bg-emerald-500/10 font-bold'
                                                            : activeResult.passed === false
                                                            ? 'text-rose-400 bg-rose-500/10'
                                                            : 'text-slate-400 bg-white/[0.03] italic'
                                                    }`}>
                                                        {activeResult.actualOutput !== undefined 
                                                            ? JSON.stringify(activeResult.actualOutput) 
                                                            : 'Click "Run Code" or "Submit Solution" to test'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {activeBottomTab === 'console' && (
                            <div className="space-y-2">
                                {consoleOutput?.stderr ? (
                                    <div className="text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 whitespace-pre-wrap font-mono text-xs">
                                        {consoleOutput.stderr}
                                    </div>
                                ) : consoleOutput?.stdout ? (
                                    <div className="text-slate-300 bg-black/50 p-3 rounded-xl border border-white/5 whitespace-pre-wrap font-mono text-xs">
                                        {consoleOutput.stdout}
                                    </div>
                                ) : (
                                    <div className="text-slate-500 p-2">Standard output and compilation logs will appear here upon execution.</div>
                                )}
                            </div>
                        )}

                        {activeBottomTab === 'ai' && (
                            <div className="p-2 text-xs text-slate-200 leading-relaxed font-sans">
                                {aiFeedback || 'Click "AI Code Review" above to get instant analysis on your algorithm.'}
                            </div>
                        )}
                    </div>

                    {/* ── BOTTOM ACTION TOOLBAR ──────────────────────── */}
                    <div className="px-4 py-2.5 bg-[#090b14] border-t border-white/[0.08] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {/* Run Code Button */}
                            <button
                                onClick={handleRunCode}
                                disabled={isRunning || isSubmitting}
                                className="px-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs font-bold hover:bg-white/[0.12] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                            >
                                {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                                <span>Run Code</span>
                            </button>

                            {/* Submit Solution Button (Runs visible + hidden cases) */}
                            <button
                                onClick={handleSubmitSolution}
                                disabled={isRunning || isSubmitting}
                                className="px-5 py-2 rounded-xl bg-white text-black text-xs font-extrabold hover:bg-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.2)] disabled:opacity-40 hover:scale-105 active:scale-95"
                            >
                                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                <span>Submit Solution</span>
                            </button>
                        </div>

                        {/* Unlocked Next Phase Indicator */}
                        {submissionResult?.allPassed && (
                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-black animate-pulse">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>All Tests Passed! Continuing to Next Phase...</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeetCodeCodingWorkspace;
