export type RiskCategory = 'Low' | 'Medium' | 'High';

export interface IndicatorResult {
  indicatorId: string;
  name: string;
  triggered: boolean;
  explanation: string;
  scoreContribution: number;
}

export interface AnalysisSourceStatus {
  heuristic: 'COMPLETED' | 'FAILED';
  googleSafeBrowsing: 'NOT_CONFIGURED' | 'NO_THREAT_FOUND' | 'THREAT_DETECTED' | 'PROVIDER_ERROR' | 'TIMEOUT';
  threatDetails?: string[];
}

export interface ScanRecord {
  _id: string;
  hostname: string;
  sanitizedUrl: string;
  protocol: string;
  port?: string | null;
  riskScore: number;
  riskCategory: RiskCategory;
  indicators: IndicatorResult[];
  recommendations: string[];
  sourceStatus: AnalysisSourceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedScans {
  data: ScanRecord[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AnalyticsData {
  totalScans: number;
  lowRiskCount: number;
  mediumRiskCount: number;
  highRiskCount: number;
  averageRiskScore: number;
  riskDistribution: { category: RiskCategory; count: number }[];
  scansOverTime: { date: string; count: number; avgScore: number }[];
  topIndicators: { id: string; name: string; count: number; percentage: number }[];
  recentActivity: ScanRecord[];
}

export interface HealthData {
  status: string;
  uptime: number;
  timestamp: string;
  environment: string;
  database: {
    provider: string;
    connected: boolean;
    status: string;
  };
  version: string;
  app: string;
}

export interface QuizQuestion {
  id: number;
  scenario: string;
  urlExample?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: 'Homograph' | 'HTTPS' | 'Urgency' | 'Credential Harvesting' | 'Subdomains' | 'Malware' | 'Social Engineering';
}
