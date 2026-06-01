/**
 * Budget data schemas — matches assets/data/budget.json
 */

export type ProjectStatus = 'planned' | 'ongoing' | 'completed';

export interface Sector {
  id: string;
  name: string;
  amount: number;
}

export interface Project {
  id: string;
  name: string;
  sectorId: string;
  allocated: number;
  spent: number;
  status: ProjectStatus;
  /** 0.0 – 1.0 */
  progress: number;
  barangay: string;
  lat: number;
  lng: number;
  timeline: string;
}

export interface BudgetData {
  year: number;
  total: number;
  currency: string;
  sectors: Sector[];
  projects: Project[];
}
