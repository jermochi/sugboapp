/**
 * Light trilingual string map — no full i18n system.
 * Add strings here as needed. Feature modules can import and extend.
 */

export const Strings = {
  // Onboarding
  onboarding: {
    title1: 'Welcome to SugboApp',
    desc1: 'One app for every Cebu City government service, hotline, and announcement.',
    title2: 'AI Assistant',
    desc2: 'Ask in Cebuano, Tagalog, or English — our AI walks you to the right service.',
    title3: 'Get Started',
    desc3: 'Tap the AI bar or browse services directly.',
    skip: 'Skip',
    next: 'Next',
    done: 'Get Started',
  },

  // Dashboard — "Meet Giya" home screen
  dashboard: {
    greeting: 'Maayong adlaw!',
    services: 'Services',
    searchPlaceholder: 'Pangitag serbisyo o pangutana…',
    giyaTitle: 'Meet Giya',
    giyaSubtitle: 'Your Cebu City AI companion.',
    askGiya: 'Ask Giya',
    servicesPrompt: 'What would you like to do?',
    featuredNews: 'Featured News',
    surveyTitle: 'Do you have a problem or suggestion to our system?',
    surveySubtitle: 'Answer a quick survey — tabangi mi nga mas mapaayo.',
  },

  // Bottom navigation tabs
  nav: {
    home: 'Home',
    services: 'Services',
    news: 'News',
    account: 'Account',
  },

  // Common
  common: {
    loading: 'Loading...',
    error: 'Something went wrong',
    retry: 'Try again',
    offline: 'You are offline',
    comingSoon: 'Coming soon',
    back: 'Back',
  },

  // Feature names
  features: {
    transparency: 'Transparency Tracker',
    permit: 'Business Permit',
    emergency: 'Emergency Services',
    hotlines: 'Hotlines',
    announcements: 'Announcements',
  },
} as const;
