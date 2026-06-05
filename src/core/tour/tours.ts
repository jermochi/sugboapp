/**
 * Authored walkthroughs.
 *
 * Each tour is a list of steps that spotlight a real on-screen control (by
 * {@link TourSpot} id) with guidance copy. Target ids live here as constants so
 * screens and tours can't drift out of sync.
 */
import type { TourDef } from './types';

/** Stable target ids — shared between screens (TourSpot id) and tours. */
export const TourTargets = {
  dashSearch: 'dash.search',
  dashAskGiya: 'dash.askGiya',
  dashServices: 'dash.services',
  dashEmergencyTab: 'dash.emergencyTab',

  permitSummary: 'permit.summary',
  permitStep: 'permit.step',
  permitGiya: 'permit.giya',

  giyaPortrait: 'giya.portrait',
  giyaMic: 'giya.mic',
  giyaType: 'giya.type',

  transStats: 'transparency.stats',
  transGrid: 'transparency.grid',
  transGiya: 'transparency.giya',

  emerSearch: 'emergency.search',
  emerSlide: 'emergency.slide',
  emerCategories: 'emergency.categories',
} as const;

export const DASHBOARD_TOUR: TourDef = {
  id: 'dashboard',
  name: 'Home',
  steps: [
    {
      targetId: TourTargets.dashSearch,
      title: 'Find anything, fast',
      body: 'Search for any city service — or just type your question. Pwede sad sa Bisaya.',
      placement: 'bottom',
    },
    {
      targetId: TourTargets.dashAskGiya,
      title: 'Meet Giya',
      body: 'Tap Ask Giya to get walked to the right office by voice or text.',
      placement: 'bottom',
      padding: 10,
    },
    {
      targetId: TourTargets.dashServices,
      title: 'Jump into a service',
      body: 'These tiles open city services directly. Open any one yourself to explore — each has its own quick guide.',
      placement: 'bottom',
      padding: 10,
    },
    {
      targetId: TourTargets.dashEmergencyTab,
      title: 'Help is one tap away',
      body: 'Reach city emergency hotlines anytime from the Emergency tab.',
      placement: 'top',
    },
  ],
};

export const PERMIT_TOUR: TourDef = {
  id: 'permit',
  name: 'Business Permits',
  steps: [
    {
      targetId: TourTargets.permitSummary,
      title: 'Your roadmap at a glance',
      body: 'Here are your estimated fees and how many steps you have left.',
      placement: 'bottom',
    },
    {
      targetId: TourTargets.permitStep,
      title: 'Work step by step',
      body: 'Tap any step to see its requirements and check them off as you go.',
      placement: 'bottom',
    },
    {
      targetId: TourTargets.permitGiya,
      title: 'Stuck on a step?',
      body: 'Tap Giya to ask about any requirement — even in Bisaya.',
      placement: 'top',
    },
  ],
};

export const GIYA_TOUR: TourDef = {
  id: 'giya',
  name: 'Ask Giya',
  steps: [
    {
      targetId: TourTargets.giyaPortrait,
      title: 'This is Giya',
      body: 'Your Cebu City assistant. Ask about any service in Bisaya, Tagalog, or English.',
      placement: 'bottom',
      padding: 12,
    },
    {
      targetId: TourTargets.giyaMic,
      title: 'Ask by voice',
      body: 'Tap the mic and just speak — Giya listens, then routes you to the right service.',
      placement: 'top',
      padding: 10,
    },
    {
      targetId: TourTargets.giyaType,
      title: 'Or type instead',
      body: 'Prefer to write? Tap “Type instead” to ask using the keyboard.',
      placement: 'top',
    },
  ],
};

export const TRANSPARENCY_TOUR: TourDef = {
  id: 'transparency',
  name: 'Transparency',
  steps: [
    {
      targetId: TourTargets.transStats,
      title: 'The numbers at a glance',
      body: 'How many public records, files, and sources are tracked right now.',
      placement: 'bottom',
    },
    {
      targetId: TourTargets.transGrid,
      title: 'Browse by category',
      body: 'Budgets, disclosure reports, and procurement. Tap any card to open its records.',
      placement: 'bottom',
      padding: 10,
    },
    {
      targetId: TourTargets.transGiya,
      title: 'Make sense of the figures',
      body: 'Tap Giya to explain any budget line — even in Bisaya.',
      placement: 'top',
    },
  ],
};

export const EMERGENCY_TOUR: TourDef = {
  id: 'emergency',
  name: 'Emergency',
  steps: [
    {
      targetId: TourTargets.emerSearch,
      title: 'Find a hotline',
      body: 'Search any office or number by name. The directory works even offline.',
      placement: 'bottom',
      padding: 10,
    },
    {
      targetId: TourTargets.emerSlide,
      title: 'Slide to call',
      body: 'In a real emergency, drag this slider to instantly dial the main hotline.',
      placement: 'bottom',
      padding: 10,
    },
    {
      targetId: TourTargets.emerCategories,
      title: 'Hotlines by category',
      body: 'Tap a category — medical, fire, and more — to see all of its numbers.',
      placement: 'top',
      padding: 10,
    },
  ],
};

/** Registry for lookup by id (used by useAutoTour / startTour). */
export const TOURS: Record<string, TourDef> = {
  [DASHBOARD_TOUR.id]: DASHBOARD_TOUR,
  [PERMIT_TOUR.id]: PERMIT_TOUR,
  [GIYA_TOUR.id]: GIYA_TOUR,
  [TRANSPARENCY_TOUR.id]: TRANSPARENCY_TOUR,
  [EMERGENCY_TOUR.id]: EMERGENCY_TOUR,
};
