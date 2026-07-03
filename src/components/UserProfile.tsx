import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useActivities } from '../hooks/useActivities';

const UserProfile: React.FC = () => {
    const { user, isLoading: authLoading } = useAuth();
    const { data: activities = [] } = useActivities();

    console.log('[UserProfile] Rendering for user:', user?.id);

    const stats = useMemo(() => ({
        solved: activities.filter(a => a.problemSolved).length,
        topics: new Set(activities.map(a => a.category)).size,
        hours: Math.round(activities.reduce((s, a) => s + a.duration, 0) / 60),
    }), [activities]);

    if (authLoading) return (
        <div className="section-gap animate-pulse">
            <div className="h-10 bg-white/5 rounded-xl w-48 mb-6" />
            <div className="h-32 bg-white/5 rounded-2xl w-full" />
        </div>
    );

    if (!user) return (
        <div className="section-gap flex flex-col items-center justify-center p-20 text-center bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
            <div className="text-4xl mb-6 opacity-20">👤</div>
            <h2 className="text-xl font-bold text-white mb-2">Login Required</h2>
            <p className="text-white/40 max-w-xs">Please sign in to view your profile analytics.</p>
        </div>
    );

    const kpis = [
        { label: 'Problems Solved', value: stats.solved, icon: '✓' },
        { label: 'Topics Covered', value: stats.topics, icon: '◎' },
        { label: 'Hours Studied', value: stats.hours, icon: '⏱' },
    ];

    return (
        <div className="section-gap animate-fadeIn">
            <div>
                <h2 className="page-heading">Profile</h2>
                <p className="page-subheading">Your account details and statistics</p>
            </div>

            {/* User card */}
            <motion.div
                className="card-dark"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}
            >
                <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #D4AF37, #8A6012)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.6rem', fontWeight: 800, color: '#0B0B0B', flexShrink: 0,
                    boxShadow: '0 0 20px rgba(212,175,55,0.3)',
                }}>
                    {user?.name?.charAt(0).toUpperCase() ?? 'U'}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#EAEAEA' }}>{user?.name ?? 'User'}</div>
                    <div className="kpi-sub">{user?.email}</div>
                </div>
            </motion.div>

            {/* KPI row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                {kpis.map((k, i) => (
                    <motion.div
                        key={k.label}
                        className="stat-card"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.06, duration: 0.3 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
                    >
                        <div style={{ fontSize: '1.2rem' }}>{k.icon}</div>
                        <div className="kpi-number">{k.value}</div>
                        <div className="kpi-label">{k.label}</div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default UserProfile;
