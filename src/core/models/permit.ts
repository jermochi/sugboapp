/**
 * Permit data schemas — matches assets/data/permit_steps.json
 */

export interface PermitCondition {
  [key: string]: string;
}

export interface PermitStep {
  order: number;
  id: string;
  title: string;
  office: string;
  address: string;
  lat: number;
  lng: number;
  requirements: string[];
  fee: string;
  processingTime: string;
  notes: string;
  /** null = always shown; otherwise a matcher against the profile */
  condition: PermitCondition | null;
}

export type ApplicationType = 'new' | 'renewal';
export type LegalStructure = 'sole' | 'corporation' | 'cooperative';
export type BusinessType = 'sari-sari' | 'food' | 'services' | 'bar' | 'other';

export interface PermitProfile {
  application: ApplicationType;
  businessType: BusinessType;
  legalStructure: LegalStructure;
  size?: string;
}

export interface PermitData {
  steps: PermitStep[];
}
