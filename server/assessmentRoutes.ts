/**
 * server/assessmentRoutes.ts
 * Production-Grade Assessment Management System Routes
 */

import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import {
    AssessmentModel,
    AssessmentAttemptModel,
    AssessmentQuestionBankModel,
    ProblemModel,
    UserModel,
    NotificationModel
} from './models.js';
import { SEED_QUESTION_BANK } from './data/assessmentQuestionBank.js';
import { PROBLEM_DATASET } from '../shared/problemDataset.js';
import { evaluateAssessmentAttempt } from './services/assessmentScoring.service.js';
import { sendAssessmentAssignedEmail } from './email.service.js';
import { executeCodeSolution, runJavaScriptLocally } from './services/codeRunner.service.js';
import axios from 'axios';

export const assessmentRouter = Router();
export const adminAssessmentRouter = Router();

const REMOTE_CODE_EXEC_BASE = process.env.CODE_EXECUTION_URL || 'https://code-execution-backend-qq01.onrender.com';

// ── Authentication Middleware for Candidate Actions ──────────────────────────
export function requireCandidateAuth(req: any, res: any, next: any) {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Authentication required. Please sign in to access this assessment.' });
    }
    next();
}

// ── Helper: Seed Question Bank on First Access ─────────────────────────────────
async function ensureQuestionBankSeeded() {
    try {
        const count = await AssessmentQuestionBankModel.countDocuments();
        if (count === 0) {
            console.log('[Assessment] Seeding centralized question bank...');
            await AssessmentQuestionBankModel.insertMany(SEED_QUESTION_BANK);
            console.log(`[Assessment] Seeded ${SEED_QUESTION_BANK.length} questions into Question Bank.`);
        }
    } catch (err: any) {
        console.warn('[Assessment] Seed question bank skipped/error:', err.message);
    }
}
ensureQuestionBankSeeded();

// ── Helper: Generate Cryptographically Secure Share Token ─────────────────────
function generateSecureShareToken(): string {
    return crypto.randomBytes(12).toString('hex'); // 24-char hex string
}

// ── Helper: Sanitize Question for Candidate (Strip answers & hidden tests) ─────
function sanitizeQuestionForCandidate(q: any, index: number) {
    const plain = q.toObject ? q.toObject() : { ...q };
    delete plain.correctAnswer;
    delete plain.explanation;
    delete plain.hiddenTestCases;
    return {
        ...plain,
        order: index + 1,
        id: plain.id || plain._id?.toString() || `q_${index + 1}`
    };
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. ADMIN ASSESSMENT ENDPOINTS (`/api/admin/assessments`)
// ═════════════════════════════════════════════════════════════════════════════

// ── GET /api/admin/assessments — List all assessments with summary metrics ─────
adminAssessmentRouter.get('/', async (req: Request, res: Response) => {
    try {
        const assessments = await AssessmentModel.find().sort({ createdAt: -1 });
        const assessmentIds = assessments.map(a => a._id.toString());

        // Aggregate attempts
        const attempts = await AssessmentAttemptModel.find({
            assessmentId: { $in: assessmentIds }
        }).select('assessmentId status score maxScore percentage timeTakenSeconds passed');

        // Calculate global metrics
        const totalAssessments = assessments.length;
        const activeAssessments = assessments.filter(a => a.status === 'published').length;
        const completedAttempts = attempts.filter(att => att.status === 'completed');
        const completedAssessmentsCount = assessments.filter(a => a.status === 'closed').length;
        const totalParticipants = attempts.length;

        const avgScore = completedAttempts.length > 0
            ? Math.round(completedAttempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / completedAttempts.length)
            : 0;

        const avgCompletionTimeSeconds = completedAttempts.length > 0
            ? Math.round(completedAttempts.reduce((acc, curr) => acc + (curr.timeTakenSeconds || 0), 0) / completedAttempts.length)
            : 0;

        // Group stats per assessment card
        const cardData = assessments.map(ass => {
            const aId = ass._id.toString();
            const assAttempts = attempts.filter(att => att.assessmentId === aId);
            const assCompleted = assAttempts.filter(att => att.status === 'completed');
            const assAvgScore = assCompleted.length > 0
                ? Math.round(assCompleted.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / assCompleted.length)
                : 0;

            return {
                id: aId,
                title: ass.title,
                description: ass.description,
                createdBy: ass.creatorName || 'Admin',
                duration: ass.duration,
                passingScore: ass.passingScore,
                questionCount: ass.questions?.length || 0,
                totalPoints: ass.totalPoints || (ass.questions || []).reduce((sum: number, q: any) => sum + (q.points || 0), 0),
                status: ass.status,
                accessMode: ass.accessMode,
                shareToken: ass.shareToken,
                assignedCount: (ass.assignedUserIds?.length || 0) + (ass.assignedEmails?.length || 0),
                participantsCount: assAttempts.length,
                completedCount: assCompleted.length,
                averageScore: assAvgScore,
                startAt: ass.startAt,
                endAt: ass.endAt,
                createdAt: ass.createdAt
            };
        });

        res.json({
            metrics: {
                totalAssessments,
                activeAssessments,
                completedAssessments: completedAssessmentsCount,
                totalParticipants,
                averageScore: avgScore,
                averageCompletionTimeSeconds: avgCompletionTimeSeconds,
            },
            assessments: cardData
        });
    } catch (err: any) {
        console.error('[AdminAssessment] GET / error:', err);
        res.status(500).json({ error: 'Failed to fetch assessments', details: err.message });
    }
});

// ── GET /api/admin/assessments/:id — Single assessment details with answer keys ─
adminAssessmentRouter.get('/:id', async (req: Request, res: Response) => {
    try {
        const assessment = await AssessmentModel.findById(req.params.id);
        if (!assessment) {
            return res.status(404).json({ error: 'Assessment not found' });
        }
        res.json(assessment);
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to fetch assessment details', details: err.message });
    }
});

// ── POST /api/admin/assessments — Create Assessment ───────────────────────────
adminAssessmentRouter.post('/', async (req: Request, res: Response) => {
    try {
        const adminUser = (req as any).user || (req as any).adminUser || {};
        const {
            title,
            description,
            instructions,
            duration,
            startAt,
            endAt,
            passingScore,
            maxAttempts,
            accessMode,
            settings,
            status,
            questions,
            assignedUserIds,
            assignedEmails
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'Assessment title is required' });
        }

        const shareToken = generateSecureShareToken();
        const parsedQuestions = (questions || []).map((q: any, idx: number) => ({
            id: q.id || `q_${Date.now()}_${idx + 1}`,
            questionId: q.questionId,
            title: q.title || `Question ${idx + 1}`,
            description: q.description || '',
            category: q.category || 'Technical',
            questionType: q.questionType || 'mcq',
            difficulty: q.difficulty || 'Medium',
            points: Number(q.points) || 10,
            order: idx + 1,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || '',
            functionName: q.functionName || 'solution',
            params: q.params || [],
            starterCode: q.starterCode || {},
            testCases: q.testCases || [],
            hiddenTestCases: q.hiddenTestCases || [],
            timeLimit: q.timeLimit || 2,
            memoryLimit: q.memoryLimit || 256,
            tags: q.tags || []
        }));

        const totalPoints = parsedQuestions.reduce((sum: number, q: any) => sum + (q.points || 0), 0);

        const newAssessment = await AssessmentModel.create({
            title: title.trim(),
            description: description || '',
            instructions: instructions || '',
            createdBy: adminUser.id || 'admin',
            creatorName: adminUser.name || adminUser.username || 'Admin',
            duration: Number(duration) || 60,
            startAt: startAt ? new Date(startAt) : null,
            endAt: endAt ? new Date(endAt) : null,
            passingScore: Number(passingScore) || 60,
            maxAttempts: Number(maxAttempts) || 1,
            accessMode: accessMode || 'authenticated',
            shareToken,
            assignedUserIds: assignedUserIds || [],
            assignedEmails: assignedEmails || [],
            settings: {
                requireFullscreen: settings?.requireFullscreen !== false,
                trackTabSwitches: settings?.trackTabSwitches !== false,
                randomizeQuestions: !!settings?.randomizeQuestions,
                randomizeOptions: !!settings?.randomizeOptions,
                showResultsImmediately: settings?.showResultsImmediately !== false,
                negativeMarking: !!settings?.negativeMarking,
                negativeMarkingFactor: Number(settings?.negativeMarkingFactor) || 0.25
            },
            status: status || 'published',
            questions: parsedQuestions,
            totalPoints,
            questionCount: parsedQuestions.length
        });

        res.status(201).json(newAssessment);
    } catch (err: any) {
        console.error('[AdminAssessment] POST / error:', err);
        res.status(500).json({ error: 'Failed to create assessment', details: err.message });
    }
});

