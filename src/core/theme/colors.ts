/**
 * SugboApp color palette — design tokens.
 *
 * Stub values in the right shape. Sector and status colors are
 * placeholders that can be refined during polish.
 */

export const AppColors = {
  /** Core brand */
  primary: '#1A73E8',
  primaryDark: '#1558B0',
  primaryLight: '#4A9AFF',

  accent: '#FF6D3A',
  accentDark: '#D4522A',
  accentLight: '#FF9A72',

  /** Sector colors (Transparency Tracker) */
  sector: {
    infra: '#F5A623',
    health: '#E74C3C',
    education: '#3498DB',
    social: '#2ECC71',
    admin: '#9B59B6',
    safety: '#1ABC9C',
  } as Record<string, string>,

  /** Project status colors */
  status: {
    planned: '#95A5A6',
    ongoing: '#F39C12',
    completed: '#27AE60',
  } as const,

  /** Semantic */
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  info: '#3498DB',
} as const;

export interface ThemeColors {
  text: string;
  textSecondary: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  divider: string;
  disabled: string;
}

export const LightColors: ThemeColors = {
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E5E7EB',
  divider: '#F0F0F3',
  disabled: '#D1D5DB',
};

export const DarkColors: ThemeColors = {
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  background: '#0F0F1A',
  surface: '#1A1A2E',
  surfaceElevated: '#252540',
  border: '#374151',
  divider: '#2A2A3E',
  disabled: '#4B5563',
};
