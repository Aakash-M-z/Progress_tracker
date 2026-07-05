import { useEffect } from 'react';
import { useLenis } from '@/hooks/useLenis';
import { Navigation } from '@/sections/Navigation';
import { Footer } from '@/sections/Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  useLenis();

  // Override html/body height to allow natural document scrolling on landing page
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlHeight = html.style.height;
    const prevBodyHeight = body.style.height;
    html.style.height = 'auto';
    body.style.height = 'auto';
    return () => {
      html.style.height = prevHtmlHeight;
      body.style.height = prevBodyHeight;
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
