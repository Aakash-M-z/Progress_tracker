export * from './auth';

export interface MousePosition {
  x: number;
  y: number;
  normalizedX: number;
  normalizedY: number;
}

export interface ScrollState {
  progress: number;
  scrollY: number;
  direction: 'up' | 'down';
}

export interface NavItem {
  label: string;
  href: string;
}

export interface RoadmapNode {
  id: string;
  label: string;
  angle: number;
  radius: number;
  children?: string[];
}

export interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  ctaLabel: string;
}
