export type IssueCategory = 
  | 'water'
  | 'roads'
  | 'garbage'
  | 'traffic'
  | 'lighting'
  | 'safety'
  | 'other';

export interface Issue {
  id: string;
  category: IssueCategory;
  description: string;
  lat: number;
  lng: number;
  reportCount: number;
  lastUpdated: Date;
  createdAt: Date;
  imageUrl?: string;
  resolved: boolean;
  resolutionConfirmations: number;
  severity: number;
}

export interface CategoryInfo {
  id: IssueCategory;
  label: string;
  icon: string;
  color: string;
  weight: number;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'water', label: 'Water Supply', icon: '💧', color: '#3b82f6', weight: 1.5 },
  { id: 'roads', label: 'Roads & Potholes', icon: '🛣️', color: '#f59e0b', weight: 1.3 },
  { id: 'garbage', label: 'Garbage & Sanitation', icon: '🗑️', color: '#84cc16', weight: 1.2 },
  { id: 'traffic', label: 'Traffic & Mobility', icon: '🚗', color: '#ef4444', weight: 1.0 },
  { id: 'lighting', label: 'Electricity', icon: '⚡', color: '#a855f7', weight: 0.9 },
  { id: 'safety', label: 'Public Safety', icon: '🛡️', color: '#06b6d4', weight: 1.4 },
  { id: 'other', label: 'Other', icon: '📋', color: '#6b7280', weight: 1.0 },
];

export const getCategoryInfo = (id: IssueCategory): CategoryInfo => {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[0];
};

export const calculateSeverity = (reportCount: number, category: IssueCategory): number => {
  const categoryInfo = getCategoryInfo(category);
  return Math.round(reportCount * categoryInfo.weight * 10) / 10;
};

// Merge radius in meters
export const MERGE_RADIUS = 100;

// Calculate distance between two coordinates in meters
export const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};