// ── PUT /api/admin/assessments/:id — Update Assessment ────────────────────────
adminAssessmentRouter.put('/:id', async (req: Request, res: Response) => {
    try {
        const {
            title,
            description,
            instructions,
            duration,
            startAt,
            endAt,
            passingScore,
            maxAttempts,
            accessMode,
            settings,
            status,
            questions,
            assignedUserIds,
            assignedEmails
        } = req.body;

        const assessment = await AssessmentModel.findById(req.params.id);
        if (!assessment) {
            return res.status(404).json({ error: 'Assessment not found' });
        }

        if (title) assessment.title = title.trim();
        if (description !== undefined) assessment.description = description;
        if (instructions !== undefined) assessment.instructions = instructions;
        if (duration) assessment.duration = Number(duration);
        if (startAt !== undefined) assessment.startAt = startAt ? new Date(startAt) : null;
        if (endAt !== undefined) assessment.endAt = endAt ? new Date(endAt) : null;
        if (passingScore !== undefined) assessment.passingScore = Number(passingScore);
        if (maxAttempts !== undefined) assessment.maxAttempts = Number(maxAttempts);
        if (accessMode) assessment.accessMode = accessMode;
        if (status) assessment.status = status;
        if (assignedUserIds) assessment.assignedUserIds = assignedUserIds;
        if (assignedEmails) assessment.assignedEmails = assignedEmails;

        if (settings) {
            assessment.settings = {
                requireFullscreen: settings.requireFullscreen !== false,
                trackTabSwitches: settings.trackTabSwitches !== false,
                randomizeQuestions: !!settings.randomizeQuestions,
                randomizeOptions: !!settings.randomizeOptions,
                showResultsImmediately: settings.showResultsImmediately !== false,
                negativeMarking: !!settings.negativeMarking,
                negativeMarkingFactor: Number(settings.negativeMarkingFactor) || 0.25
            };
        }

        if (questions && Array.isArray(questions)) {
            assessment.questions = questions.map((q: any, idx: number) => ({
                id: q.id || `q_${Date.now()}_${idx + 1}`,
                questionId: q.questionId,
                title: q.title || `Question ${idx + 1}`,
                description: q.description || '',
                category: q.category || 'Technical',
                questionType: q.questionType || 'mcq',
                difficulty: q.difficulty || 'Medium',
                points: Number(q.points) || 10,
                order: idx + 1,
                options: q.options || [],
                correctAnswer: q.correctAnswer,
                explanation: q.explanation || '',
                functionName: q.functionName || 'solution',
                params: q.params || [],
                starterCode: q.starterCode || {},
                testCases: q.testCases || [],
                hiddenTestCases: q.hiddenTestCases || [],
                timeLimit: q.timeLimit || 2,
                memoryLimit: q.memoryLimit || 256,
                tags: q.tags || []
            })) as any;

            assessment.totalPoints = (assessment.questions as any[]).reduce((sum, q) => sum + (q.points || 0), 0);
            assessment.questionCount = assessment.questions.length;
        }

        assessment.updatedAt = new Date();
        await assessment.save();

        res.json(assessment);
    } catch (err: any) {
        console.error('[AdminAssessment] PUT /:id error:', err);
        res.status(500).json({ error: 'Failed to update assessment', details: err.message });
    }
});

// ── POST /api/admin/assessments/:id/duplicate — Clone Assessment ───────────────
adminAssessmentRouter.post('/:id/duplicate', async (req: Request, res: Response) => {
    try {
        const original = await AssessmentModel.findById(req.params.id);
        if (!original) {
            return res.status(404).json({ error: 'Original assessment not found' });
        }

        const raw = original.toObject();
        delete (raw as any)._id;
        delete (raw as any).createdAt;
        delete (raw as any).updatedAt;

        raw.title = `${original.title} (Copy)`;
        raw.shareToken = generateSecureShareToken();
        raw.status = 'draft';

        const duplicate = await AssessmentModel.create(raw);
        res.status(201).json(duplicate);
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to duplicate assessment', details: err.message });
    }
});

