import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Code2, 
  Terminal, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Sparkles, 
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Features() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true, margin: '-10%' });
  const navigate = useNavigate();

  const PROBLEM_GRID = [
    {
      index: '001',
      tag: 'DATA EXTRACTION',
      title: 'They train on generic prompts.',
      desc: 'Most platforms feed surface-level hints that don\'t replicate high-bar engineering rounds. When edge cases hit, you get zero depth.'
    },
    {
      index: '002',
      tag: 'ARTIFICIAL SCARCITY',
      title: 'They meter your ambition.',
      desc: 'Token throttling, cloud downtime, and paywalled testcases. Right when you\'re in the flow of pre-interview prep, you hit arbitrary caps.'
    },
    {
      index: '003',
      tag: 'SILENT DOWNGRADES',
      title: 'They test on weak sample cases.',
      desc: 'Submissions pass with suboptimal O(N²) solutions without stress-testing large constraints, hidden edge cases, or memory limits.'
    },
    {
      index: '004',
      tag: 'FRAGMENTED STACKS',
      title: 'They scatter your focus.',
      desc: 'DSA on one site, core CS subjects on another, and mock interviews nowhere. Constant context switching destroys retention.'
    }
  ];

  const CAPABILITIES = [
    {
      id: '01',
      icon: Terminal,
      title: 'Deterministic Code Execution',
      desc: 'Multi-language runtime supporting JS, Python 3, Java, and C++ with millisecond timing, memory profiling, and exact diff validation.'
    },
    {
      id: '02',
      icon: ShieldCheck,
      title: 'Live Anti-Cheating & Proctoring',
      desc: 'Active tab tracking, fullscreen lock, copy-paste defense, window blur telemetry, and automatic integrity audit logging.'
    },
    {
      id: '03',
      icon: Code2,
      title: 'Complete LeetCode Problem Bank',
      desc: 'Direct problem integration with multi-language starter templates, categorized topic tagging, and complexity analyzers.'
    },
    {
      id: '04',
      icon: Layers,
      title: 'Core CS Subject Mastery',
      desc: 'Dedicated modules covering Operating Systems, DBMS/SQL, Computer Networks, and High-Level System Design.'
    },
    {
      id: '05',
      icon: Sparkles,
      title: 'Interactive Assessment Studio',
      desc: 'Build custom technical tests, invite candidates via verified Gmail links, and generate comprehensive scoring audit reports.'
    },
    {
      id: '06',
      icon: Cpu,
      title: 'AI Mock Technical Interviews',
      desc: 'Dynamic voice & text technical interview sessions with real-time feedback, behavioral scoring, and rubric breakdowns.'
    }
  ];

  return (
    <section
      ref={ref}
      id="platform"
      className="relative bg-[#070709] text-white py-28 lg:py-36 px-6 lg:px-12 border-t border-white/10"
      data-testid="features-section"
    >
      {/* ── 1. THE PROBLEM SECTION (Matching Rig.ai Visual) ─── */}
      <div className="max-w-7xl mx-auto mb-36">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF3B1F]/10 border border-[#FF3B1F]/30 text-[#FF3B1F] text-xs font-mono font-bold tracking-widest uppercase mb-6">
            ✕ THE PROBLEM
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight max-w-4xl mx-auto">
            You don't own your interview prep.
            <br />
            <span className="text-white/40">And you're hitting rate limits.</span>
          </h2>
        </div>

        {/* 4-Quadrant Grid with Radar Graphic in Center */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 relative">
          {/* Subtle Radar Center Graphic */}
          <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none opacity-20 z-0">
            <div className="w-full h-full rounded-full border border-[#FF3B1F] flex items-center justify-center animate-spin" style={{ animationDuration: '20s' }}>
              <div className="w-3/4 h-3/4 rounded-full border border-[#FF3B1F]/40 flex items-center justify-center">
                <div className="w-1/2 h-1/2 rounded-full border border-dashed border-[#FF3B1F]/60" />
              </div>
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#FF3B1F] shadow-[0_0_12px_#FF3B1F]" />
          </div>

          {PROBLEM_GRID.map((p) => (
            <div
              key={p.index}
              className="relative p-8 lg:p-10 bg-[#0E0E12] border border-white/10 hover:border-[#FF3B1F]/40 transition-all duration-300 z-10"
            >
              <div className="flex items-center justify-between font-mono text-xs text-[#FF3B1F] mb-4">
                <span className="tracking-widest font-bold">{p.tag}</span>
                <span className="text-white/30">{p.index}</span>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-3">
                {p.title}
              </h3>
              <p className="text-white/60 text-sm lg:text-base leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. INTRODUCING ALGOASCENT (Geometric Red Cuts Banner) ─── */}
      <div className="max-w-7xl mx-auto">
        {/* Horizontal Geometric Cuts */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-1.5 w-16 bg-[#FF3B1F]" />
          <div className="h-1.5 w-32 bg-[#FF3B1F]" />
          <div className="h-1.5 flex-1 bg-[#FF3B1F]/30" />
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-20">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF3B1F]/10 border border-[#FF3B1F]/30 text-[#FF3B1F] text-xs font-mono font-bold tracking-widest uppercase mb-4">
              ✓ INTRODUCING ALGOASCENT
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
              Everything deterministic.
              <br />
              Own your engineering.
            </h2>
          </div>
          <p className="text-white/60 text-base sm:text-lg max-w-lg leading-relaxed">
            A complete technical preparation and evaluation ecosystem built for software engineers, students, and hiring teams.
          </p>
        </div>

        {/* 6-Grid Capabilities Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAPABILITIES.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.id}
                className="group relative p-8 bg-[#0E0E12] border border-white/10 hover:border-[#FF3B1F] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 flex items-center justify-center bg-black border border-white/15 text-[#FF3B1F] group-hover:border-[#FF3B1F] transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-xs text-white/30 group-hover:text-[#FF3B1F] transition-colors">
                      FEATURE {cap.id}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#FF3B1F] transition-colors">
                    {cap.title}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {cap.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/40 group-hover:text-white transition-colors">
                  <span>PRODUCTION READY</span>
                  <ChevronRight className="w-4 h-4 text-[#FF3B1F] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Live CTA Card */}
        <div className="mt-16 p-8 lg:p-12 bg-gradient-to-r from-[#0E0E12] to-[#16161D] border-2 border-[#FF3B1F]/40 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="font-mono text-xs text-[#FF3B1F] font-bold tracking-widest uppercase">
              COMPLETE ENGINEERING ECOSYSTEM
            </span>
            <h3 className="text-2xl lg:text-3xl font-bold text-white mt-1 mb-2">
              Ready to elevate your engineering career?
            </h3>
            <p className="text-white/60 text-sm max-w-xl">
              Solve LeetCode patterns, master operating systems & database internals, conduct AI mock interviews, or run live assessments.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="rig-chamfer-btn whitespace-nowrap px-8 py-4 bg-[#FF3B1F] text-black font-bold text-sm tracking-wide hover:bg-[#E63219] active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-[#FF3B1F]/20"
            >
              <span>Launch Platform</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/assessment/algoascent-test-assessment')}
              className="whitespace-nowrap px-6 py-4 border border-white/20 bg-black/40 text-white font-bold text-sm hover:border-white/40 transition-all"
            >
              <span>Test Assessment</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
