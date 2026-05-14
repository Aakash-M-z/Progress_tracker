import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAIJob } from '../hooks/useAIJob';

interface ComplexityAnalyzerProps {
    code: string;
    language: string;
}

export const ComplexityAnalyzer: React.FC<ComplexityAnalyzerProps> = ({ code, language }) => {
    const { runJob, loading, result, error, status } = useAIJob();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleAnalyze = () => {
        if (!code?.trim()) return;
        setIsExpanded(true);
        runJob('/ai/analyze-complexity', { code, language });
    };

    return (
        <div className="card-dark" style={{ padding: '20px', border: '1px solid rgba(212,175,55,0.15)', background: 'linear-gradient(145deg, rgba(23,23,23,0.8), rgba(15,15,15,0.9))' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isExpanded ? '20px' : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h5l2 8 5-16 2 8h5"/></svg>
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#F5F5F5' }}>Big-O Analyzer</h3>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>AI-powered complexity analysis</p>
                    </div>
                </div>
                {!isExpanded && (
                    <button 
                        onClick={handleAnalyze}
                        disabled={loading || !code?.trim()}
                        className="btn-gold" 
                        style={{ 
                            padding: '8px 16px', 
                            borderRadius: '8px', 
                            fontSize: '0.8rem',
                            opacity: (!code?.trim() || loading) ? 0.5 : 1,
                            cursor: (!code?.trim() || loading) ? 'not-allowed' : 'pointer'
                        }}
                        title={!code?.trim() ? "Paste your code below first" : ""}
                    >
                        {loading ? 'Analyzing...' : 'Analyze Code'}
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div style={{ position: 'relative', minHeight: '120px', padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            {loading && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100px', gap: '12px' }}>
                                    <div className="ai-pulse" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(212,175,55,0.2)', border: '2px solid #D4AF37' }}></div>
                                    <span style={{ fontSize: '0.8rem', color: '#D4AF37', fontWeight: 500 }}>Scanning code structures...</span>
                                    <motion.div 
                                        style={{ width: '100%', height: '2px', background: 'rgba(212,175,55,0.1)', position: 'absolute', top: 0, left: 0, overflow: 'hidden' }}
                                    >
                                        <motion.div 
                                            animate={{ x: ['-100%', '100%'] }} 
                                            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                                            style={{ width: '30%', height: '100%', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }}
                                        />
                                    </motion.div>
                                </div>
                            )}

                            {error && (
                                <div style={{ color: '#ff4444', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>
                                    Error: {error}
                                    <button onClick={handleAnalyze} style={{ display: 'block', margin: '10px auto', background: 'none', border: 'none', color: '#D4AF37', cursor: 'pointer', textDecoration: 'underline' }}>Try again</button>
                                </div>
                            )}

                            {result && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ fontSize: '0.875rem', color: '#EAEAEA', lineHeight: 1.6 }}
                                >
                                    <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
                                        <div style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.1)' }}>
                                            <div style={{ fontSize: '0.7rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '4px' }}>Time Complexity</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace' }}>
                                                {result.analysis.match(/O\(.*?\)/g)?.[0] || 'Analyzing...'}
                                            </div>
                                        </div>
                                        <div style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.1)' }}>
                                            <div style={{ fontSize: '0.7rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '4px' }}>Space Complexity</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace' }}>
                                                {result.analysis.match(/O\(.*?\)/g)?.[1] || 'Analyzing...'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#BDBDBD', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                                        {result.analysis}
                                    </div>
                                    <button 
                                        onClick={() => setIsExpanded(false)}
                                        style={{ marginTop: '16px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.75rem' }}
                                    >
                                        Close Analysis
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