// ── PATCH /api/admin/assessments/:id/status — Toggle status ───────────────────
adminAssessmentRouter.patch('/:id/status', async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        if (!['draft', 'published', 'closed', 'archived'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const assessment = await AssessmentModel.findByIdAndUpdate(
            req.params.id,
            { status, updatedAt: new Date() },
            { new: true }
        );
        if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

        res.json(assessment);
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to update status', details: err.message });
    }
});

// ── DELETE /api/admin/assessments/:id — Delete assessment & attempts ─────────
adminAssessmentRouter.delete('/:id', async (req: Request, res: Response) => {
    try {
        const assessment = await AssessmentModel.findByIdAndDelete(req.params.id);
        if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

        await AssessmentAttemptModel.deleteMany({ assessmentId: req.params.id });
        res.json({ success: true, message: 'Assessment and all associated attempts deleted.' });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to delete assessment', details: err.message });
    }
});

// ── POST /api/admin/assessments/:id/assign — Assign to users with notification ─
adminAssessmentRouter.post('/:id/assign', async (req: Request, res: Response) => {
    try {
        const { userIds, emails, sendEmailNotification } = req.body;
        const assessment = await AssessmentModel.findById(req.params.id);
        if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

        const updatedUserIds = Array.from(new Set([...(assessment.assignedUserIds || []), ...(userIds || [])]));
        const updatedEmails = Array.from(new Set([...(assessment.assignedEmails || []), ...(emails || [])]));

        assessment.assignedUserIds = updatedUserIds;
        assessment.assignedEmails = updatedEmails;
        assessment.updatedAt = new Date();
        await assessment.save();

        // Send Email & in-app notifications if requested
        if (sendEmailNotification !== false) {
            const deadlineFormatted = assessment.endAt
                ? new Date(assessment.endAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                : null;

            // 1. Send to registered users
            const targetUsers = await UserModel.find({
                $or: [
                    { _id: { $in: updatedUserIds } },
                    { email: { $in: updatedEmails } }
                ]
            }).select('email username name');

            const notifiedEmails = new Set<string>();

            for (const u of targetUsers) {
                if (u.email) {
                    notifiedEmails.add(u.email.toLowerCase());
                    sendAssessmentAssignedEmail(
                        u.email,
                        u.name || u.username || 'Candidate',
                        assessment.title,
                        assessment.duration,
                        assessment.questions.length,
                        deadlineFormatted,
                        assessment.shareToken
                    ).catch(() => {});
                }
            }

            // 2. Also send to all invited external emails / Gmail candidates not yet registered
            for (const email of updatedEmails) {
                const clean = email.toLowerCase().trim();
                if (clean && !notifiedEmails.has(clean)) {
                    notifiedEmails.add(clean);
                    sendAssessmentAssignedEmail(
                        clean,
                        clean.split('@')[0],
                        assessment.title,
                        assessment.duration,
                        assessment.questions.length,
                        deadlineFormatted,
                        assessment.shareToken
                    ).catch(() => {});
                }
            }
        }

        res.json({
            success: true,
            message: `Assigned assessment to ${updatedUserIds.length} users and ${updatedEmails.length} emails. Notifications dispatched.`,
            assignedUserIds: assessment.assignedUserIds,
            assignedEmails: assessment.assignedEmails
        });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to assign assessment', details: err.message });
    }
});

// ── POST /api/admin/assessments/:id/remind — Send Contest & Assessment Reminder ─
adminAssessmentRouter.post('/:id/remind', async (req: Request, res: Response) => {
    try {
        const assessment = await AssessmentModel.findById(req.params.id);
        if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

        const deadlineFormatted = assessment.endAt
            ? new Date(assessment.endAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            : null;

        const allEmails = Array.from(new Set([...(assessment.assignedEmails || [])]));
        const targetUsers = await UserModel.find({
            $or: [
                { _id: { $in: assessment.assignedUserIds || [] } },
                { email: { $in: allEmails } }
            ]
        }).select('email username name');

        const notifiedEmails = new Set<string>();

        for (const u of targetUsers) {
            if (u.email) {
                notifiedEmails.add(u.email.toLowerCase());
                sendAssessmentAssignedEmail(
                    u.email,
                    u.name || u.username || 'Candidate',
                    `Reminder: ${assessment.title}`,
                    assessment.duration,
                    assessment.questions.length,
                    deadlineFormatted,
                    assessment.shareToken
                ).catch(() => {});
            }
        }

        for (const email of allEmails) {
            const clean = email.toLowerCase().trim();
            if (clean && !notifiedEmails.has(clean)) {
                notifiedEmails.add(clean);
                sendAssessmentAssignedEmail(
                    clean,
                    clean.split('@')[0],
                    `Reminder: ${assessment.title}`,
                    assessment.duration,
                    assessment.questions.length,
                    deadlineFormatted,
                    assessment.shareToken
                ).catch(() => {});
            }
        }

        res.json({
            success: true,
            message: `Sent reminder notifications to ${notifiedEmails.size} candidates.`,
            count: notifiedEmails.size
        });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to send reminders', details: err.message });
    }
});

// ── GET /api/admin/assessments/:id/results — Deep Analytics & Participant List ─
adminAssessmentRouter.get('/:id/results', async (req: Request, res: Response) => {
    try {
        const assessment = await AssessmentModel.findById(req.params.id);
        if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

        const attempts = await AssessmentAttemptModel.find({ assessmentId: req.params.id }).sort({ submittedAt: -1, startedAt: -1 });

        const totalInvited = (assessment.assignedUserIds?.length || 0) + (assessment.assignedEmails?.length || 0);
        const startedAttempts = attempts.filter(a => a.status === 'in_progress' || a.status === 'completed' || a.status === 'expired');
        const completedAttempts = attempts.filter(a => a.status === 'completed');

        const totalScores = completedAttempts.map(a => a.percentage || 0);
        const highestScore = totalScores.length > 0 ? Math.max(...totalScores) : 0;
        const lowestScore = totalScores.length > 0 ? Math.min(...totalScores) : 0;
        const averageScore = totalScores.length > 0 ? Math.round(totalScores.reduce((a, b) => a + b, 0) / totalScores.length) : 0;

        const completionRate = startedAttempts.length > 0 ? Math.round((completedAttempts.length / startedAttempts.length) * 100) : 0;
        const avgTimeSeconds = completedAttempts.length > 0
            ? Math.round(completedAttempts.reduce((acc, curr) => acc + (curr.timeTakenSeconds || 0), 0) / completedAttempts.length)
            : 0;

        // 1. Score Distribution Histogram (0-20, 21-40, 41-60, 61-80, 81-100)
        const scoreDistribution = [
            { range: '0-20%', count: 0 },
            { range: '21-40%', count: 0 },
            { range: '41-60%', count: 0 },
            { range: '61-80%', count: 0 },
            { range: '81-100%', count: 0 },
        ];
        completedAttempts.forEach(att => {
            const p = att.percentage || 0;
            if (p <= 20) scoreDistribution[0].count++;
            else if (p <= 40) scoreDistribution[1].count++;
            else if (p <= 60) scoreDistribution[2].count++;
            else if (p <= 80) scoreDistribution[3].count++;
            else scoreDistribution[4].count++;
        });

        // 2. Category Performance
        const categoryMap: Record<string, { totalEarned: number; totalMax: number; count: number }> = {};
        completedAttempts.forEach(att => {
            if (att.categoryScores) {
                const catObj = att.categoryScores instanceof Map ? Object.fromEntries(att.categoryScores) : att.categoryScores;
                for (const [cat, data] of Object.entries(catObj as Record<string, any>)) {
                    if (!categoryMap[cat]) categoryMap[cat] = { totalEarned: 0, totalMax: 0, count: 0 };
                    categoryMap[cat].totalEarned += data.earned || 0;
                    categoryMap[cat].totalMax += data.max || 0;
                    categoryMap[cat].count++;
                }
            }
        });
        const categoryPerformance = Object.entries(categoryMap).map(([category, d]) => ({
            category,
            averagePercentage: d.totalMax > 0 ? Math.round((d.totalEarned / d.totalMax) * 100) : 0
        }));

        // 3. Question-Level Analytics
        const questions = assessment.questions || [];
        const questionAnalytics = questions.map((q: any, idx: number) => {
            const qId = q.id || `q_${idx + 1}`;
            let attemptsCount = 0;
            let correctCount = 0;
            let incorrectCount = 0;
            let skippedCount = 0;

            completedAttempts.forEach(att => {
                const ans = att.answers?.get ? att.answers.get(qId) : (att.answers as any)?.[qId];
                const coding = att.codingSubmissions?.get ? att.codingSubmissions.get(qId) : (att.codingSubmissions as any)?.[qId];

                if (q.questionType === 'coding') {
                    if (coding && coding.code) {
                        attemptsCount++;
                        if (coding.passed) correctCount++;
                        else incorrectCount++;
                    } else {
                        skippedCount++;
                    }
                } else {
                    if (ans !== undefined && ans !== null && ans !== '') {
                        attemptsCount++;
                        const userVal = typeof ans === 'object' && 'value' in ans ? ans.value : ans;
                        if (userVal === q.correctAnswer) correctCount++;
                        else incorrectCount++;
                    } else {
                        skippedCount++;
                    }
                }
            });

            const successRate = attemptsCount > 0 ? Math.round((correctCount / attemptsCount) * 100) : 0;

            return {
                id: qId,
                title: q.title,
                category: q.category,
                type: q.questionType,
                difficulty: q.difficulty,
                points: q.points,
                attempts: attemptsCount,
                correct: correctCount,
                incorrect: incorrectCount,
                skipped: skippedCount,
                successRate
            };
        });

        // 4. Participant Results Table Data
        const participants = attempts.map(att => {
            return {
                attemptId: att._id.toString(),
                userId: att.userId,
                name: att.userName || 'Candidate',
                email: att.userEmail || '',
                status: att.status,
                score: att.score,
                maxScore: att.maxScore || assessment.totalPoints,
                percentage: att.percentage,
                passed: att.passed,
                accuracy: att.accuracy,
                attemptedCount: att.attemptedCount,
                correctCount: att.correctCount,
                totalQuestions: att.totalQuestions || questions.length,
                timeTakenSeconds: att.timeTakenSeconds,
                tabSwitchCount: att.tabSwitchCount || 0,
                fullscreenExitCount: att.fullscreenExitCount || 0,
                integrityScore: att.integrityScore || 100,
                startedAt: att.startedAt,
                submittedAt: att.submittedAt
            };
        });

        res.json({
            assessment: {
                id: assessment._id.toString(),
                title: assessment.title,
                duration: assessment.duration,
                totalPoints: assessment.totalPoints,
                passingScore: assessment.passingScore,
                shareToken: assessment.shareToken
            },
            summary: {
                totalInvited,
                started: startedAttempts.length,
                completed: completedAttempts.length,
                notStarted: Math.max(0, totalInvited - startedAttempts.length),
                averageScore,
                highestScore,
                lowestScore,
                completionRate,
                averageTimeSeconds: avgTimeSeconds
            },
            scoreDistribution,
            categoryPerformance,
            questionAnalytics,
            participants
        });
    } catch (err: any) {
        console.error('[AdminAssessment] Results error:', err);
        res.status(500).json({ error: 'Failed to compute assessment results', details: err.message });
    }
});

// ── GET /api/admin/assessments/:id/attempts/:attemptId — Individual Candidate Report
adminAssessmentRouter.get('/:id/attempts/:attemptId', async (req: Request, res: Response) => {
    try {
        const assessment = await AssessmentModel.findById(req.params.id);
        if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

        const attempt = await AssessmentAttemptModel.findById(req.params.attemptId);
        if (!attempt) return res.status(404).json({ error: 'Attempt record not found' });

        const user = await UserModel.findById(attempt.userId).select('username name email profileImage');

        res.json({
            assessment: {
                id: assessment._id.toString(),
                title: assessment.title,
                duration: assessment.duration,
                passingScore: assessment.passingScore,
                totalPoints: assessment.totalPoints,
                questions: assessment.questions
            },
            attempt,
            userProfile: user
        });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to fetch candidate attempt report', details: err.message });
    }
});

function toCamelCase(str: string): string {
    return str
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .split(' ')
        .filter(Boolean)
        .map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join('');
}

function mapLeetCodeToAssessmentQuestion(p: any): any {
    const fnName = toCamelCase(p.name || p.title || 'solution');
    const rawDiff = p.difficulty || 'Medium';
    const diff = rawDiff.charAt(0).toUpperCase() + rawDiff.slice(1).toLowerCase();
    const points = diff === 'Easy' ? 10 : diff === 'Medium' ? 20 : 30;
    const numPrefix = p.number ? `LC #${p.number}: ` : p.leetcodeId ? `LC #${p.leetcodeId}: ` : '';

    const starterCode = {
        javascript: `/**\n * @param {any} input\n * @return {any}\n */\nfunction ${fnName}(...args) {\n    // Write your solution here\n    \n}`,
        python: `class Solution:\n    def ${fnName}(self, *args):\n        # Write your solution here\n        pass\n`,
        java: `class Solution {\n    public Object ${fnName}(Object... args) {\n        // Write your solution here\n        return null;\n    }\n}`,
        cpp: `#include <iostream>\n#include <vector>\n#include <string>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    void ${fnName}() {\n        // Write your solution here\n    }\n};`
    };

    const testCases = (p.testCases && p.testCases.length > 0) ? p.testCases : [
        { input: [1, 2, 3], expectedOutput: [1, 2, 3], description: "Sample case 1" },
        { input: [4, 5, 6], expectedOutput: [4, 5, 6], description: "Sample case 2" }
    ];

    const description = p.description || `Given the problem requirements for **${p.name || p.title}**, implement an optimal solution with proper time and space complexity.\n\n### Topic\n${p.topic || 'DSA'}\n\n### Tags\n${(p.tags || []).join(', ')}`;

    return {
        id: `lc_${p.number || p.leetcodeId || p.id || p._id || p.slug || fnName}`,
        questionId: `lc_${p.number || p.leetcodeId || p.id || p._id || p.slug || fnName}`,
        title: `${numPrefix}${p.name || p.title}`,
        description,
        category: 'DSA',
        questionType: 'coding',
        difficulty: diff,
        points,
        functionName: fnName,
        starterCode,
        testCases,
        tags: ['LeetCode', p.topic, ...(p.tags || [])].filter(Boolean),
        source: 'LeetCode',
        leetcodeNumber: p.number || p.leetcodeId
    };
}

// ── GET /api/admin/question-bank — Explore Central Question Bank ───────────────
adminAssessmentRouter.get('/question-bank/all', async (req: Request, res: Response) => {
    try {
        const { category, difficulty, type, search, source = 'all', topic } = req.query as Record<string, string>;
        let results: any[] = [];

        // 1. Fetch from LeetCode Dataset if requested or source === 'all'
        if (source === 'all' || source === 'leetcode') {
            let lcList = PROBLEM_DATASET.map(mapLeetCodeToAssessmentQuestion);

            // Also check MongoDB ProblemModel for additional scraped LeetCode problems
            try {
                const dbProblems = await ProblemModel.find({}).limit(100).lean();
                if (dbProblems && dbProblems.length > 0) {
                    const mappedDb = dbProblems.map(mapLeetCodeToAssessmentQuestion);
                    // Deduplicate by title
                    const existingTitles = new Set(lcList.map(l => l.title.toLowerCase()));
                    for (const dp of mappedDb) {
                        if (!existingTitles.has(dp.title.toLowerCase())) {
                            lcList.push(dp);
                            existingTitles.add(dp.title.toLowerCase());
                        }
                    }
                }
            } catch (e) {
                // Ignore DB problem lookup error if collection empty
            }

            // Filter LeetCode problems
            if (topic && topic !== 'All') {
                lcList = lcList.filter(l => l.tags.some((t: string) => t.toLowerCase() === topic.toLowerCase()));
            }
            if (difficulty && difficulty !== 'All') {
                lcList = lcList.filter(l => l.difficulty.toLowerCase() === difficulty.toLowerCase());
            }
            if (search) {
                const s = search.toLowerCase();
                lcList = lcList.filter(l =>
                    l.title.toLowerCase().includes(s) ||
                    l.description.toLowerCase().includes(s) ||
                    l.tags.some((t: string) => t.toLowerCase().includes(s))
                );
            }

            results.push(...lcList);
        }

        // 2. Fetch Core Engineering / MCQ Questions if source === 'all' or source === 'core'
        if (source === 'all' || source === 'core') {
            const query: any = {};
            if (category && category !== 'All') query.category = category;
            if (difficulty && difficulty !== 'All') query.difficulty = difficulty;
            if (type && type !== 'All') query.questionType = type;
            if (search) {
                query.$or = [
                    { title: { $regex: String(search), $options: 'i' } },
                    { description: { $regex: String(search), $options: 'i' } },
                    { tags: { $in: [new RegExp(String(search), 'i')] } }
                ];
            }

            let coreQuestions = await AssessmentQuestionBankModel.find(query).sort({ createdAt: -1 }).lean();
            if (coreQuestions.length === 0 && Object.keys(query).length === 0) {
                coreQuestions = SEED_QUESTION_BANK as any;
            }

            // Tag core questions
            const mappedCore = (coreQuestions || []).map((q: any) => ({
                ...q,
                id: q._id ? q._id.toString() : q.id,
                source: 'Core'
            }));

            results.push(...mappedCore);
        }

        // Filter by category if specific non-All category requested
        if (category && category !== 'All') {
            results = results.filter(q => q.category.toLowerCase() === category.toLowerCase());
        }

        res.json({ questions: results, count: results.length });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to query question bank', details: err.message });
    }
});

// ── GET /api/admin/question-bank/leetcode — Specifically query LeetCode dataset
adminAssessmentRouter.get('/question-bank/leetcode', async (req: Request, res: Response) => {
    try {
        const { topic, difficulty, search } = req.query as Record<string, string>;
        let lcList = PROBLEM_DATASET.map(mapLeetCodeToAssessmentQuestion);

        if (topic && topic !== 'All') {
            lcList = lcList.filter(l => l.tags.some((t: string) => t.toLowerCase() === topic.toLowerCase()));
        }
        if (difficulty && difficulty !== 'All') {
            lcList = lcList.filter(l => l.difficulty.toLowerCase() === difficulty.toLowerCase());
        }
        if (search) {
            const s = search.toLowerCase();
            lcList = lcList.filter(l =>
                l.title.toLowerCase().includes(s) ||
                l.description.toLowerCase().includes(s) ||
                l.tags.some((t: string) => t.toLowerCase().includes(s))
            );
        }

        res.json({ questions: lcList, count: lcList.length });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to query LeetCode question bank', details: err.message });
    }
});

// ── POST /api/admin/question-bank — Add Custom Question to Bank ────────────────
adminAssessmentRouter.post('/question-bank/add', async (req: Request, res: Response) => {
    try {
        const questionData = req.body;
        if (!questionData.title || !questionData.category) {
            return res.status(400).json({ error: 'Title and category are required' });
        }

        const created = await AssessmentQuestionBankModel.create(questionData);
        res.status(201).json(created);
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to save question to bank', details: err.message });
    }
});

// ═════════════════════════════════════════════════════════════════════════════
// 2. CANDIDATE & PUBLIC ASSESSMENT ENDPOINTS (`/api/assessments`)
// ═════════════════════════════════════════════════════════════════════════

// ── GET /api/assessments/my — List candidate's assigned assessments ───────────
assessmentRouter.get('/my', requireCandidateAuth, async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const userEmail = req.user.email?.toLowerCase();

        // 1. Find assessments assigned to this user
        const assessments = await AssessmentModel.find({
            $or: [
                { accessMode: 'public' },
                { assignedUserIds: userId },
                { assignedEmails: userEmail }
            ],
            status: { $in: ['published', 'closed'] }
        }).sort({ createdAt: -1 });

        // 2. Find attempts by this user
        const attempts = await AssessmentAttemptModel.find({ userId }).sort({ startedAt: -1 });

        const data = assessments.map(ass => {
            const assAttempts = attempts.filter(att => att.assessmentId === ass._id.toString());
            const latestAttempt = assAttempts[0] || null;

            return {
                id: ass._id.toString(),
                title: ass.title,
                description: ass.description,
                duration: ass.duration,
                questionCount: ass.questions?.length || 0,
                totalPoints: ass.totalPoints,
                passingScore: ass.passingScore,
                startAt: ass.startAt,
                endAt: ass.endAt,
                shareToken: ass.shareToken,
                status: ass.status,
                attemptStatus: latestAttempt ? latestAttempt.status : 'not_started',
                attemptScore: latestAttempt ? latestAttempt.percentage : null,
                attemptPassed: latestAttempt ? latestAttempt.passed : null,
                attemptId: latestAttempt ? latestAttempt._id.toString() : null
            };
        });

        res.json({ assessments: data });
    } catch (err: any) {
        console.error('[CandidateAssessment] GET /my error:', err);
        res.status(500).json({ error: 'Failed to fetch your assessments', details: err.message });
    }
});

