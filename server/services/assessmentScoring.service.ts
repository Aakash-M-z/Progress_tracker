/**
 * server/services/assessmentScoring.service.ts
 * Deterministic Assessment Scoring Engine for AlgoAscent
 */

import { executeCodeSolution, runJavaScriptLocally } from './codeRunner.service.js';

export interface EvaluateAttemptParams {
    assessment: any;
    answers: Record<string, any>;
    codingSubmissions: Record<string, { code: string; language: string }>;
    integrityEvents: Array<{ type: string; timestamp: Date; details?: string }>;
    startedAt: Date;
    submittedAt: Date;
}

export interface EvaluationResult {
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
    accuracy: number;
    attemptedCount: number;
    correctCount: number;
    totalQuestions: number;
    categoryScores: Record<string, { earned: number; max: number; percentage: number }>;
    questionResults: Record<string, {
        questionId: string;
        type: string;
        category: string;
        pointsEarned: number;
        maxPoints: number;
        isCorrect: boolean;
        isAttempted: boolean;
        userAnswer?: any;
        correctAnswer?: any;
        explanation?: string;
        codingDetails?: {
            passedCount: number;
            totalCount: number;
            testResults: any[];
            runtimeMs: number;
        };
    }>;
    codingEvaluations: Record<string, any>;
    integrityScore: number;
    tabSwitchCount: number;
    fullscreenExitCount: number;
    timeTakenSeconds: number;
}

/**
 * Execute candidate code against combined sample + hidden test cases
 */
async function executeCodingSolution(
    code: string,
    language: string,
    functionName: string,
    testCases: any[]
): Promise<{ passedCount: number; totalCount: number; testResults: any[]; runtimeMs: number }> {
    const result = await executeCodeSolution(code, language, functionName, testCases);
    return {
        passedCount: result.passedCount,
        totalCount: result.totalCount,
        testResults: result.results,
        runtimeMs: result.runtimeMs
    };
}

/**
 * Authoritative deterministic scoring function
 */
