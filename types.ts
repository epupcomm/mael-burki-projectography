export interface Credit {
  role: string;
  name: string;
}

export interface RelatedLink {
  label: string;
  url: string;
}

export interface Project {
  id: string;
  title: string;
  thema: string;
  medium: string;
  client: string;
  secondTitle: string;
  description: string;
  startDate: string;
  endDate: string;
  totalAudience: string;
  link: string;
  thumbnail?: string;
  // Extended narrative
  context: string;
  goal: string;
  impactAnalysis: string;
  learnings: string;
  credits: Credit[];
  relatedLinks?: RelatedLink[];
}

export interface MediumMeta {
  id: string;
  title: string;
  description: string;
  approach: string;
}

export type ViewMode = 'LIST' | 'GRID' | 'DETAILS';