// ── GET /api/assessments/preview/:token & /public/:token — Public assessment landing info ───
const handleAssessmentPreview = async (req: Request, res: Response) => {
    try {
        const token = String(req.params.token || '');
        const isMongoId = /^[0-9a-fA-F]{24}$/.test(token);
        const assessment = await AssessmentModel.findOne({
            $or: [{ shareToken: token }, { _id: isMongoId ? token : null }]
        });

        if (!assessment) {
            return res.status(404).json({ error: 'Assessment not found or invalid link.' });
        }

        const now = new Date();
        let availabilityStatus = 'available';
        if (assessment.status !== 'published') {
            availabilityStatus = assessment.status === 'draft' ? 'draft' : 'closed';
        } else if (assessment.startAt && now < new Date(assessment.startAt)) {
            availabilityStatus = 'upcoming';
        } else if (assessment.endAt && now > new Date(assessment.endAt)) {
            availabilityStatus = 'expired';
        }

        // Collect unique categories
        const categories = Array.from(new Set((assessment.questions || []).map((q: any) => q.category)));

        res.json({
            id: assessment._id.toString(),
            title: assessment.title,
            description: assessment.description,
            instructions: assessment.instructions,
            duration: assessment.duration || 60,
            questionCount: assessment.questions?.length || 0,
            totalPoints: assessment.totalPoints || 50,
            passingScore: assessment.passingScore || 60,
            accessMode: assessment.accessMode || 'public',
            requireFullscreen: assessment.settings?.requireFullscreen !== false,
            startAt: assessment.startAt,
            endAt: assessment.endAt,
            availabilityStatus,
            categories: categories.length > 0 ? categories : ['DSA', 'Problem Solving'],
            creatorName: assessment.creatorName || 'AlgoAscent'
        });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to load assessment preview', details: err.message });
    }
};

