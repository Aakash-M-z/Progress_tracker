import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DSATopic, Activity } from '../types';
import ProblemPage from './ProblemPage';
import { BookOpen, Map, Zap, Brain, CheckCircle, ArrowRight, Activity as ActivityIcon } from 'lucide-react';
import { useActivities } from '../hooks/useActivities';

interface Props {
  activities?: Activity[];
}

const DSA_ROADMAP: DSATopic[] = [
  { name: 'Arrays & Strings', category: 'Data Structures', difficulty: 'Beginner', status: 'Not Started', problemsSolved: 0, totalProblems: 20 },
  { name: 'Linked Lists', category: 'Data Structures', difficulty: 'Beginner', status: 'Not Started', problemsSolved: 0, totalProblems: 15 },
  { name: 'Stacks & Queues', category: 'Data Structures', difficulty: 'Beginner', status: 'Not Started', problemsSolved: 0, totalProblems: 12 },
  { name: 'Trees & Binary Trees', category: 'Data Structures', difficulty: 'Intermediate', status: 'Not Started', problemsSolved: 0, totalProblems: 25 },
  { name: 'Graphs', category: 'Data Structures', difficulty: 'Intermediate', status: 'Not Started', problemsSolved: 0, totalProblems: 20 },
  { name: 'Heap/Priority Queue', category: 'Data Structures', difficulty: 'Intermediate', status: 'Not Started', problemsSolved: 0, totalProblems: 10 },
  { name: 'Trie', category: 'Data Structures', difficulty: 'Advanced', status: 'Not Started', problemsSolved: 0, totalProblems: 8 },
  { name: 'Union Find', category: 'Data Structures', difficulty: 'Advanced', status: 'Not Started', problemsSolved: 0, totalProblems: 6 },
  { name: 'Binary Search', category: 'Algorithms', difficulty: 'Beginner', status: 'Not Started', problemsSolved: 0, totalProblems: 15 },
  { name: 'Two Pointers', category: 'Algorithms', difficulty: 'Beginner', status: 'Not Started', problemsSolved: 0, totalProblems: 12 },
  { name: 'Sliding Window', category: 'Algorithms', difficulty: 'Intermediate', status: 'Not Started', problemsSolved: 0, totalProblems: 15 },
  { name: 'Sorting', category: 'Algorithms', difficulty: 'Beginner', status: 'Not Started', problemsSolved: 0, totalProblems: 10 },
  { name: 'Recursion', category: 'Algorithms', difficulty: 'Beginner', status: 'Not Started', problemsSolved: 0, totalProblems: 12 },
  { name: 'Backtracking', category: 'Algorithms', difficulty: 'Advanced', status: 'Not Started', problemsSolved: 0, totalProblems: 15 },
  { name: 'Dynamic Programming', category: 'Algorithms', difficulty: 'Advanced', status: 'Not Started', problemsSolved: 0, totalProblems: 30 },
  { name: 'Greedy Algorithms', category: 'Algorithms', difficulty: 'Intermediate', status: 'Not Started', problemsSolved: 0, totalProblems: 18 },
  { name: 'Bit Manipulation', category: 'Algorithms', difficulty: 'Advanced', status: 'Not Started', problemsSolved: 0, totalProblems: 8 },
  { name: 'Math', category: 'Algorithms', difficulty: 'Intermediate', status: 'Not Started', problemsSolved: 0, totalProblems: 12 },
];

const TOPICS_WITH_PROBLEMS = new Set([
  'Arrays & Strings', 'Linked Lists', 'Stacks & Queues', 'Trees & Binary Trees',
  'Dynamic Programming', 'Graphs', 'Binary Search', 'Two Pointers',
]);

const ROADMAP_STAGES = [
  {
    title: 'Foundation',
    description: 'The fundamental building blocks. Master these to build a strong algorithmic intuition.',
    icon: <BookOpen size={20} color="#D4AF37" />,
    color: '#D4AF37',
    topics: ['Arrays & Strings', 'Linked Lists', 'Stacks & Queues', 'Sorting', 'Binary Search']
  },
  {
    title: 'Core Patterns',
    description: 'Essential problem-solving techniques used in 80% of technical interviews.',
    icon: <Zap size={20} color="#38bdf8" />,
    color: '#38bdf8',
    topics: ['Two Pointers', 'Sliding Window', 'Math']
  },
  {
    title: 'Trees & Graphs',
    description: 'Non-linear data structures for hierarchical and relational data representation.',
    icon: <Map size={20} color="#f59e0b" />,
    color: '#f59e0b',
    topics: ['Trees & Binary Trees', 'Graphs', 'Heap/Priority Queue', 'Trie', 'Union Find']
  },
  {
    title: 'Advanced Topics',
    description: 'Complex algorithms for optimization and deep computer science concepts.',
    icon: <Brain size={20} color="#ef4444" />,
    color: '#ef4444',
    topics: ['Dynamic Programming', 'Backtracking', 'Greedy Algorithms', 'Recursion', 'Bit Manipulation']
  }
];

