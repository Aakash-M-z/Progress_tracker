import { MainLayout } from '@/layouts/MainLayout';
import { Hero } from '@/sections/Hero';
import { Features } from '@/sections/Features';
import { Roadmap } from '@/sections/Roadmap';
import { Testimonials } from '@/sections/Testimonials';
import { Pricing } from '@/sections/Pricing';

export default function LandingPage() {
  return (
    <MainLayout>
      <Hero />
      <Features />
      <Roadmap />
      <Testimonials />
      <Pricing />
    </MainLayout>
  );
}
