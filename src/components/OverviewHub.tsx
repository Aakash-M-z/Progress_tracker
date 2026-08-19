import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Code2,
    BookOpen,
    Github,
    Map,
    ExternalLink,
    Star,
    GitFork,
    FolderGit2,
} from 'lucide-react';
import { Activity } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE } from '../api/config';
import { SessionManager } from '../utils/sessionManager';
import LeetCodeQuestions from './LeetCodeQuestions';
import CoreSubjects from './CoreSubjects';
import DSARoadmap from './DSARoadmap';
import axios from 'axios';

interface OverviewHubProps {
    activities: Activity[];
    onAddActivity: (activity: Partial<Activity>) => Promise<boolean>;
}

type OverviewSection = 'leetcode' | 'subjects' | 'github' | 'roadmap';

interface GitHubRepo {
    id: number;
    name: string;
    description: string | null;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    language: string | null;
    updated_at: string;
}

export const OverviewHub: React.FC<OverviewHubProps> = ({ activities, onAddActivity }) => {
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState<OverviewSection>('leetcode');
    const [repos, setRepos] = useState<GitHubRepo[]>([]);
    const [reposLoading, setReposLoading] = useState(false);
    const [githubUsername, setGithubUsername] = useState<string>(() => user?.username || '');

    // Resolve connected GitHub username
    useEffect(() => {
        if (!user?.id) {
            setGithubUsername('');
            setRepos([]);
            return;
        }

        const token = SessionManager.getToken();
        fetch(`${API_BASE}/api/platforms/accounts`, {
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            }
        })
        .then(r => r.ok ? r.json() : { accounts: [] })
        .then(data => {
            const gh = data.accounts?.find((a: any) => a.platform === 'github');
            if (gh?.username) {
                setGithubUsername(gh.username);
            } else if (user?.username) {
                setGithubUsername(user.username);
            }
        })
        .catch(() => {
            if (user?.username) setGithubUsername(user.username);
        });
    }, [user?.id, user?.username]);

    // Fetch GitHub repos if on GitHub tab
    useEffect(() => {
        if (activeSection === 'github') {
            if (!githubUsername || !githubUsername.trim()) {
                setRepos([]);
                setReposLoading(false);
                return;
            }

            const fetchRepos = async () => {
                setReposLoading(true);
                try {
                    const res = await axios.get(`https://api.github.com/users/${githubUsername.trim()}/repos?sort=updated&per_page=12`, {
                        headers: { 'User-Agent': 'AlgoAscent-App' },
                        timeout: 8000,
                    });
                    if (Array.isArray(res.data)) {
                        setRepos(res.data);
                    } else {
                        setRepos([]);
                    }
                } catch {
                    setRepos([]);
                } finally {
                    setReposLoading(false);
                }
            };
            fetchRepos();
        }
    }, [activeSection, githubUsername]);

    const sections = [
        {
            id: 'leetcode' as OverviewSection,
            label: 'LeetCode Problem Set',
            shortLabel: 'Course / LeetCode',
            icon: <Code2 className="w-4 h-4" />,
            color: '#f59e0b',
            accent: 'from-amber-500/20 to-orange-500/10',
            border: 'border-amber-500/30',
            text: 'text-amber-400',
            description: '1,200+ curated problems, topic filters, solutions & solve tracking',
        },
        {
            id: 'subjects' as OverviewSection,
            label: 'Core Subjects',
            shortLabel: 'Core Subjects',
            icon: <BookOpen className="w-4 h-4" />,
            color: '#38bdf8',
            accent: 'from-sky-500/20 to-blue-500/10',
            border: 'border-sky-500/30',
            text: 'text-sky-400',
            description: 'System Design, OS, DBMS, Computer Networks & OOPS modules',
        },
        {
            id: 'github' as OverviewSection,
            label: 'GitHub Dev Hub',
            shortLabel: 'GitHub',
            icon: <Github className="w-4 h-4" />,
            color: '#10b981',
            accent: 'from-emerald-500/20 to-teal-500/10',
            border: 'border-emerald-500/30',
            text: 'text-emerald-400',
            description: 'Live repositories, open source contributions & star tracking',
        },
        {
            id: 'roadmap' as OverviewSection,
            label: 'DSA Roadmap',
            shortLabel: 'DSA Roadmap',
            icon: <Map className="w-4 h-4" />,
            color: '#a855f7',
            accent: 'from-purple-500/20 to-indigo-500/10',
            border: 'border-purple-500/30',
            text: 'text-purple-400',
            description: '4 structured mastery stages, blind 75 & topic trees',
        },
    ];

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* ── COMMAND HUB NAVIGATION BAR ──────────────────────────────── */}
            <div className="p-2 rounded-2xl bg-[#090b14]/90 border border-white/[0.08] backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {sections.map((s) => {
                        const isActive = activeSection === s.id;
                        return (
                            <button
                                key={s.id}
                                onClick={() => setActiveSection(s.id)}
                                className={`relative p-3.5 rounded-xl transition-all duration-300 flex items-center gap-3 text-left overflow-hidden border ${
                                    isActive
                                        ? `bg-gradient-to-r ${s.accent} ${s.border} shadow-[0_0_20px_rgba(0,0,0,0.4)] scale-[1.01]`
                                        : 'bg-[#10121d]/60 border-white/[0.04] hover:border-white/15 hover:bg-[#151726]/80 text-slate-400'
                                }`}
                            >
                                <div
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform ${
                                        isActive ? 'scale-110 shadow-md' : 'opacity-75'
                                    }`}
                                    style={{
                                        background: isActive ? `${s.color}22` : 'rgba(255,255,255,0.04)',
                                        color: s.color,
                                        border: `1px solid ${isActive ? s.color : 'rgba(255,255,255,0.08)'}`,
                                    }}
                                >
                                    {s.icon}
                                </div>
                                <div className="min-w-0">
                                    <div className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                                        {s.shortLabel}
                                    </div>
                                    <div className="text-[0.62rem] text-slate-400 truncate mt-0.5">
                                        {s.id === 'leetcode' ? '1.2k+ Solves' : s.id === 'subjects' ? '5 CS Domains' : s.id === 'github' ? 'Public Repos' : '4 Tracks'}
                                    </div>
                                </div>

                                {isActive && (
                                    <motion.div
                                        layoutId="active-indicator"
                                        className="absolute bottom-0 left-0 right-0 h-0.5"
                                        style={{ background: s.color, boxShadow: `0 0 10px ${s.color}` }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── SECTION CONTENT SWITCHER ───────────────────────────────── */}
            <div className="relative">
                <AnimatePresence mode="wait">
                    {/* 1. LEETCODE PROBLEM SET */}
                    {activeSection === 'leetcode' && (
                        <motion.div
                            key="leetcode"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                        >
                            <LeetCodeQuestions activities={activities} onAddActivity={onAddActivity} />
                        </motion.div>
                    )}

                    {/* 2. CORE SUBJECTS */}
                    {activeSection === 'subjects' && (
                        <motion.div
                            key="subjects"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                        >
                            <CoreSubjects />
                        </motion.div>
                    )}

                    {/* 3. GITHUB DEV HUB */}
                    {activeSection === 'github' && (
                        <motion.div
                            key="github"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                            className="space-y-6"
                        >
                            {/* GitHub Profile Banner */}
                            <div className="p-6 rounded-2xl bg-[#0c0d16] border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.06)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg border border-emerald-400/30">
                                        <Github className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base font-extrabold text-white">
                                                {user?.name || user?.username || 'Developer'}
                                            </h3>
                                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[0.65rem] font-bold">
                                                GitHub Active
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                                            github.com/{githubUsername}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={githubUsername}
                                        onChange={(e) => setGithubUsername(e.target.value)}
                                        placeholder="GitHub handle..."
                                        className="px-3 py-1.5 rounded-xl bg-[#141624] border border-white/10 text-xs text-white focus:border-emerald-400 focus:outline-none"
                                    />
                                    <a
                                        href={`https://github.com/${githubUsername}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                    >
                                        <span>View Profile</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>

                            {/* Repositories Grid */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <FolderGit2 className="w-4 h-4 text-emerald-400" />
                                        <span>Public Repositories ({repos.length})</span>
                                    </h4>
                                    <span className="text-xs text-slate-400">Live Synchronized</span>
                                </div>

                                {reposLoading ? (
                                    <div className="p-8 text-center text-slate-500 animate-pulse bg-[#0c0d16] rounded-2xl border border-white/[0.06]">
                                        Fetching GitHub repositories...
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {repos.map((repo) => (
                                            <a
                                                key={repo.id}
                                                href={repo.html_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-5 rounded-2xl bg-[#0c0d16] border border-white/[0.08] hover:border-emerald-500/40 hover:bg-[#121422] transition-all flex flex-col justify-between group"
                                            >
                                                <div>
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <h5 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                                                            {repo.name}
                                                        </h5>
                                                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 flex-shrink-0" />
                                                    </div>
                                                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                                                        {repo.description || 'No description provided.'}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between pt-3 border-t border-white/[0.04] text-xs text-slate-400 font-mono">
                                                    {repo.language && (
                                                        <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-[0.68rem] text-slate-300 font-sans">
                                                            {repo.language}
                                                        </span>
                                                    )}
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex items-center gap-1">
                                                            <Star className="w-3 h-3 text-amber-400" />
                                                            {repo.stargazers_count}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <GitFork className="w-3 h-3 text-slate-400" />
                                                            {repo.forks_count}
                                                        </span>
                                                    </div>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* 4. DSA ROADMAP */}
                    {activeSection === 'roadmap' && (
                        <motion.div
                            key="roadmap"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                        >
                            <DSARoadmap activities={activities} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default OverviewHub;
