import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, navItem } from '../animations/variants';

interface NavItem {
    label: string;
    href: string;
}

const NAV_ITEMS: NavItem[] = [
    { label: 'Platform', href: '#platform' },
    { label: 'Features', href: '#features' },
    { label: 'Roadmap', href: '#roadmap' },
    { label: 'Problems', href: '#problems' },
];

interface NavigationProps {
    onGetStarted: () => void;
}

export function Navigation({ onGetStarted }: NavigationProps) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 60);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
        setMobileOpen(false);
    };

    return (
        <>
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
                className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-5 px-4"
                data-testid="navigation"
            >
                <nav
                    className={`
            flex items-center gap-1 px-2 py-2 rounded-full transition-all duration-500
            ${scrolled
                            ? 'landing-glass shadow-2xl'
                            : 'bg-transparent border border-white/[0.05]'
                        }
          `}
                    style={{ minWidth: 'min(620px, calc(100vw - 32px))' }}
                >
                    {/* Logo */}
                    <div className="flex items-center gap-2 px-4 mr-auto">
                        <div className="relative w-5 h-5">
                            <div className="absolute inset-0 rounded-sm bg-white opacity-90" />
                            <div className="absolute inset-[3px] rounded-[2px] bg-black" />
                            <div className="absolute inset-[5px] rounded-[1px] bg-white opacity-60" />
                        </div>
                        <span
                            className="text-white font-semibold text-[13px] landing-letter-widest uppercase tracking-[0.14em]"
                            data-testid="nav-logo"
                        >
                            AlgoAscent
                        </span>
                    </div>

                    {/* Nav links — desktop */}
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="hidden md:flex items-center gap-1"
                    >
                        {NAV_ITEMS.map((item) => (
                            <motion.a
                                key={item.label}
                                variants={navItem}
                                href={item.href}
                                onClick={(e) => handleNavClick(e, item.href)}
                                className="
                  relative px-4 py-2 rounded-full text-sm font-medium
                  text-white/55 hover:text-white/90
                  transition-colors duration-300
                  group
                "
                                data-testid={`nav-item-${item.label.toLowerCase()}`}
                            >
                                {item.label}
                                <span className="
                  absolute inset-0 rounded-full opacity-0 group-hover:opacity-100
                  bg-white/[0.05] transition-opacity duration-300
                " />
                            </motion.a>
                        ))}
                    </motion.div>

                    {/* CTA — desktop */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="hidden md:block ml-2"
                    >
                        <button
                            onClick={onGetStarted}
                            className="
                inline-flex items-center gap-2 px-5 py-2 rounded-full
                bg-white text-black text-sm font-semibold
                hover:bg-white/90 active:bg-white/80
                transition-all duration-200
                hover:scale-[1.02] active:scale-[0.98]
              "
                            data-testid="nav-cta"
                        >
                            Get Started
                        </button>
                    </motion.div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden ml-auto mr-2 w-8 h-8 flex flex-col items-center justify-center gap-1.5"
                        data-testid="nav-mobile-toggle"
                        aria-label="Toggle menu"
                    >
                        <span className={`block w-4.5 h-[1.5px] bg-white/70 transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[3px]' : ''}`} />
                        <span className={`block h-[1.5px] bg-white/70 transition-all duration-300 ${mobileOpen ? 'w-0' : 'w-3'}`} />
                        <span className={`block w-4.5 h-[1.5px] bg-white/70 transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[3px]' : ''}`} />
                    </button>
                </nav>
            </motion.header>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="fixed top-20 left-4 right-4 z-40 landing-glass rounded-2xl p-4 md:hidden"
                        data-testid="nav-mobile-menu"
                    >
                        {NAV_ITEMS.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                onClick={(e) => handleNavClick(e, item.href)}
                                className="block py-3 px-4 text-white/65 hover:text-white text-sm font-medium border-b border-white/[0.06] last:border-0 transition-colors duration-200"
                            >
                                {item.label}
                            </a>
                        ))}
                        <button
                            onClick={onGetStarted}
                            className="block w-full mt-3 px-4 py-3 bg-white text-black text-sm font-semibold rounded-xl text-center hover:bg-white/90 transition-colors duration-200"
                        >
                            Get Started
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
