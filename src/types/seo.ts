export interface SEOAnalysis {
  id: string;
  url: string;
  timestamp: Date;
  overallScore: number;
  categories: {
    technical: CategoryAnalysis;
    content: CategoryAnalysis;
    performance: CategoryAnalysis;
    security: CategoryAnalysis;
    mobile: CategoryAnalysis;
    accessibility: CategoryAnalysis;
  };
  recommendations: Recommendation[];
  metadata: {
    crawledPages: number;
    totalLinks: number;
    analysisDuration: number;
    lastModified: Date;
  };
}

export interface CategoryAnalysis {
  score: number;
  status: 'excellent' | 'good' | 'warning' | 'poor';
  issues: Issue[];
  positives: string[];
  metrics: Record<string, number | string>;
}

export interface Issue {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation: string;
  affectedPages: string[];
}

export interface Recommendation {
  id: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  effort: 'easy' | 'medium' | 'hard';
  steps: string[];
}

export interface CrawlerBot {
  name: string;
  description: string;
  icon: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  progress: number;
  findings: number;
}