export async function evaluateAssessmentAttempt(params: EvaluateAttemptParams): Promise<EvaluationResult> {
    const { assessment, answers, codingSubmissions, integrityEvents, startedAt, submittedAt } = params;

    const questions = assessment.questions || [];
    const settings = assessment.settings || {};
    const negativeMarking = !!settings.negativeMarking;
    const negativeFactor = settings.negativeMarkingFactor || 0.25;

    let totalEarnedScore = 0;
    let maxPossibleScore = 0;
    let attemptedCount = 0;
    let correctCount = 0;

    const categoryStats: Record<string, { earned: number; max: number }> = {};
    const questionResults: Record<string, any> = {};
    const codingEvaluations: Record<string, any> = {};

    for (const q of questions) {
        const qId = q.id || q.questionId;
        const qCategory = q.category || 'General';
        const qType = q.questionType || 'mcq';
        const qPoints = Number(q.points) || 10;

        maxPossibleScore += qPoints;
        if (!categoryStats[qCategory]) {
            categoryStats[qCategory] = { earned: 0, max: 0 };
        }
        categoryStats[qCategory].max += qPoints;

        // ── A. CODING QUESTION EVALUATION ──────────────────────────────────
        if (qType === 'coding') {
            const submission = codingSubmissions[qId];
            const hasCode = submission && submission.code && submission.code.trim().length > 10;

            if (hasCode) {
                attemptedCount++;
                const allTestCases = [...(q.testCases || []), ...(q.hiddenTestCases || [])];
                const execResult = await executeCodingSolution(
                    submission.code,
                    submission.language || 'javascript',
                    q.functionName || 'solution',
                    allTestCases
                );

                const passedRatio = execResult.totalCount > 0 ? (execResult.passedCount / execResult.totalCount) : 0;
                const pointsEarned = Math.round(passedRatio * qPoints * 100) / 100;
                const isFullyCorrect = execResult.passedCount === execResult.totalCount && execResult.totalCount > 0;

                if (isFullyCorrect) correctCount++;
                totalEarnedScore += pointsEarned;
                categoryStats[qCategory].earned += pointsEarned;

                codingEvaluations[qId] = {
                    code: submission.code,
                    language: submission.language,
                    passedCount: execResult.passedCount,
                    totalCount: execResult.totalCount,
                    runtimeMs: execResult.runtimeMs,
                    pointsEarned,
                    passed: isFullyCorrect,
                    testResults: execResult.testResults
                };

                questionResults[qId] = {
                    questionId: qId,
                    type: 'coding',
                    category: qCategory,
                    pointsEarned,
                    maxPoints: qPoints,
                    isCorrect: isFullyCorrect,
                    isAttempted: true,
                    codingDetails: execResult
                };
            } else {
                questionResults[qId] = {
                    questionId: qId,
                    type: 'coding',
                    category: qCategory,
                    pointsEarned: 0,
                    maxPoints: qPoints,
                    isCorrect: false,
                    isAttempted: false
                };
            }
        }
        // ── B. MCQ & OBJECTIVE QUESTIONS ────────────────────────────────────
        else {
            const rawAns = answers[qId];
            const candidateAnswer = typeof rawAns === 'object' && rawAns !== null && 'value' in rawAns
                ? rawAns.value
                : rawAns;

            const isAttempted = candidateAnswer !== undefined && candidateAnswer !== null && candidateAnswer !== '';

            if (isAttempted) {
                attemptedCount++;
                const expectedAnswer = q.correctAnswer;
                let isCorrect = false;

                if (Array.isArray(expectedAnswer) && Array.isArray(candidateAnswer)) {
                    isCorrect = expectedAnswer.length === candidateAnswer.length &&
                        expectedAnswer.every(item => candidateAnswer.includes(item));
                } else if (typeof expectedAnswer === 'string' && typeof candidateAnswer === 'string') {
                    isCorrect = candidateAnswer.trim().toLowerCase() === expectedAnswer.trim().toLowerCase();
                } else {
                    isCorrect = candidateAnswer === expectedAnswer;
                }

                let pointsEarned = 0;
                if (isCorrect) {
                    pointsEarned = qPoints;
                    correctCount++;
                } else if (negativeMarking) {
                    pointsEarned = -1 * (qPoints * negativeFactor);
                }

                totalEarnedScore += pointsEarned;
                categoryStats[qCategory].earned += pointsEarned;

                questionResults[qId] = {
                    questionId: qId,
                    type: qType,
                    category: qCategory,
                    pointsEarned,
                    maxPoints: qPoints,
                    isCorrect,
                    isAttempted: true,
                    userAnswer: candidateAnswer,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation
                };
            } else {
                questionResults[qId] = {
                    questionId: qId,
                    type: qType,
                    category: qCategory,
                    pointsEarned: 0,
                    maxPoints: qPoints,
                    isCorrect: false,
                    isAttempted: false,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation
                };
            }
        }
    }

    // Format totals & percentages
    const finalScore = Math.max(0, Math.round(totalEarnedScore * 100) / 100);
    const percentage = maxPossibleScore > 0 ? Math.round((finalScore / maxPossibleScore) * 1000) / 10 : 0;
    const passingScore = assessment.passingScore || 60;
    const passed = percentage >= passingScore;
    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 1000) / 10 : 0;

    // Category breakdown
    const categoryScores: Record<string, { earned: number; max: number; percentage: number }> = {};
    for (const [cat, stat] of Object.entries(categoryStats)) {
        const catEarned = Math.max(0, Math.round(stat.earned * 100) / 100);
        const catPct = stat.max > 0 ? Math.round((catEarned / stat.max) * 1000) / 10 : 0;
        categoryScores[cat] = {
            earned: catEarned,
            max: stat.max,
            percentage: catPct
        };
    }

    // Integrity scoring & metrics
    const tabSwitchCount = integrityEvents.filter(e => e.type === 'TAB_SWITCH' || e.type === 'WINDOW_BLUR').length;
    const fullscreenExitCount = integrityEvents.filter(e => e.type === 'FULLSCREEN_EXIT').length;
    const integrityPenalty = (tabSwitchCount * 5) + (fullscreenExitCount * 10);
    const integrityScore = Math.max(0, 100 - integrityPenalty);

    const timeTakenSeconds = Math.max(1, Math.round((submittedAt.getTime() - startedAt.getTime()) / 1000));

    return {
        score: finalScore,
        maxScore: maxPossibleScore,
        percentage,
        passed,
        accuracy,
        attemptedCount,
        correctCount,
        totalQuestions: questions.length,
        categoryScores,
        questionResults,
        codingEvaluations,
        integrityScore,
        tabSwitchCount,
        fullscreenExitCount,
        timeTakenSeconds
    };
}
