
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import Header from './components/Header';
import Login from './components/Login';
import HomePage from './components/HomePage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Activity } from './types';
import { SessionManager } from './utils/sessionManager';
import ToastProvider, { useToast } from './components/Toast';
import Onboarding, { shouldShowOnboarding } from './components/Onboarding';
import MobileNav from './components/MobileNav';
import { SkeletonStatRow, SkeletonChart, SkeletonTaskList } from './components/SkeletonLoader';
import { useActivities, useAddActivity, useDeleteActivity } from './hooks/useActivities';

import LeetCodeQuestions from './components/LeetCodeQuestions';
import OverviewHub from './components/OverviewHub';
import ProgressStats from './components/ProgressStats';
import ActivityForm from './components/ActivityForm';
import DSARoadmap from './components/DSARoadmap';
import RoleBasedRoute from './components/RoleBasedRoute';
import AdminPanel from './components/AdminPanel';
import DailyProblemNotification from './components/DailyProblemNotification';
import NotificationSettings from './components/NotificationSettings';
import BadgeSystem from './components/BadgeSystem';
import SolutionResources from './components/SolutionResources';
import QuickAddProblem from './components/QuickAddProblem';
import UserProfile from './components/UserProfile';
import AIChatbotWidget from './components/AIChatbotWidget';
import AIAssistant from './components/AIAssistant';
import AIAnalysis from './components/AIAnalysis';
import RecommendationEngine from './components/RecommendationEngine';
import TaskManager from './components/TaskManager';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import IntroScreen from './components/IntroScreen';
import StatsCards from './components/StatsCards';
import AIInsightCard from './components/AIInsightCard';
import NextProblemCTA from './components/NextProblemCTA';
import CoreSubjects from './components/CoreSubjects';
import XPSystem from './components/XPSystem';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';



const NAV_ITEMS = [
    { id: 'overview', label: 'Overview', icon: '⊞', section: 'main', path: '/dashboard' },
    { id: 'roadmap', label: 'DSA Roadmap', icon: '◎', section: 'tools', path: '/dashboard/roadmap' },
    { id: 'subjects', label: 'Core Subjects', icon: '⬡', section: 'tools', path: '/dashboard/subjects' },
    { id: 'resources', label: 'Resources', icon: '◇', section: 'tools', path: '/dashboard/resources' },
] as const;

type TabId = typeof NAV_ITEMS[number]['id'] | 'admin';