assessmentRouter.get('/preview/:token', handleAssessmentPreview);
assessmentRouter.get('/public/:token', handleAssessmentPreview);

// ── POST /api/assessments/:token/start — Start / Resume Attempt ────────────────
assessmentRouter.post('/:token/start', async (req: any, res: Response) => {
    try {
        const { token } = req.params;
        const assessment = await AssessmentModel.findOne({ shareToken: token });

        if (!assessment) {
            return res.status(404).json({ error: 'Assessment not found' });
        }

        // Check window & status
        const now = new Date();
        if (assessment.status !== 'published') {
            return res.status(403).json({ error: 'This assessment is currently closed or in draft mode.' });
        }
        if (assessment.startAt && now < new Date(assessment.startAt)) {
            return res.status(403).json({ error: 'This assessment has not started yet.' });
        }
        if (assessment.endAt && now > new Date(assessment.endAt)) {
            return res.status(403).json({ error: 'This assessment deadline has passed.' });
        }

        // Candidate identification
        let userId = req.user?.id;
        let userName = req.user?.name || req.user?.username || req.body.candidateName || req.body.name || 'Candidate';
        let userEmail = (req.user?.email || req.body.candidateEmail || req.body.email || '').trim().toLowerCase();

        const DUMMY_DOMAINS = ['example.com', 'test.com', 'dummy.com', 'mailinator.com', 'tempmail.com', '10minutemail.com', 'throwaway.com', 'fakemail.com', 'test.org', 'test.net', 'sample.com', 'invalid.com', 'demo.com'];
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (userEmail) {
            const domain = userEmail.split('@')[1];
            if (!emailRegex.test(userEmail) || DUMMY_DOMAINS.includes(domain)) {
                return res.status(400).json({ error: 'Please provide a valid Gmail or verified account email. Dummy or disposable emails are not permitted.' });
            }
        } else if (assessment.accessMode === 'public') {
            return res.status(400).json({ error: 'Valid Gmail or account email is required to participate.' });
        }

        if (assessment.accessMode === 'authenticated' || assessment.accessMode === 'private') {
            if (!userId) {
                return res.status(401).json({ error: 'You must be logged in to access this assessment.' });
            }
        }

        // Check private permission
        if (assessment.accessMode === 'private') {
            const isAssignedUser = assessment.assignedUserIds?.includes(userId);
            const isAssignedEmail = userEmail && assessment.assignedEmails?.includes(userEmail);
            if (!isAssignedUser && !isAssignedEmail) {
                return res.status(403).json({ error: 'You are not authorized to take this private assessment.' });
            }
        }

        userId = userId || `guest_${Date.now()}`;

        // Check existing attempts
        const existingAttempts = await AssessmentAttemptModel.find({
            assessmentId: assessment._id.toString(),
            userId
        }).sort({ startedAt: -1 });

        // Resume active attempt if still running
        const activeAttempt = existingAttempts.find(a => a.status === 'in_progress');
        if (activeAttempt) {
            // Check if server time has expired
            if (now > new Date(activeAttempt.expiresAt)) {
                activeAttempt.status = 'expired';
                await activeAttempt.save();
            } else {
                // Return active session
                const sanitizedQuestions = assessment.questions.map((q: any, idx: number) =>
                    sanitizeQuestionForCandidate(q, idx)
                );

                return res.json({
                    attemptId: activeAttempt._id.toString(),
                    assessmentTitle: assessment.title,
                    durationMinutes: assessment.duration,
                    startedAt: activeAttempt.startedAt,
                    expiresAt: activeAttempt.expiresAt,
                    serverTime: new Date(),
                    savedAnswers: activeAttempt.answers || {},
                    savedCodingSubmissions: activeAttempt.codingSubmissions || {},
                    questions: sanitizedQuestions,
                    settings: assessment.settings
                });
            }
        }

        // Check max attempts
        const completedCount = existingAttempts.filter(a => a.status === 'completed' || a.status === 'expired').length;
        if (completedCount >= (assessment.maxAttempts || 1)) {
            return res.status(403).json({
                error: `You have reached the maximum allowed attempts (${assessment.maxAttempts || 1}) for this assessment.`
            });
        }

        // Create new attempt
        const durationMinutes = assessment.duration || 60;
        const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

        // Build stable question order snapshot
        let questionList = [...(assessment.questions || [])];
        if (assessment.settings?.randomizeQuestions) {
            questionList.sort(() => Math.random() - 0.5);
        }

        const questionOrder = questionList.map((q: any) => q.id || q._id?.toString());

        const newAttempt = await AssessmentAttemptModel.create({
            assessmentId: assessment._id.toString(),
            userId,
            userName,
            userEmail,
            status: 'in_progress',
            startedAt: new Date(),
            expiresAt,
            questionOrder,
            answers: {},
            codingSubmissions: {},
            totalQuestions: questionList.length,
            integrityEvents: []
        });

        const sanitizedQuestions = questionList.map((q: any, idx: number) =>
            sanitizeQuestionForCandidate(q, idx)
        );

        res.status(201).json({
            attemptId: newAttempt._id.toString(),
            assessmentTitle: assessment.title,
            durationMinutes: assessment.duration,
            startedAt: newAttempt.startedAt,
            expiresAt: newAttempt.expiresAt,
            serverTime: new Date(),
            savedAnswers: {},
            savedCodingSubmissions: {},
            questions: sanitizedQuestions,
            settings: assessment.settings
        });
    } catch (err: any) {
        console.error('[CandidateAssessment] POST /start error:', err);
        res.status(500).json({ error: 'Failed to start assessment attempt', details: err.message });
    }
});

