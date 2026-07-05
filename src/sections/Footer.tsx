import { motion } from 'framer-motion';

const LINKS = {
  Product: ['Roadmaps', 'AI Practice', 'Challenges', 'System Design', 'Analytics'],
  Company: ['About', 'Blog', 'Careers', 'Press'],
  Resources: ['Documentation', 'Community', 'Changelog', 'Status'],
  Legal: ['Privacy', 'Terms', 'Cookies'],
};

export function Footer() {
  return (
    <footer
      className="relative border-t border-white/[0.06] px-6 lg:px-12 pt-16 pb-10"
      data-testid="footer"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16">
          {/* Brand column */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-5 h-5">
                <div className="absolute inset-0 rounded-sm bg-white opacity-90" />
                <div className="absolute inset-[3px] rounded-[2px] bg-black" />
                <div className="absolute inset-[5px] rounded-[1px] bg-white opacity-60" />
              </div>
              <span className="text-white font-semibold text-sm tracking-[0.12em] uppercase">
                AlgoAscent
              </span>
            </div>
            <p className="text-white/35 text-sm leading-relaxed max-w-[200px]">
              Master every interview. Built for engineers who refuse to settle.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <p className="text-white/30 text-[11px] font-medium uppercase tracking-[0.16em] mb-4">
                {category}
              </p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-white/40 hover:text-white/70 text-sm transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.05]">
          <p className="text-white/25 text-xs">
            © 2025 AlgoAscent. All rights reserved.
          </p>

          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/70 animate-pulse" />
            <span className="text-white/25 text-xs">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
