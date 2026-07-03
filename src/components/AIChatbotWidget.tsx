import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { databaseAPI } from '../api/database';
import { Activity } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface Props {
    activities: Activity[];
}

interface Message {
    id: string;
    role: 'user' | 'ai';
    text: string;
    ts: Date;
}

const AIChatbotWidget: React.FC<Props> = ({ activities }) => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'ai',
            text: `Hi ${user?.name || 'there'}! I'm your AI DSA Coach. 🤖\n\nI can suggest LeetCode problems tailored to your progress. Try clicking the quick actions below or ask me a question!`,
            ts: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const addMessage = (role: 'user' | 'ai', text: string) => {
        setMessages(prev => [
            ...prev,
            {
                id: Math.random().toString(36).substr(2, 9),
                role,
                text,
                ts: new Date()
            }
        ]);
    };

    const handleRecommendations = async () => {
        setLoading(true);
        addMessage('user', '🎯 Suggest Next Problem');
        
        try {
            const data = await databaseAPI.getRecommendations(activities as any);
            if (data && data.recommendedProblems && data.recommendedProblems.length > 0) {
                const difficulty = data.recommendedDifficulty || 'Easy';
                const reason = data.difficultyReason || '';
                
                let reply = `Here are my custom LeetCode recommendations for you:\n\n**Recommended Difficulty**: ${difficulty}\n*${reason}*\n\n**Try these problems next**:\n`;
                
                data.recommendedProblems.slice(0, 3).forEach((p: any, i: number) => {
                    const slug = p.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
                    const url = `https://leetcode.com/problems/${slug}/`;
                    reply += `\n${i + 1}. **${p.title}** (${p.difficulty}) - *${p.topic}*\n   👉 [Solve on LeetCode](${url})`;
                });
                
                setTimeout(() => {
                    addMessage('ai', reply);
                    setLoading(false);
                }, 800);
            } else {
                // Fallback to random LeetCode questions
                setTimeout(() => {
                    addMessage('ai', `I recommend starting with some classic beginner problems:\n\n1. **Two Sum** (Easy) - *Arrays*\n   👉 [Solve on LeetCode](https://leetcode.com/problems/two-sum/)\n2. **Valid Parentheses** (Easy) - *Stacks*\n   👉 [Solve on LeetCode](https://leetcode.com/problems/valid-parentheses/)`);
                    setLoading(false);
                }, 800);
            }
        } catch (err) {
            setTimeout(() => {
                addMessage('ai', "I encountered an error trying to fetch recommendations. Try again in a bit!");
                setLoading(false);
            }, 800);
        }
    };

    const handleProgressAnalysis = () => {
        setLoading(true);
        addMessage('user', '📊 Analyze My Progress');
        
        const total = activities.length;
        const solved = activities.filter(a => a.problemSolved).length;
        const totalMins = activities.reduce((s, a) => s + a.duration, 0);
        const categories = [...new Set(activities.map(a => a.category))];
        
        setTimeout(() => {
            if (total === 0) {
                addMessage('ai', "You haven't logged any solved problems yet! Once you solve LeetCode questions from the dataset table, mark them solved and I'll analyze your stats here.");
            } else {
                addMessage('ai', `📊 **Your DSA Stats**:\n\n- **Problems Solved**: ${solved} / ${total} sessions logged\n- **Topics Covered**: ${categories.length} unique topics\n- **Total Learning Time**: ${totalMins} minutes (~${Math.round(totalMins/60)} hours)\n\nKeep it up! Click "Suggest Next Problem" to see what topic you should tackle next.`);
            }
            setLoading(false);
        }, 850);
    };

    const handleConsistencyTips = () => {
        setLoading(true);
        addMessage('user', '💡 Consistency Tips');
        setTimeout(() => {
            addMessage('ai', `💡 **Top Tips for DSA Consistency**:\n\n1. **Spaced Repetition**: Re-attempt Medium/Hard problems you solved 3 days later to reinforce logic.\n2. **Limit Sessions**: Focus on 1-2 quality problems a day rather than cramming 10 in one weekend.\n3. **Understand Complexity**: Never code a solution without dry-running its Time and Space complexity first.`);
            setLoading(false);
        }, 600);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;
        
        const query = input.trim();
        setInput('');
        addMessage('user', query);
        setLoading(true);

        const lower = query.toLowerCase();
        
        setTimeout(() => {
            if (lower.includes('suggest') || lower.includes('next') || lower.includes('recommend') || lower.includes('solve')) {
                handleRecommendations();
            } else if (lower.includes('analyz') || lower.includes('progress') || lower.includes('stats') || lower.includes('how am i')) {
                handleProgressAnalysis();
            } else if (lower.includes('tips') || lower.includes('consistency') || lower.includes('consistent') || lower.includes('habit')) {
                handleConsistencyTips();
            } else {
                addMessage('ai', `I can help with coding recommendations and practice analytics. Try typing **"suggest a problem"** or clicking one of the quick actions!`);
                setLoading(false);
            }
        }, 700);
    };

    return (
        <>
            {/* Floating Chat Bubble Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #D4AF37, #8A6012)',
                    boxShadow: '0 4px 24px rgba(212,175,55,0.4)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 999
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="AI DSA Coach"
            >
                {isOpen ? <X size={24} color="#0B0B0B" /> : <MessageSquare size={24} color="#0B0B0B" />}
            </motion.button>

            {/* Chatbox Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.9 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        style={{
                            position: 'fixed',
                            bottom: '90px',
                            right: '24px',
                            width: '380px',
                            height: '500px',
                            maxHeight: '80vh',
                            background: 'rgba(12,12,12,0.95)',
                            border: '1px solid rgba(212,175,55,0.2)',
                            borderRadius: '20px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
                            backdropFilter: 'blur(20px)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            zIndex: 999
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'rgba(212,175,55,0.05)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e',
                                    boxShadow: '0 0 8px #22c55e'
                                }} />
                                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#EAEAEA', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Sparkles size={13} style={{ color: '#D4AF37' }} /> AI DSA Coach
                                </span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
                                className="hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Quick Actions Bar */}
                        <div style={{
                            padding: '10px 14px',
                            background: 'rgba(255,255,255,0.02)',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            display: 'flex',
                            gap: '8px',
                            overflowX: 'auto',
                            whiteSpace: 'nowrap'
                        }} className="hide-scrollbar">
                            <button
                                onClick={handleRecommendations}
                                disabled={loading}
                                style={{
                                    background: 'rgba(212,175,55,0.08)',
                                    border: '1px solid rgba(212,175,55,0.2)',
                                    color: '#D4AF37',
                                    padding: '5px 10px',
                                    borderRadius: '12px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                🎯 Recommend Next
                            </button>
                            <button
                                onClick={handleProgressAnalysis}
                                disabled={loading}
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    color: '#ccc',
                                    padding: '5px 10px',
                                    borderRadius: '12px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                📊 Analyze
                            </button>
                            <button
                                onClick={handleConsistencyTips}
                                disabled={loading}
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    color: '#ccc',
                                    padding: '5px 10px',
                                    borderRadius: '12px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                💡 Tips
                            </button>
                        </div>

                        {/* Messages Body */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                        }}>
                            {messages.map(msg => (
                                <div
                                    key={msg.id}
                                    style={{
                                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        maxWidth: '85%',
                                        background: msg.role === 'user' ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${msg.role === 'user' ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.06)'}`,
                                        padding: '12px 14px',
                                        borderRadius: msg.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                                        fontSize: '0.8rem',
                                        lineHeight: 1.5,
                                        color: '#EAEAEA',
                                        whiteSpace: 'pre-line'
                                    }}
                                >
                                    {msg.text.split('\n').map((line, idx) => {
                                        // Simple markdown formatting helper
                                        let content: React.ReactNode = line;
                                        
                                        // Bold
                                        if (line.includes('**')) {
                                            const parts = line.split('**');
                                            content = parts.map((part, i) => i % 2 === 1 ? <strong key={i} style={{ color: '#D4AF37' }}>{part}</strong> : part);
                                        }

                                        // Links
                                        if (line.includes('[') && line.includes('](')) {
                                            const match = line.match(/(.*)\[(.*)\]\((.*)\)(.*)/);
                                            if (match) {
                                                content = (
                                                    <span>
                                                        {match[1]}
                                                        <a href={match[3]} target="_blank" rel="noopener noreferrer" style={{ color: '#D4AF37', fontWeight: 700 }}>
                                                            {match[2]}
                                                        </a>
                                                        {match[4]}
                                                    </span>
                                                );
                                            }
                                        }
                                        
                                        return <div key={idx}>{content}</div>;
                                    })}
                                </div>
                            ))}
                            {loading && (
                                <div style={{
                                    alignSelf: 'flex-start',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    padding: '12px 14px',
                                    borderRadius: '18px 18px 18px 2px',
                                    fontSize: '0.8rem',
                                    color: '#888',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <div className="animate-pulse" style={{ display: 'flex', gap: '3px' }}>
                                        <span style={{ width: '4px', height: '4px', background: '#888', borderRadius: '50%' }} />
                                        <span style={{ width: '4px', height: '4px', background: '#888', borderRadius: '50%' }} />
                                        <span style={{ width: '4px', height: '4px', background: '#888', borderRadius: '50%' }} />
                                    </div>
                                    AI Coach is thinking...
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Footer */}
                        <form
                            onSubmit={handleSend}
                            style={{
                                padding: '14px 20px',
                                borderTop: '1px solid rgba(255,255,255,0.06)',
                                display: 'flex',
                                gap: '10px',
                                background: 'rgba(255,255,255,0.01)'
                            }}
                        >
                            <input
                                type="text"
                                placeholder="Type a message or ask for help..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '10px',
                                    padding: '8px 12px',
                                    color: '#fff',
                                    fontSize: '0.8rem',
                                    outline: 'none'
                                }}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                style={{
                                    background: 'linear-gradient(135deg, #D4AF37, #8A6012)',
                                    border: 'none',
                                    borderRadius: '10px',
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer',
                                    opacity: (!input.trim() || loading) ? 0.5 : 1
                                }}
                            >
                                <Send size={16} color="#0B0B0B" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIChatbotWidget;
