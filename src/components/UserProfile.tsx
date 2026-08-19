import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ConnectedAccounts from './ConnectedAccounts';

const UserProfile: React.FC = () => {
    const { user, isLoading: authLoading } = useAuth();

    if (authLoading) {
        return (
            <div className="section-gap animate-pulse space-y-4">
                <div className="h-24 bg-white/5 rounded-2xl w-full" />
                <div className="grid grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-20 bg-white/5 rounded-xl" />
                    ))}
                </div>
                <div className="h-44 bg-white/5 rounded-2xl w-full" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="section-gap flex flex-col items-center justify-center p-16 text-center bg-[#08080c] rounded-2xl border border-dashed border-white/10">
                <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center text-slate-500 mb-4 text-xl">
                    🔒
                </div>
                <h2 className="text-lg font-bold text-white mb-1">Authentication Required</h2>
                <p className="text-xs text-slate-400 max-w-xs">Please sign in to view your developer profile and connected accounts.</p>
            </div>
        );
    }

    return (
        <div className="section-gap animate-fadeIn">
            <ConnectedAccounts />
        </div>
    );
};

export default UserProfile;