const DIFF_STYLE: Record<string, { color: string; bg: string }> = {
  Beginner: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  Intermediate: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  Advanced: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  'Not Started': { color: '#555', bg: 'rgba(255,255,255,0.04)' },
  'In Progress': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  'Completed': { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  'Mastered': { color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
};

const DSARoadmap: React.FC = () => {
  const { data: activities = [] } = useActivities();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const roadmapData = useMemo(() => {
    const data: Record<string, DSATopic> = {};
    DSA_ROADMAP.forEach(topic => {
      const related = activities.filter(a =>
        a.category === topic.name || a.dsaTopic?.includes(topic.name)
      );
      const solved = related.filter(a => a.problemSolved).length;
      let status: DSATopic['status'] = 'Not Started';
      if (solved > 0) {
        if (solved >= topic.totalProblems * 0.8) status = 'Mastered';
        else if (solved >= topic.totalProblems * 0.5) status = 'Completed';
        else status = 'In Progress';
      }
      data[topic.name] = { ...topic, problemsSolved: solved, status };
    });
    return data;
  }, [activities]);

  const overall = Object.values(roadmapData).reduce((a, t) => ({ s: a.s + t.problemsSolved, t: a.t + t.totalProblems }), { s: 0, t: 0 });
  const pct = overall.t > 0 ? Math.round(overall.s / overall.t * 100) : 0;

  // Find the next recommended topic
  let nextRecommendedTopic: string | null = null;
  for (const stage of ROADMAP_STAGES) {
    for (const tName of stage.topics) {
      const t = roadmapData[tName];
      if (t && (t.status === 'Not Started' || t.status === 'In Progress')) {
        nextRecommendedTopic = tName;
        break;
      }
    }
    if (nextRecommendedTopic) break;
  }

  // Show ProblemPage when a topic is selected
  if (selectedTopic) {
    return (
      <ProblemPage
        category={selectedTopic}
        onBack={() => setSelectedTopic(null)}
      />
    );
  }

  return (
    <div className="section-gap animate-fadeIn" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h2 className="page-heading" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Learning Journey</h2>
        <p className="page-subheading" style={{ fontSize: '1.1rem' }}>Master Data Structures and Algorithms step-by-step</p>
      </div>

      {/* Overall Progress Banner */}
      <motion.div 
        className="card-dark" 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ padding: '24px 30px', marginBottom: '40px', background: 'linear-gradient(135deg, rgba(20,20,20,0.8), rgba(30,30,30,0.9))', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#FFF', fontWeight: 600 }}>Overall Progress</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#888', marginTop: '4px' }}>{overall.s} of {overall.t} problems completed</p>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#D4AF37', textShadow: '0 0 20px rgba(212,175,55,0.3)' }}>
            {pct}%
          </div>
        </div>
        <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '999px', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ height: '100%', background: 'linear-gradient(90deg, #D4AF37, #FFD700)', borderRadius: '999px', boxShadow: '0 0 12px rgba(212,175,55,0.5)' }} 
          />
        </div>
      </motion.div>

      {/* Journey Timeline */}
      <div style={{ position: 'relative', paddingLeft: '20px' }}>
        {/* Main Vertical Connecting Line */}
        <div style={{ position: 'absolute', left: '38px', top: '40px', bottom: '40px', width: '2px', background: 'linear-gradient(to bottom, rgba(212,175,55,0.3), rgba(255,255,255,0.05))', borderRadius: '2px' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
          {ROADMAP_STAGES.map((stage, sIdx) => {
            const stageTopics = stage.topics.map(t => roadmapData[t]).filter(Boolean);
            const stageSolved = stageTopics.reduce((sum, t) => sum + t.problemsSolved, 0);
            const stageTotal = stageTopics.reduce((sum, t) => sum + t.totalProblems, 0);
            const stagePct = stageTotal > 0 ? Math.round(stageSolved / stageTotal * 100) : 0;
            const isCompleted = stagePct === 100;

            return (
              <motion.div 
                key={stage.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: sIdx * 0.1 }}
                style={{ position: 'relative' }}
              >
                {/* Stage Header */}
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '12px', 
                    background: isCompleted ? 'rgba(34,197,94,0.15)' : `rgba(${parseInt(stage.color.slice(1,3),16)},${parseInt(stage.color.slice(3,5),16)},${parseInt(stage.color.slice(5,7),16)},0.15)`, 
                    border: `1px solid ${isCompleted ? '#22c55e' : stage.color}`, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
                    boxShadow: isCompleted ? '0 0 15px rgba(34,197,94,0.3)' : `0 0 15px ${stage.color}40`
                  }}>
                    {isCompleted ? <CheckCircle size={20} color="#22c55e" /> : stage.icon}
                  </div>
                  <div style={{ flex: 1, paddingTop: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#FFF' }}>{stage.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#888' }}>{stageSolved} / {stageTotal}</span>
                        <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ width: `${stagePct}%`, height: '100%', background: isCompleted ? '#22c55e' : stage.color, borderRadius: '999px' }} />
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isCompleted ? '#22c55e' : '#EAEAEA', width: '35px', textAlign: 'right' }}>{stagePct}%</span>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#888', marginTop: '6px', lineHeight: 1.5 }}>{stage.description}</p>
                  </div>
                </div>

                {/* Topics Grid */}
                <div style={{ paddingLeft: '60px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                  {stage.topics.map(topicName => {
                    const topic = roadmapData[topicName];
                    if (!topic) return null;

                    const diff = DIFF_STYLE[topic.difficulty] ?? DIFF_STYLE.Beginner;
                    const stat = STATUS_STYLE[topic.status] ?? STATUS_STYLE['Not Started'];
                    const topicPct = Math.round(topic.problemsSolved / topic.totalProblems * 100);
                    const hasProblems = TOPICS_WITH_PROBLEMS.has(topic.name);
                    const isNext = topic.name === nextRecommendedTopic;

                    return (
                      <motion.div
                        key={topic.name}
                        whileHover={{ y: -4, boxShadow: isNext ? '0 12px 30px rgba(212,175,55,0.15)' : '0 12px 30px rgba(0,0,0,0.6)' }}
                        style={{
                          background: 'rgba(20,20,20,0.95)',
                          borderRadius: '16px',
                          border: isNext ? '1px solid rgba(212,175,55,0.5)' : '1px solid rgba(255,255,255,0.06)',
                          boxShadow: isNext ? '0 0 20px rgba(212,175,55,0.08)' : '0 4px 20px rgba(0,0,0,0.4)',
                          padding: '20px',
                          position: 'relative',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        {isNext && (
                          <div style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(212,175,55,0.15)', color: '#D4AF37', fontSize: '0.7rem', fontWeight: 700, padding: '4px 12px', borderBottomLeftRadius: '12px', borderLeft: '1px solid rgba(212,175,55,0.3)', borderBottom: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ActivityIcon size={12} /> UP NEXT
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: isNext ? '#D4AF37' : '#EAEAEA', marginBottom: '6px' }}>{topic.name}</h4>
                            <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '6px', background: diff.bg, color: diff.color, fontWeight: 600 }}>
                              {topic.difficulty}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '999px', fontWeight: 600, background: stat.bg, color: stat.color, border: `1px solid ${stat.color}40`, marginTop: isNext ? '18px' : '0' }}>
                            {topic.status}
                          </span>
                        </div>

                        <div style={{ flex: 1 }} />

                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.8rem', color: '#888' }}>Progress</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#EAEAEA' }}>{topic.problemsSolved} / {topic.totalProblems}</span>
                          </div>
                          <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: `${topicPct}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                              style={{ height: '100%', background: isNext ? 'linear-gradient(90deg, #D4AF37, #FFD700)' : stat.color, borderRadius: '999px' }} 
                            />
                          </div>
                        </div>

                        {hasProblems ? (
                          <button
                            onClick={() => setSelectedTopic(topic.name)}
                            style={{
                              width: '100%', padding: '10px', borderRadius: '8px', border: 'none',
                              background: isNext ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.05)',
                              color: isNext ? '#D4AF37' : '#CCC',
                              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                              transition: 'all 0.2s',
                              borderTop: '1px solid rgba(255,255,255,0.02)'
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLButtonElement).style.background = isNext ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.1)';
                              (e.currentTarget as HTMLButtonElement).style.color = isNext ? '#FFD700' : '#FFF';
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLButtonElement).style.background = isNext ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.05)';
                              (e.currentTarget as HTMLButtonElement).style.color = isNext ? '#D4AF37' : '#CCC';
                            }}
                          >
                            Solve Problems <ArrowRight size={14} />
                          </button>
                        ) : (
                          <div style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: '#555', fontSize: '0.8rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.02)' }}>
                            Coming Soon
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DSARoadmap;
