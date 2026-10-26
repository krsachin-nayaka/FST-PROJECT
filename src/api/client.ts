import axios from 'axios';
import {
  ScanRecord,
  PaginatedScans,
  AnalyticsData,
  HealthData,
  RiskCategory,
} from '../types/index.ts';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface GetScansParams {
  page?: number;
  limit?: number;
  search?: string;
  riskCategory?: RiskCategory | '';
  sortBy?: 'createdAt' | 'riskScore';
  sortOrder?: 'asc' | 'desc';
}

export const scanApi = {
  async createScan(url: string): Promise<ScanRecord> {
    const res = await api.post<{ success: boolean; data: ScanRecord }>('/scans', { url });
    return res.data.data;
  },

  async getScans(params: GetScansParams = {}): Promise<PaginatedScans> {
    const res = await api.get<{ success: boolean; data: ScanRecord[]; pagination: PaginatedScans['pagination'] }>(
      '/scans',
      { params }
    );
    return {
      data: res.data.data,
      pagination: res.data.pagination,
    };
  },

  async getScanById(id: string): Promise<ScanRecord> {
    const res = await api.get<{ success: boolean; data: ScanRecord }>(`/scans/${id}`);
    return res.data.data;
  },

  async deleteScan(id: string): Promise<void> {
    await api.delete(`/scans/${id}`);
  },

  async deleteAllScans(): Promise<number> {
    const res = await api.delete<{ success: boolean; count: number }>('/scans');
    return res.data.count;
  },

  async getAnalytics(): Promise<AnalyticsData> {
    const res = await api.get<{ success: boolean; data: AnalyticsData }>('/analytics');
    return res.data.data;
  },

  async getHealth(): Promise<HealthData> {
    const res = await api.get<HealthData>('/health');
    return res.data;
  },
};

export default api;
