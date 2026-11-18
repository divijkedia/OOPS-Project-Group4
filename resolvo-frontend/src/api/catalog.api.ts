import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type { ItServiceResponse, CategoryResponse } from '../types/incident';

export const DEFAULT_SERVICES: ItServiceResponse[] = [
  { id: 1, name: 'Cloud Infrastructure', businessCriticality: 'MISSION_CRITICAL', description: 'Multi-region compute & serverless clusters', active: true },
  { id: 2, name: 'Production Databases', businessCriticality: 'MISSION_CRITICAL', description: 'Relational clusters & in-memory caches', active: true },
  { id: 3, name: 'Corporate Networks', businessCriticality: 'HIGH', description: 'SD-WAN edge nodes, VPN mesh & firewalls', active: true },
  { id: 4, name: 'Authentication & SSO', businessCriticality: 'MISSION_CRITICAL', description: 'Federated SSO proxies & OAuth2 identity providers', active: true },
  { id: 5, name: 'ERP & Financial Suite', businessCriticality: 'HIGH', description: 'Enterprise enterprise resource planning & accounting', active: true },
  { id: 6, name: 'Communication & VoIP', businessCriticality: 'MEDIUM', description: 'Real-time alert webhooks, telephony & VoIP gateways', active: true },
];

export const DEFAULT_CATEGORIES: CategoryResponse[] = [
  { id: 1, name: 'Hardware & Devices', description: 'Physical equipment, laptops, servers and peripherals', keywords: 'laptop desktop monitor keyboard mouse server disk ram cpu printer power supply' },
  { id: 2, name: 'Software & Application', description: 'Application errors, crashes and service bugs', keywords: 'application crash bug install license freeze update error exception slow' },
  { id: 3, name: 'Network & Connectivity', description: 'VPN, DNS, routing, latency and connection drops', keywords: 'wifi ethernet connection latency packet drop vpn routing dns gateway switch' },
  { id: 4, name: 'Access & Authentication', description: 'SSO login, MFA, locked accounts and password resets', keywords: 'password reset login locked mfa 2fa permission role privilege token' },
  { id: 5, name: 'Database & Storage', description: 'Deadlocks, timeouts, slow queries and volume capacity', keywords: 'query timeout deadlock replication index corruption table backup slow' },
  { id: 6, name: 'Security & Compliance', description: 'Phishing attempts, malware alerts and credential leaks', keywords: 'malware virus phishing unauthorized breach suspicious ransomware attack leak' },
  { id: 7, name: 'Cloud Infrastructure', description: 'Kubernetes pods, container clusters and cloud VMs', keywords: 'aws azure kubernetes pod container cluster deployment autoscaling s3 bucket' },
  { id: 8, name: 'Email & Messaging', description: 'Mail delivery, spam filter blocks and calendar sync', keywords: 'outlook exchange smtp imap bounce deliverability spam attachment meeting calendar' },
];

export const catalogApi = {
  async getServices(): Promise<ItServiceResponse[]> {
    try {
      const res = await apiClient.get<ApiResponse<ItServiceResponse[]>>('/catalog/services');
      if (res.data?.data && res.data.data.length > 0) {
        return res.data.data;
      }
      return DEFAULT_SERVICES;
    } catch {
      return DEFAULT_SERVICES;
    }
  },

  async getCategories(): Promise<CategoryResponse[]> {
    try {
      const res = await apiClient.get<ApiResponse<CategoryResponse[]>>('/catalog/categories');
      if (res.data?.data && res.data.data.length > 0) {
        return res.data.data;
      }
      return DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  async suggestCategory(text: string): Promise<CategoryResponse | null> {
    if (!text || text.trim().length === 0) return null;
    try {
      const res = await apiClient.get<ApiResponse<CategoryResponse>>('/catalog/categories/suggest', {
        params: { text },
      });
      if (res.data?.data) {
        return res.data.data;
      }
    } catch {
      // Fallback: evaluate client-side against default category keywords
    }

    const lower = text.toLowerCase();
    let bestCategory: CategoryResponse | null = null;
    let maxMatches = 0;

    for (const cat of DEFAULT_CATEGORIES) {
      if (!cat.keywords) continue;
      const tokens = cat.keywords.split(' ');
      const matchCount = tokens.filter(t => lower.includes(t.toLowerCase())).length;
      if (matchCount > maxMatches) {
        maxMatches = matchCount;
        bestCategory = cat;
      }
    }

    return bestCategory;
  },
};