// ── POST /api/assessments/attempts/:attemptId/save-answer — Real-time Auto-save ─
assessmentRouter.post('/attempts/:attemptId/save-answer', async (req: Request, res: Response) => {
    try {
        const { questionId, value, codingSubmission, timeSpentSeconds } = req.body;
        const attempt = await AssessmentAttemptModel.findById(req.params.attemptId);

        if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
        if (attempt.status !== 'in_progress') {
            return res.status(400).json({ error: 'Attempt is already submitted or locked.' });
        }

        // Server authoritative expiration check
        if (new Date() > new Date(attempt.expiresAt)) {
            attempt.status = 'expired';
            await attempt.save();
            return res.status(403).json({ error: 'Assessment time has expired.' });
        }

        if (questionId) {
            if (value !== undefined) {
                attempt.answers.set(questionId, {
                    value,
                    answeredAt: new Date(),
                    timeSpentSeconds: timeSpentSeconds || 0
                });
            }
            if (codingSubmission) {
                attempt.codingSubmissions.set(questionId, codingSubmission);
            }
            attempt.updatedAt = new Date();
            await attempt.save();
        }

        res.json({ success: true, savedAt: new Date() });
    } catch (err: any) {
        res.status(500).json({ error: 'Auto-save failed', details: err.message });
    }
});

