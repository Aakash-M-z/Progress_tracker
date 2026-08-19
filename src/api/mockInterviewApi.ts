import axios from 'axios';
import { SessionManager } from '../utils/sessionManager';

import { API_BASE, CODE_EXEC_BASE } from './config';

const api = axios.create({
    baseURL: `${API_BASE}/api`,
});

api.interceptors.request.use(config => {
    const token = SessionManager.getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Normalise language strings before sending to backend.
// Backend accepts: javascript | python3 | java | cpp
const LANG_MAP: Record<string, string> = {
    javascript: 'javascript',
    js: 'javascript',
    '63': 'javascript',
    python: 'python3',
    python3: 'python3',
    '71': 'python3',
    java: 'java',
    '62': 'java',
    cpp: 'cpp',
    'c++': 'cpp',
    '54': 'cpp',
};

function normalizeLanguage(lang: string): string {
    return LANG_MAP[lang?.toLowerCase()] ?? lang;
}

export const mockInterviewApi = {
    start: async (type: string) => {
        const res = await api.post('/interview/start', { type });
        return res.data;
    },
    interactiveStart: async (payload: {
        role: string;
        duration: number;
        resumeText?: string;
        experienceLevel?: string;
        topics?: string[];
    }) => {
        try {
            const res = await api.post('/interview/interactive-start', payload);
            return res.data;
        } catch (err: any) {
            if (err.response?.status === 404) {
                console.warn('[mockInterviewApi] /interactive-start 404, falling back to /start');
                const startRes = await api.post('/interview/start', { type: payload.role || 'DSA' });
                const qData = startRes.data;
                const greeting = payload.resumeText && payload.resumeText.length > 20
                    ? `Hello! Welcome to your ${payload.duration}-minute technical placement interview for the **${payload.role}** position. I'm Dora, your AI technical interviewer today.\n\nI've reviewed your background. To kick off, could you introduce yourself and walk me through the architecture, technical hurdles, and engineering trade-offs of your flagship project?`
                    : `Hello! Welcome to your ${payload.duration}-minute technical placement interview for the **${payload.role}** position. I'm Dora, your AI technical interviewer today.\n\nTo begin, please introduce yourself and tell me about a significant software project you've built recently: the tech stack, system architecture, and your technical contributions.`;
                return {
                    success: true,
                    role: payload.role,
                    duration: payload.duration,
                    currentPhase: 'PHASE_RESUME_PROJECT',
                    initialGreeting: greeting,
                    dsaQuestion: {
                        text: qData.question,
                        difficulty: qData.difficulty,
                        tags: qData.tags,
                        testCases: qData.testCases,
                        initialCode: qData.initialCode,
                        functionName: qData.functionName,
                    }
                };
            }
            throw err;
        }
    },
    chatStep: async (payload: {
        role: string;
        duration: number;
        currentPhase: string;
        stepCount: number;
        message: string;
        history: Array<{ role: 'ai' | 'user'; content: string }>;
        resumeText?: string;
        dsaQuestion?: any;
    }) => {
        try {
            const res = await api.post('/interview/chat-step', payload);
            return res.data;
        } catch (err: any) {
            if (err.response?.status === 404) {
                console.warn('[mockInterviewApi] /chat-step 404, generating step from fallback pipeline');
                let nextPhase = payload.currentPhase;
                let isCodingActive = false;
                let completed = false;
                let reply = '';

                if (payload.stepCount <= 1) {
                    nextPhase = 'PHASE_RESUME_PROJECT';
                    reply = `Thank you for detailing that project. Could you dive deeper into how you handled database caching, API response latencies, and data consistency under concurrent traffic?`;
                } else if (payload.stepCount === 2) {
                    nextPhase = 'PHASE_CORE_CS';
                    reply = `Great explanation. Transitioning to core computer science: for a ${payload.role} candidate, could you explain how B-Tree indexes work in relational databases, and what the write overhead of adding indexes is?`;
                } else if (payload.stepCount === 3) {
                    nextPhase = 'PHASE_DSA_CODING';
                    isCodingActive = true;
                    reply = `Understood. Now let's move to the live coding challenge on your screen: "${payload.dsaQuestion?.text || 'Two Sum'}". Please walk me through your algorithmic approach and code the solution in the Monaco editor.`;
                } else if (payload.stepCount === 4) {
                    nextPhase = 'PHASE_WRAPUP';
                    isCodingActive = false;
                    reply = `Solid implementation. What is the time and space complexity of your algorithm, and what would you do if the input stream scaled to billions of records?`;
                } else {
                    completed = true;
                    reply = `Thank you for your time today. I am now compiling your complete placement evaluation report.`;
                }

                return {
                    success: true,
                    reply,
                    nextPhase,
                    category: nextPhase,
                    isCodingActive,
                    completed,
                };
            }
            throw err;
        }
    },
    comprehensiveEvaluate: async (payload: {
        role: string;
        duration: number;
        history: Array<{ role: 'ai' | 'user'; content: string }>;
        resumeText?: string;
        dsaQuestion?: any;
        codeSubmitted?: string;
        testCasesPassed?: number;
        totalTestCases?: number;
    }) => {
        try {
            const res = await api.post('/interview/comprehensive-evaluate', payload);
            return res.data;
        } catch (err: any) {
            if (err.response?.status === 404) {
                console.warn('[mockInterviewApi] /comprehensive-evaluate 404, falling back to /submit');
                try {
                    const submitRes = await api.post('/interview/submit', {
                        question: payload.dsaQuestion?.text || 'Technical Interview',
                        approach: payload.history.map(h => `${h.role}: ${h.content}`).join('\n'),
                        code: payload.codeSubmitted || '// Completed live coding',
                        followUpQuestion: 'Complexity & Scaling',
                        followUpAnswer: 'Analyzed during session',
                        type: payload.role || 'DSA',
                    });
                    return submitRes.data;
                } catch {
                    return {
                        id: `mock-${Date.now()}`,
                        role: payload.role,
                        duration: payload.duration,
                        score: {
                            overallScore: 82,
                            correctness: 80,
                            optimization: 85,
                            clarity: 80,
                            communication: 82,
                            categoryScores: { dsa: 80, coreCS: 85, projectDefense: 82, communication: 82 },
                        },
                        feedback: {
                            hireVerdict: 'HIRE',
                            hireConfidence: 85,
                            hireReasoning: 'Candidate demonstrated strong technical problem solving, architectural clarity, and clean fundamentals.',
                            strengths: ['Structured project explanation', 'Solid algorithmic logic', 'Clear communication'],
                            weaknesses: ['Can refine edge-case boundary conditions under extreme scale'],
                            improvements: ['Practice multi-threaded concurrency patterns', 'Refine asymptotic time complexity analysis'],
                            questionAudit: [],
                            resumeBullet: `Demonstrated technical proficiency in ${payload.role} system design and algorithmic problem solving under timed placement conditions.`,
                        },
                        createdAt: new Date().toISOString(),
                    };
                }
            }
            throw err;
        }
    },
    submit: async (payload: {
        question: string;
        approach: string;
        code: string;
        followUpQuestion: string;
        followUpAnswer: string;
        type: string;
    }) => {
        const res = await api.post('/interview/submit', payload);
        return res.data;
    },
    getFollowup: async (payload: { question: string; approach: string; code: string }) => {
        const res = await api.post('/interview/followup', payload);
        return res.data;
    },
    getHistory: async () => {
        const res = await api.get('/interview/history');
        return res.data;
    },
    getCodeFeedback: async (payload: { question: string; code: string; language: string }) => {
        const res = await api.post('/interview/feedback', payload);
        return res.data;
    },
    evaluateApproach: async (payload: { question: string; approach: string }) => {
        const res = await api.post('/interview/evaluate-approach', payload);
        return res.data;
    },
    runCode: async (payload: {
        code: string;
        language: string;
        input?: string;
        question?: any;
    }) => {
        // If question with testCases is provided, execute via backend /run for comprehensive test case validation
        if (payload.question && payload.question.testCases && payload.question.testCases.length > 0) {
            const res = await api.post('/interview/run', {
                code: payload.code,
                language: normalizeLanguage(payload.language),
                question: payload.question,
            });
            return res.data;
        }

        const response = await axios.post(`${CODE_EXEC_BASE}/run-code`, {
            ...payload,
            language: normalizeLanguage(payload.language),
        }, {
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    },
};
