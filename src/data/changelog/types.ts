import { LucideIcon } from 'lucide-react';

export type FeatureType = 'feat' | 'fix' | 'refactor';

export interface Feature {
  type: FeatureType;
  icon: LucideIcon;
  titleKey: string;
  descriptionKey: string;
  commits: string[];
}

export interface ChangelogEntry {
  version: string;
  date: string;
  titleKey: string;
  descriptionKey: string;
  features: Feature[];
}

export interface ChangelogData {
  entries: ChangelogEntry[];
}