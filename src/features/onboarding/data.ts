/**
 * Static content for the first-launch walkthrough.
 *
 * Five branded slides covering the services that ship today — Giya (the AI front
 * door), Business Permits, the Transparency/Budget Tracker, and Emergency
 * hotlines — bookended by a welcome. Copy keeps the app's warm Bisaya/English
 * voice (mirrors `dashboard/data.ts`). Each slide pairs its text with a
 * screenshot of the real destination screen, shown inside the phone mockup
 * ({@link PhoneMockup}) per the onboarding layout.
 */

import type { ImageSourcePropType } from 'react-native';

export interface OnboardingSlide {
  id: string;
  /** Small label above the title (optional). */
  eyebrow?: string;
  /** Title text; `emphasis` words are tinted with the slide accent. */
  title: string;
  /** Substring of `title` to highlight in the accent color. */
  emphasis?: string;
  body: string;
  /** Screenshot of the destination screen, drawn inside the phone mockup. */
  image: ImageSourcePropType;
  /** Accent color for the emphasis word. */
  accent: string;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'welcome',
    title: 'Cebu City at your fingertips',
    emphasis: 'fingertips',
    body: 'One app for every city service, hotline, and update — no more bouncing between offices and Facebook pages.',
    image: require('../../../assets/images/home-screen.jpeg'),
    accent: '#990000',
  },
  {
    id: 'giya',
    eyebrow: 'Meet Giya',
    title: 'Just ask — even in Bisaya',
    emphasis: 'Bisaya',
    body: 'Tell Giya what you need by voice or text, and it takes you straight to the right service.',
    image: require('../../../assets/images/giya-chat.jpeg'),
    accent: '#990000',
  },
  {
    id: 'permits',
    eyebrow: 'Business Permits',
    title: 'Permits, step by step',
    emphasis: 'step by step',
    body: 'See every requirement laid out, follow the roadmap, and keep track of your renewal.',
    image: require('../../../assets/images/giya-screen.jpeg'),
    accent: '#6B2E1E',
  },
  {
    id: 'budget',
    eyebrow: 'Transparency Tracker',
    title: 'See where the budget goes',
    emphasis: 'budget',
    body: "Explore Cebu City's spending — by sector and barangay — with clear, simple charts.",
    image: require('../../../assets/images/budget-screen.jpeg'),
    accent: '#DAA520',
  },
  {
    id: 'emergency',
    eyebrow: 'Emergency',
    title: 'Help when it matters',
    emphasis: 'matters',
    body: 'Reach city hotlines in one tap when every second counts. Tabang, dali ra.',
    image: require('../../../assets/images/emergency-screen.jpeg'),
    accent: '#C0392B',
  },
];
