/**
 * Static content for the first-launch walkthrough.
 *
 * Five branded slides covering the services that actually ship today — Giya
 * (the AI front door), Business Permits, the Transparency/Budget Tracker, and
 * Emergency hotlines — bookended by a welcome. Copy keeps the app's warm
 * Bisaya/English voice (mirrors `dashboard/data.ts`). Each slide names a
 * `visual` kind that {@link SlideVisual} knows how to paint with the existing
 * brand assets (Giya mascot, Sinulog star motif, Icon set).
 */

import type { IconName } from '@/core/components';

/** Which illustration {@link SlideVisual} renders for a slide. */
export type SlideVisualKind = 'mascot' | 'giya' | 'service' | 'emergency';

/**
 * The body layout of the destination screen drawn inside the phone mockup for
 * `service` / `emergency` slides — a roadmap step list, a budget bar chart, or
 * an emergency hotline card.
 */
export type SlideFlowKind = 'steps' | 'bars' | 'hotline';

export interface OnboardingSlide {
  id: string;
  /** Small label above the title (optional). */
  eyebrow?: string;
  /** Title text; `emphasis` words are tinted with the slide accent. */
  title: string;
  /** Substring of `title` to highlight in the accent color. */
  emphasis?: string;
  body: string;
  visual: SlideVisualKind;
  /** Icon shown for `service` / `emergency` visuals (and the home tile to tap). */
  icon?: IconName;
  /** Destination-screen body drawn in the phone mockup (service/emergency). */
  flow?: SlideFlowKind;
  /** Accent color for the emphasis word + visual glow. */
  accent: string;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'welcome',
    title: 'Cebu City at your fingertips',
    emphasis: 'fingertips',
    body: 'One app for every city service, hotline, and update — no more bouncing between offices and Facebook pages.',
    visual: 'mascot',
    accent: '#990000',
  },
  {
    id: 'giya',
    eyebrow: 'Meet Giya',
    title: 'Just ask — even in Bisaya',
    emphasis: 'Bisaya',
    body: 'Tell Giya what you need by voice or text, and it takes you straight to the right service.',
    visual: 'giya',
    accent: '#990000',
  },
  {
    id: 'permits',
    eyebrow: 'Business Permits',
    title: 'Permits, step by step',
    emphasis: 'step by step',
    body: 'See every requirement laid out, follow the roadmap, and keep track of your renewal.',
    visual: 'service',
    icon: 'permit',
    flow: 'steps',
    accent: '#6B2E1E',
  },
  {
    id: 'budget',
    eyebrow: 'Transparency Tracker',
    title: 'See where the budget goes',
    emphasis: 'budget',
    body: "Explore Cebu City's spending — by sector and barangay — with clear, simple charts.",
    visual: 'service',
    icon: 'budget',
    flow: 'bars',
    accent: '#DAA520',
  },
  {
    id: 'emergency',
    eyebrow: 'Emergency',
    title: 'Help when it matters',
    emphasis: 'matters',
    body: 'Reach city hotlines in one tap when every second counts. Tabang, dali ra.',
    visual: 'emergency',
    icon: 'emergency',
    flow: 'hotline',
    accent: '#C0392B',
  },
];
