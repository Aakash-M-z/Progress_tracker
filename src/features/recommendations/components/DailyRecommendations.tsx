import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Brain, CheckCircle, Clock } from 'lucide-react';

interface ProblemReview {
  id: string;
  userId: string;
  problemTitle: string;
  category: string;
  difficulty: string;
  platform: string;
  rating: number;
  nextReviewDate: string;
  interval: number;
  easeFactor: number;
  lastReviewed: string;
  createdAt: string;
}

const DailyRecommendations: React.FC = () => {
    const [reviews, setReviews] = useState<ProblemReview[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDueReviews = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return;
                }
                const res = await fetch('/api/spaced-repetition/daily', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setReviews(data.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch daily reviews", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDueReviews();
    }, []);

    const GOLD = '#D4AF37';

    if (loading) {
        return (
            <div className="card-dark" style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid rgba(212,175,55,0.2)', borderTopColor: GOLD, animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    return (
        <motion.div
            className="card-dark"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}
        >
            <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Brain size={20} color={GOLD} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#EAEAEA', margin: 0, letterSpacing: '-0.02em' }}>Daily Review</h2>
                    <p style={{ fontSize: '0.85rem', color: '#888', margin: 0, marginTop: '2px' }}>Spaced repetition based on your past performance</p>
                </div>
            </div>

            {reviews.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 0', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <CheckCircle size={32} color="#22c55e" style={{ opacity: 0.8, marginBottom: '12px' }} />
                    <p style={{ color: '#EAEAEA', fontWeight: 600, margin: 0, fontSize: '1rem' }}>All caught up!</p>
                    <p style={{ color: '#666', fontSize: '0.85rem', margin: 0, marginTop: '4px' }}>No problems due for review today.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <AnimatePresence>
                        {reviews.map((review, i) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.05 }}
                                style={{ 
                                    padding: '16px', 
                                    borderRadius: '12px', 
                                    background: 'rgba(255,255,255,0.03)', 
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer'
                                }}
                                whileHover={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(212,175,55,0.3)', x: 4 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#FFF', fontWeight: 600 }}>{review.problemTitle}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                                            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: '#CCC' }}>
                                                {review.category}
                                            </span>
                                            <span style={{ 
                                                fontSize: '0.7rem', 
                                                padding: '2px 8px', 
                                                borderRadius: '4px', 
                                                background: review.difficulty === 'Easy' ? 'rgba(34,197,94,0.15)' : review.difficulty === 'Medium' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)', 
                                                color: review.difficulty === 'Easy' ? '#4ade80' : review.difficulty === 'Medium' ? '#fbbf24' : '#f87171' 
                                            }}>
                                                {review.difficulty}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(212,175,55,0.1)', padding: '4px 8px', borderRadius: '6px', color: GOLD, fontSize: '0.75rem', fontWeight: 600 }}>
                                        <Clock size={12} />
                                        Due today
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
};

export default DailyRecommendations;