/* ── Sidebar ─────────────────────────────────────────────────── */
const Sidebar: React.FC<{
    tabs: { id: string; label: string; icon: string; section: string; path: string }[];
    collapsed: boolean;
    onToggle: () => void;
}> = ({ tabs, collapsed, onToggle }) => {
    const sections = [
        { key: 'main', label: 'Main' },
        { key: 'tools', label: 'Tools' },
        { key: 'account', label: 'Account' },
    ];
    return (
        <aside
            className="sidebar hidden md:flex flex-col"
            style={{
                width: collapsed ? '58px' : '212px',
                flexShrink: 0,
                transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1)',
                overflow: 'hidden',
                height: '100%',
                alignSelf: 'stretch',
            }}
        >
            <div style={{ padding: '10px 8px', display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end' }}>
                <button onClick={onToggle}
                    style={{
                        width: '26px', height: '26px', borderRadius: '7px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        color: '#444', cursor: 'pointer', fontSize: '0.65rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#D4AF37'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.3)'; (e.currentTarget as HTMLElement).style.background = 'rgba(212,175,55,0.06)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#444'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
                >{collapsed ? '▶' : '◀'}</button>
            </div>
            <nav style={{ flex: 1, padding: '0 6px', overflowY: 'auto', overflowX: 'hidden' }}>
                {sections.map(sec => {
                    const items = tabs.filter(t => t.section === sec.key);
                    if (!items.length) return null;
                    return (
                        <div key={sec.key} style={{ marginBottom: '2px' }}>
                            {!collapsed && (
                                <div className="section-label" style={{ padding: '12px 10px 5px' }}>
                                    {sec.label}
                                </div>
                            )}
                            {items.map(tab => (
                                <NavLink key={tab.id} to={tab.path} title={collapsed ? tab.label : undefined}
                                    className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                                    style={{ justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '10px' : '9px 12px', marginBottom: '1px' }}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <span style={{ fontSize: '0.9rem', flexShrink: 0, lineHeight: 1, opacity: isActive ? 1 : 0.7 }}>{tab.icon}</span>
                                            {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.84rem' }}>{tab.label}</span>}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                            {!collapsed && <div style={{ height: '1px', background: 'rgba(255,255,255,0.03)', margin: '8px 4px' }} />}
                        </div>
                    );
                })}
            </nav>
            {!collapsed && (
                <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(212,175,55,0.07)' }}>
                    <div className="section-label" style={{ color: 'rgba(212,175,55,0.25)' }}>Placement Prep v3</div>
                </div>
            )}
        </aside>
    );
};

/* ── Overview Tab ─────────────────────────────────────────────── */
const OverviewTab: React.FC = () => {
    const { data: activities = [], isLoading: loading } = useActivities();
    const { mutateAsync: addActivity } = useAddActivity();
    const { toast } = useToast();

    const onAddActivity = async (partial: Partial<Activity>): Promise<boolean> => {
        try {
            await addActivity(partial);
            return true;
        } catch {
            toast('Failed to save activity', 'error');
            return false;
        }
    };
    const displayActivities = activities;

    return (
        <div className="section-gap animate-fadeIn">
            {loading ? (
                <div className="card-dark" style={{ padding: '32px', textAlign: 'center', color: '#555' }}>
                    <div className="animate-pulse">Loading dashboard...</div>
                </div>
            ) : (
                <OverviewHub
                    activities={displayActivities}
                    onAddActivity={onAddActivity}
                />
            )}
        </div>
    );
}



/* ── AppContent ───────────────────────────────────────────────── */
const AppContent: React.FC = () => {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const { toast } = useToast();
    const { data: activities = [] } = useActivities();

    const location = useLocation();
    const navigate = useNavigate();

    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showHomePage, setShowHomePage] = useState(false);
    // Only show intro if user is NOT already logged in (no stored session)
    // This prevents the intro from blocking route restoration on refresh
    const [showIntro, setShowIntro] = useState(() => !SessionManager.isSessionValid());
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    // Check onboarding on first auth
    useEffect(() => {
        if (isAuthenticated && shouldShowOnboarding()) {
            setShowOnboarding(true);
        }
    }, [isAuthenticated]);

    // Redirect standalone profile to dashboard/profile
    useEffect(() => {
        if (location.pathname === '/profile') {
            navigate('/dashboard/profile', { replace: true });
        }
    }, [location.pathname, navigate]);

    // Fast transition from Landing Page
    useEffect(() => {
        if (location.state?.fromGetStarted) {
            setShowIntro(false);
            // Replace history to clear the flag
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // Fast transition from Landing Page
    useEffect(() => {
        if (location.state?.fromGetStarted) {
            setShowIntro(false);
            // Replace history to clear the flag
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const navItems = useMemo(() => {
        const items = [...NAV_ITEMS] as { id: string; label: string; icon: string; section: string; path: string }[];

        const interviewItem = user?.role === 'admin'
            ? { id: 'interview', label: 'Interview Analytics', icon: '📈', section: 'main', path: '/dashboard/interview' }
            : { id: 'interview', label: 'Mock Interview', icon: '🎤', section: 'main', path: '/dashboard/interview' };

        items.splice(2, 0, interviewItem);

        if (user?.role === 'admin') items.push({ id: 'admin', label: 'Admin', icon: '⚙', section: 'account', path: '/dashboard/admin' });
        return items;
    }, [user]);

    const isDashboardPath = location.pathname.startsWith('/dashboard');

    if (authLoading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B0B0B' }}>
                <div className="spinner-gold" />
            </div>
        );
    }

    if (!isAuthenticated && isDashboardPath) {
        // Only show login/intro if auth has fully loaded — prevents flash-redirect on refresh
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
            >
                {showIntro && (
                    <IntroScreen onDone={() => setShowIntro(false)} />
                )}
                <div style={{
                    opacity: showIntro ? 0 : 1,
                    transition: 'opacity 0.5s ease',
                    pointerEvents: showIntro ? 'none' : 'all',
                }}>
                    <Login />
                </div>
            </motion.div>
        );
    }

    // Dashboard Layout
    if (isAuthenticated && isDashboardPath) {

        return (
            <div className="h-screen w-full flex flex-col bg-black overflow-hidden relative">
                {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}

                {/* Header Container */}
                <div className="relative z-[150] w-full">
                    <Header onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
                </div>

                {/* Dashboard layout container */}
                <div className="flex flex-1 overflow-hidden relative">

                    {/* Mobile Sidebar Overlay */}
                    <AnimatePresence>
                        {mobileSidebarOpen && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setMobileSidebarOpen(false)}
                                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] md:hidden"
                                />
                                <motion.div
                                    initial={{ x: -300 }}
                                    animate={{ x: 0 }}
                                    exit={{ x: -300 }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                    className="fixed top-0 bottom-0 left-0 w-72 bg-[#0c0c0c] z-[210] border-r border-white/10 md:hidden flex flex-col"
                                >
                                    <div className="p-6 flex items-center justify-between border-b border-white/5">
                                        <span className="text-xl font-black text-white uppercase tracking-tighter">
                                            PrepTrack <span className="text-gold">AI</span>
                                        </span>
                                        <button onClick={() => setMobileSidebarOpen(false)} className="text-white/20 p-2">✕</button>
                                    </div>
                                    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                                        {navItems.map(item => (
                                            <NavLink
                                                key={item.id}
                                                to={item.path}
                                                onClick={() => setMobileSidebarOpen(false)}
                                                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-gold/10 text-gold border border-gold/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                            >
                                                <span className="text-lg">{item.icon}</span>
                                                <span className="font-bold text-sm uppercase tracking-wide">{item.label}</span>
                                            </NavLink>
                                        ))}
                                    </nav>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    {/* Main content area */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden relative transition-all duration-300 bg-[#040406]">
                        <motion.main
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 md:px-8 py-6 pb-20 md:pb-8"
                        >
                            <ErrorBoundary>
                                <AppRoutes
                                    overviewTabNode={<OverviewTab />}
                                />
                            </ErrorBoundary>
                        </motion.main>
                    </div>

                    {/* Mobile Bottom Nav (Hidden on desktop) */}
                    <MobileNav items={navItems} />

                    {/* Floating AI Chatbot Assistant */}
                    <AIChatbotWidget activities={activities} />
                </div>
            </div>
        );
    }


    // Default to catching everything else (Landing Page or redirects)
    return (
        <ErrorBoundary>
            <AppRoutes
                overviewTabNode={<OverviewTab />}
            />
        </ErrorBoundary>
    );
};

/* ── Root App ─────────────────────────────────────────────────── */
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const App: React.FC = () => (
    <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <AuthProvider>
                    <ToastProvider>
                        <AppContent />
                    </ToastProvider>
                </AuthProvider>
            </GoogleOAuthProvider>
        </QueryClientProvider>
    </ErrorBoundary>
);

export default App;
