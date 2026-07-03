import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { databaseAPI } from '../api/database';
import { Activity } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    activities: Activity[];
    onAddActivity: (activity: Partial<Activity>) => Promise<boolean>;
}

interface LeetCodeProblem {
    leetcodeId: number;
    title: string;
    slug: string;
    difficulty: 'easy' | 'medium' | 'hard';
    topic: string;
    description?: string;
    url?: string;
}

const TOPICS = [
    'Arrays', 'Strings', 'Dynamic Programming', 'Math', 'Greedy',
    'Graphs', 'Binary Search', 'Trees', 'Two Pointers', 'Bit Manipulation',
    'Stacks', 'Heaps', 'Sliding Window', 'Linked Lists', 'Trie',
    'Backtracking', 'Design', 'Intervals'
];

const LeetCodeQuestions: React.FC<Props> = ({ activities, onAddActivity }) => {
    const [problems, setProblems] = useState<LeetCodeProblem[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProblems, setTotalProblems] = useState(0);
    const [loading, setLoading] = useState(false);

    // Filter states
    const [search, setSearch] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [topic, setTopic] = useState('');

    // Modal state for logging a solve
    const [loggingProblem, setLoggingProblem] = useState<LeetCodeProblem | null>(null);
    const [duration, setDuration] = useState(20);
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Memoize solved titles to avoid array search inside the loop
    const solvedProblemTitles = useMemo(() => {
        return new Set(
            activities
                .filter(a => a.problemSolved)
                .map(a => (a.description || '').trim().toLowerCase())
        );
    }, [activities]);

    const fetchProblems = useCallback(async () => {
        setLoading(true);
        try {
            const res = await databaseAPI.getProblems({
                difficulty,
                topic,
                search,
                page,
                limit: 10
            });
            setProblems(res.problems);
            setTotalPages(res.pagination.pages);
            setTotalProblems(res.pagination.total);
        } catch (err) {
            console.error('Failed to fetch problems', err);
        } finally {
            setLoading(false);
        }
    }, [difficulty, topic, search, page]);

    useEffect(() => {
        fetchProblems();
    }, [fetchProblems]);

    // Reset page on filter changes
    useEffect(() => {
        setPage(1);
    }, [difficulty, topic, search]);

    const handleLogSolveSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loggingProblem) return;
        setSubmitting(true);
        try {
            const success = await onAddActivity({
                date: new Date().toISOString(),
                category: loggingProblem.topic,
                duration: duration,
                description: loggingProblem.title,
                difficulty: (loggingProblem.difficulty.charAt(0).toUpperCase() + loggingProblem.difficulty.slice(1)) as any,
                platform: 'LeetCode',
                problemSolved: true,
                notes: notes || undefined
            });
            if (success) {
                setLoggingProblem(null);
                setNotes('');
                setDuration(20);
            }
        } catch (err) {
            console.error('Failed to log solve', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="card-dark" style={{ padding: '24px', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h3 className="card-title" style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📚</span> LeetCode Problem Dataset
                    </h3>
                    <p className="kpi-sub" style={{ marginTop: '2px' }}>Browse, redirect, and track your solves directly</p>
                </div>
                <div className="kpi-sub bg-white/5 px-3 py-1 rounded-full text-xs font-semibold">
                    {totalProblems} Problems Available
                </div>
            </div>

            {/* Filters Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                {/* Search */}
                <div>
                    <input
                        type="text"
                        placeholder="Search questions..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '10px',
                            padding: '10px 14px',
                            color: '#fff',
                            fontSize: '0.85rem',
                            outline: 'none',
                        }}
                    />
                </div>

                {/* Difficulty */}
                <div>
                    <select
                        value={difficulty}
                        onChange={e => setDifficulty(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '10px',
                            padding: '10px 14px',
                            color: '#fff',
                            fontSize: '0.85rem',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="" style={{ background: '#0c0c0c' }}>All Difficulties</option>
                        <option value="easy" style={{ background: '#0c0c0c' }}>Easy</option>
                        <option value="medium" style={{ background: '#0c0c0c' }}>Medium</option>
                        <option value="hard" style={{ background: '#0c0c0c' }}>Hard</option>
                    </select>
                </div>

                {/* Topic */}
                <div>
                    <select
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '10px',
                            padding: '10px 14px',
                            color: '#fff',
                            fontSize: '0.85rem',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="" style={{ background: '#0c0c0c' }}>All Topics</option>
                        {TOPICS.map(t => (
                            <option key={t} value={t} style={{ background: '#0c0c0c' }}>{t}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Questions Table/List */}
            <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <th style={{ padding: '12px 16px', color: '#888', fontWeight: 600 }}>ID</th>
                            <th style={{ padding: '12px 16px', color: '#888', fontWeight: 600 }}>Title</th>
                            <th style={{ padding: '12px 16px', color: '#888', fontWeight: 600 }}>Topic</th>
                            <th style={{ padding: '12px 16px', color: '#888', fontWeight: 600 }}>Difficulty</th>
                            <th style={{ padding: '12px 16px', color: '#888', fontWeight: 600, textAlign: 'center' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#555' }}>
                                    <div className="animate-pulse">Loading LeetCode questions...</div>
                                </td>
                            </tr>
                        ) : problems.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#555' }}>
                                    No problems matched the search criteria.
                                </td>
                            </tr>
                        ) : (
                            problems.map(problem => {
                                const isSolved = solvedProblemTitles.has(problem.title.trim().toLowerCase());
                                return (
                                    <tr
                                        key={problem.leetcodeId}
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}
                                        className="hover:bg-white/[0.01]"
                                    >
                                        <td style={{ padding: '14px 16px', color: '#555', fontWeight: 500 }}>{problem.leetcodeId}</td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <a
                                                href={problem.url || `https://leetcode.com/problems/${problem.slug}/`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    color: '#EAEAEA',
                                                    fontWeight: 600,
                                                    textDecoration: 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}
                                                className="hover:text-gold transition-colors"
                                            >
                                                {problem.title}
                                                <span style={{ fontSize: '0.75rem', opacity: 0.4 }}>↗</span>
                                            </a>
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#888' }}>{problem.topic}</td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{
                                                fontSize: '0.72rem',
                                                padding: '2px 8px',
                                                borderRadius: '999px',
                                                fontWeight: 700,
                                                background: problem.difficulty === 'easy' ? 'rgba(34,197,94,0.1)' : problem.difficulty === 'medium' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                                                color: problem.difficulty === 'easy' ? '#22c55e' : problem.difficulty === 'medium' ? '#f59e0b' : '#ef4444',
                                                textTransform: 'capitalize'
                                            }}>
                                                {problem.difficulty}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                            {isSolved ? (
                                                <span style={{ color: '#22c55e', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                                    ✓ <span style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Solved</span>
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => setLoggingProblem(problem)}
                                                    style={{
                                                        background: 'rgba(212,175,55,0.08)',
                                                        border: '1px solid rgba(212,175,55,0.2)',
                                                        color: '#D4AF37',
                                                        padding: '4px 12px',
                                                        borderRadius: '8px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    className="hover:bg-gold hover:text-black hover:scale-105 active:scale-95"
                                                >
                                                    Mark Solved
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Row */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: page === 1 ? '#444' : '#fff',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: page === 1 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Previous
                    </button>
                    <span className="kpi-sub" style={{ fontSize: '0.78rem' }}>
                        Page {page} of {totalPages}
                    </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: page === totalPages ? '#444' : '#fff',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: page === totalPages ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Quick Log Solve Modal */}
            <AnimatePresence>
                {loggingProblem && (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.85)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1000,
                        padding: '16px'
                    }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="card-dark"
                            style={{
                                width: '100%',
                                maxWidth: '440px',
                                padding: '24px',
                                border: '1px solid rgba(212,175,55,0.25)',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.6)'
                            }}
                        >
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#EAEAEA', marginBottom: '4px' }}>
                                Log solved problem
                            </h4>
                            <p style={{ fontSize: '0.8rem', color: '#D4AF37', fontWeight: 600, marginBottom: '20px' }}>
                                {loggingProblem.title}
                            </p>

                            <form onSubmit={handleLogSolveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: '6px' }}>
                                        Time Spent (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max="600"
                                        value={duration}
                                        onChange={e => setDuration(parseInt(e.target.value, 10) || 0)}
                                        style={{
                                            width: '100%',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                            color: '#fff',
                                            fontSize: '0.85rem'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: '6px' }}>
                                        Solution Notes (Optional)
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="e.g. Spent a lot of time optimization. Space complexity is O(1)..."
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        style={{
                                            width: '100%',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                            color: '#fff',
                                            fontSize: '0.85rem',
                                            resize: 'none'
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setLoggingProblem(null)}
                                        style={{
                                            background: 'transparent',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#888',
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                        className="hover:text-white hover:border-white/20"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        style={{
                                            background: 'linear-gradient(135deg, #D4AF37, #B8960C)',
                                            border: 'none',
                                            color: '#0B0B0B',
                                            padding: '8px 20px',
                                            borderRadius: '8px',
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            cursor: submitting ? 'not-allowed' : 'pointer'
                                        }}
                                        className="hover:brightness-110"
                                    >
                                        {submitting ? 'Logging...' : 'Log Solve'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LeetCodeQuestions;