// ── POST /api/assessments/attempts/:attemptId/run-code — Sample Test Case Runner
assessmentRouter.post('/attempts/:attemptId/run-code', async (req: Request, res: Response) => {
    try {
        const { questionId, code, language } = req.body;
        const attempt = await AssessmentAttemptModel.findById(req.params.attemptId);
        if (!attempt || attempt.status !== 'in_progress') {
            return res.status(400).json({ error: 'Active attempt required.' });
        }

        const assessment = await AssessmentModel.findById(attempt.assessmentId);
        if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

        const question = assessment.questions.find((q: any) => q.id === questionId || q._id?.toString() === questionId);
        if (!question) return res.status(404).json({ error: 'Question not found' });

        const sampleTestCases = question.testCases || [];
        const execRes = await executeCodeSolution(code, language, question.functionName || 'solution', sampleTestCases);

        return res.json({
            stdout: execRes.stdout,
            stderr: execRes.stderr,
            results: execRes.results.map((r: any, idx: number) => ({
                index: idx + 1,
                input: sampleTestCases[idx]?.input,
                expectedOutput: sampleTestCases[idx]?.expectedOutput,
                actualOutput: r.output ?? r.error,
                passed: r.passed,
                status: r.status
            }))
        });
    } catch (err: any) {
        res.status(500).json({ error: 'Code execution error', details: err.message });
    }
});

