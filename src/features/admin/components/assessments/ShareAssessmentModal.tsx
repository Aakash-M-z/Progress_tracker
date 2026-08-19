import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, Check, ExternalLink, ShieldCheck, Mail, Bell, Send, UserPlus, X, AlertCircle } from 'lucide-react';
import { Assessment, assessmentApi } from '../../../../api/assessmentApi';

interface ShareAssessmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    assessment: Assessment | null;
}

const ShareAssessmentModal: React.FC<ShareAssessmentModalProps> = ({
    isOpen,
    onClose,
    assessment
}) => {
    const [activeTab, setActiveTab] = useState<'link' | 'email'>('link');
    const [copied, setCopied] = useState(false);
    const [emailInput, setEmailInput] = useState('');
    const [assignedEmails, setAssignedEmails] = useState<string[]>(assessment?.assignedEmails || []);
    const [isSending, setIsSending] = useState(false);
    const [isReminding, setIsReminding] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    if (!isOpen || !assessment) return null;

    const shareUrl = `${window.location.origin}/assessment/${assessment.shareToken}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAddEmail = () => {
        const raw = emailInput.trim().toLowerCase();
        if (!raw) return;

        // Split by comma or whitespace if multiple
        const emails = raw.split(/[\s,]+/).filter(e => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(e));
        if (emails.length === 0) {
            setStatusMessage({ type: 'error', text: 'Please enter valid email addresses (e.g. candidate@gmail.com).' });
            return;
        }

        const newSet = Array.from(new Set([...assignedEmails, ...emails]));
        setAssignedEmails(newSet);
        setEmailInput('');
        setStatusMessage(null);
    };

    const handleRemoveEmail = (target: string) => {
        setAssignedEmails(assignedEmails.filter(e => e !== target));
    };

    const handleSendInvitations = async () => {
        if (assignedEmails.length === 0 && !emailInput.trim()) {
            setStatusMessage({ type: 'error', text: 'Please add at least one candidate Gmail or email address.' });
            return;
        }

        let emailsToSend = [...assignedEmails];
        if (emailInput.trim()) {
            const extra = emailInput.trim().toLowerCase().split(/[\s,]+/).filter(e => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(e));
            emailsToSend = Array.from(new Set([...emailsToSend, ...extra]));
            setAssignedEmails(emailsToSend);
            setEmailInput('');
        }

        setIsSending(true);
        setStatusMessage(null);

        try {
            const res = await assessmentApi.assignAssessment(assessment.id, {
                emails: emailsToSend,
                sendEmailNotification: true
            });
            setStatusMessage({
                type: 'success',
                text: res.message || `Assessment invitations sent to ${emailsToSend.length} candidate Gmail inboxes!`
            });
        } catch (err: any) {
            setStatusMessage({ type: 'error', text: err.message || 'Failed to dispatch email notifications.' });
        } finally {
            setIsSending(false);
        }
    };

    const handleSendReminder = async () => {
        setIsReminding(true);
        setStatusMessage(null);

        try {
            const res = await assessmentApi.sendReminders(assessment.id);
            setStatusMessage({
                type: 'success',
                text: res.message || 'Contest reminder notifications sent to all invited candidates!'
            });
        } catch (err: any) {
            setStatusMessage({ type: 'error', text: err.message || 'Failed to dispatch reminder emails.' });
        } finally {
            setIsReminding(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-full max-w-xl bg-[#090a0f] border border-[#1f2232] rounded-2xl p-6 shadow-2xl space-y-5"
            >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#181a24]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#AA8A2A] flex items-center justify-center text-black font-black text-lg shadow-lg shadow-[#D4AF37]/20">
                            ◈
                        </div>
                        <div>
                            <h3 className="text-base font-black text-white">Distribute Assessment</h3>
                            <p className="text-xs text-slate-400">Share secure links or dispatch Gmail candidate invitations</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#181a24] gap-4">
                    <button
                        onClick={() => setActiveTab('link')}
                        className={`pb-2.5 text-xs font-bold transition-colors flex items-center gap-2 relative ${
                            activeTab === 'link' ? 'text-[#D4AF37]' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Share2 className="w-3.5 h-3.5" /> Direct Share Link
                        {activeTab === 'link' && (
                            <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('email')}
                        className={`pb-2.5 text-xs font-bold transition-colors flex items-center gap-2 relative ${
                            activeTab === 'email' ? 'text-[#D4AF37]' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Mail className="w-3.5 h-3.5" /> Assign to Gmail & Notify
                        {activeTab === 'email' && (
                            <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]" />
                        )}
                    </button>
                </div>

                {/* Assessment Info Banner */}
                <div className="p-3.5 rounded-xl bg-[#0e1018] border border-[#181a24] space-y-1.5">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white truncate max-w-[320px]">{assessment.title}</h4>
                        <span className={`px-2 py-0.5 rounded text-[0.65rem] font-black uppercase tracking-wider ${
                            assessment.accessMode === 'public'
                                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                : assessment.accessMode === 'private'
                                    ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                                    : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                        }`}>
                            {assessment.accessMode}
                        </span>
                    </div>
                    <div className="text-[0.7rem] text-slate-400 flex items-center gap-3">
                        <span>⏱️ {assessment.duration} Mins</span>
                        <span>📝 {assessment.questionCount || assessment.questions?.length || 0} Questions</span>
                        <span>🎯 Passing: {assessment.passingScore}%</span>
                    </div>
                </div>

                {/* TAB 1: Direct Link */}
                {activeTab === 'link' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[0.7rem] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
                                Public Candidate URL
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={shareUrl}
                                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#141622] border border-[#1f2232] text-xs text-indigo-300 font-mono focus:outline-none select-all"
                                />
                                <button
                                    onClick={handleCopy}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                                        copied
                                            ? 'bg-emerald-500 text-black'
                                            : 'bg-[#D4AF37] hover:bg-[#AA8A2A] text-black font-black'
                                    }`}
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied' : 'Copy'}
                                </button>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-slate-300 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-indigo-300 text-xs">
                                <ShieldCheck className="w-4 h-4" /> Participation Rules:
                            </div>
                            <p className="text-[0.75rem] text-slate-400">
                                {assessment.accessMode === 'public'
                                    ? 'Open to all candidates with a valid Gmail/verified account.'
                                    : 'Candidates must sign in with their authenticated AlgoAscent account.'}
                            </p>
                        </div>
                    </div>
                )}

                {/* TAB 2: Email & Gmail Assignment */}
                {activeTab === 'email' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[0.7rem] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
                                Candidate Gmail / Email Addresses
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="email"
                                    placeholder="e.g. candidate@gmail.com, aakash@algoascent.dev"
                                    value={emailInput}
                                    onChange={e => setEmailInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddEmail(); } }}
                                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#141622] border border-[#1f2232] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37]"
                                />
                                <button
                                    onClick={handleAddEmail}
                                    className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1"
                                >
                                    <UserPlus className="w-3.5 h-3.5" /> Add
                                </button>
                            </div>
                        </div>

                        {/* Assigned Emails List */}
                        {assignedEmails.length > 0 && (
                            <div className="space-y-1.5">
                                <span className="text-[0.65rem] uppercase font-bold text-slate-500">
                                    Recipient Queue ({assignedEmails.length})
                                </span>
                                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 rounded-xl bg-[#10121c] border border-[#181a24]">
                                    {assignedEmails.map(email => (
                                        <span
                                            key={email}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono"
                                        >
                                            {email}
                                            <button
                                                onClick={() => handleRemoveEmail(email)}
                                                className="text-indigo-400 hover:text-white"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            <button
                                disabled={isSending}
                                onClick={handleSendInvitations}
                                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8A2A] text-black font-black text-xs hover:brightness-110 shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                            >
                                <Send className="w-3.5 h-3.5" />
                                {isSending ? 'Sending Invitations...' : '✉️ Send Gmail Invitations'}
                            </button>

                            <button
                                disabled={isReminding}
                                onClick={handleSendReminder}
                                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                            >
                                <Bell className="w-3.5 h-3.5 text-amber-400" />
                                {isReminding ? 'Sending Reminders...' : '⏰ Send Contest Reminder'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Status Message */}
                {statusMessage && (
                    <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                        statusMessage.type === 'success'
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                    }`}>
                        {statusMessage.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                        <span>{statusMessage.text}</span>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-[#181a24]">
                    <a
                        href={shareUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 font-bold"
                    >
                        <ExternalLink className="w-3.5 h-3.5" /> Live Candidate Preview ↗
                    </a>
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ShareAssessmentModal;