// ── POST /api/assessments/attempts/:attemptId/integrity-event — Log Integrity Event ─
assessmentRouter.post('/attempts/:attemptId/integrity-event', async (req: Request, res: Response) => {
    try {
        const { type, details } = req.body;
        const attempt = await AssessmentAttemptModel.findById(req.params.attemptId);

        if (attempt && attempt.status === 'in_progress') {
            const eventType = type || 'TAB_SWITCH';
            attempt.integrityEvents.push({
                type: eventType,
                timestamp: new Date(),
                details: details || ''
            });

            if (eventType === 'TAB_SWITCH' || eventType === 'WINDOW_BLUR') {
                attempt.tabSwitchCount = (attempt.tabSwitchCount || 0) + 1;
            } else if (eventType === 'FULLSCREEN_EXIT') {
                attempt.fullscreenExitCount = (attempt.fullscreenExitCount || 0) + 1;
            }

            await attempt.save();
        }

        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to record integrity event', details: err.message });
    }
});

// ── POST /api/assessments/attempts/:attemptId/submit — Submit & Deterministic Score ─
assessmentRouter.post('/attempts/:attemptId/submit', async (req: Request, res: Response) => {
    try {
        const { finalAnswers, finalCodingSubmissions } = req.body;
        const attempt = await AssessmentAttemptModel.findById(req.params.attemptId);

        if (!attempt) return res.status(404).json({ error: 'Attempt record not found' });
        if (attempt.status === 'completed' || attempt.status === 'locked') {
            return res.json({ message: 'Assessment already submitted.', attemptId: attempt._id });
        }

        const assessment = await AssessmentModel.findById(attempt.assessmentId);
        if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

        const submittedAt = new Date();

        // Merge any final answers sent in payload
        const mergedAnswers = {
            ...(attempt.answers instanceof Map ? Object.fromEntries(attempt.answers) : (attempt.answers || {})),
            ...(finalAnswers || {})
        };
        const mergedCoding = {
            ...(attempt.codingSubmissions instanceof Map ? Object.fromEntries(attempt.codingSubmissions) : (attempt.codingSubmissions || {})),
            ...(finalCodingSubmissions || {})
        };

        // Run deterministic evaluation
        const evalResult = await evaluateAssessmentAttempt({
            assessment,
            answers: mergedAnswers,
            codingSubmissions: mergedCoding,
            integrityEvents: attempt.integrityEvents || [],
            startedAt: attempt.startedAt,
            submittedAt
        });

        // Update and Lock attempt
        attempt.status = 'completed';
        attempt.submittedAt = submittedAt;
        attempt.score = evalResult.score;
        attempt.maxScore = evalResult.maxScore;
        attempt.percentage = evalResult.percentage;
        attempt.passed = evalResult.passed;
        attempt.accuracy = evalResult.accuracy;
        attempt.attemptedCount = evalResult.attemptedCount;
        attempt.correctCount = evalResult.correctCount;
        attempt.totalQuestions = evalResult.totalQuestions;
        attempt.categoryScores = evalResult.categoryScores as any;
        attempt.timeTakenSeconds = evalResult.timeTakenSeconds;
        attempt.integrityScore = evalResult.integrityScore;
        attempt.tabSwitchCount = evalResult.tabSwitchCount;
        attempt.fullscreenExitCount = evalResult.fullscreenExitCount;
        attempt.codingSubmissions = evalResult.codingEvaluations as any;
        attempt.updatedAt = submittedAt;

        await attempt.save();

        const showResults = assessment.settings?.showResultsImmediately !== false;

        res.json({
            success: true,
            attemptId: attempt._id.toString(),
            status: 'completed',
            showResultsImmediately: showResults,
            report: showResults ? {
                score: evalResult.score,
                maxScore: evalResult.maxScore,
                percentage: evalResult.percentage,
                passed: evalResult.passed,
                accuracy: evalResult.accuracy,
                attemptedCount: evalResult.attemptedCount,
                correctCount: evalResult.correctCount,
                totalQuestions: evalResult.totalQuestions,
                categoryScores: evalResult.categoryScores,
                timeTakenSeconds: evalResult.timeTakenSeconds,
                integrityScore: evalResult.integrityScore,
                questionResults: evalResult.questionResults
            } : null
        });
    } catch (err: any) {
        console.error('[CandidateAssessment] Submit error:', err);
        res.status(500).json({ error: 'Failed to submit assessment', details: err.message });
    }
});

// ── GET /api/assessments/attempts/:attemptId/result — Fetch Result Scorecard ──
assessmentRouter.get('/attempts/:attemptId/result', async (req: Request, res: Response) => {
    try {
        const attempt = await AssessmentAttemptModel.findById(req.params.attemptId);
        if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

        const assessment = await AssessmentModel.findById(attempt.assessmentId);
        if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

        if (assessment.settings?.showResultsImmediately === false && (req as any).user?.role !== 'admin') {
            return res.json({
                attemptId: attempt._id.toString(),
                status: attempt.status,
                message: 'Your assessment has been submitted. The results will be reviewed and shared by the administrator.'
            });
        }

        res.json({
            assessmentTitle: assessment.title,
            score: attempt.score,
            maxScore: attempt.maxScore,
            percentage: attempt.percentage,
            passed: attempt.passed,
            accuracy: attempt.accuracy,
            attemptedCount: attempt.attemptedCount,
            correctCount: attempt.correctCount,
            totalQuestions: attempt.totalQuestions,
            categoryScores: attempt.categoryScores,
            timeTakenSeconds: attempt.timeTakenSeconds,
            integrityScore: attempt.integrityScore,
            tabSwitchCount: attempt.tabSwitchCount,
            fullscreenExitCount: attempt.fullscreenExitCount,
            submittedAt: attempt.submittedAt
        });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to fetch result', details: err.message });
    }
});
