import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env.ts';
import { IScan, ScanModel } from '../models/scan.model.ts';
import { RiskCategory } from './analyzer.service.ts';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'scans.json');

export interface DbState {
  provider: 'mongodb' | 'embedded-persistence';
  connected: boolean;
  uri: string;
}

export const dbState: DbState = {
  provider: 'embedded-persistence',
  connected: false,
  uri: env.MONGODB_URI,
};

// Ensure data directory exists for embedded store
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf-8');
  }
}

function readEmbeddedScans(): any[] {
  try {
    ensureDataDir();
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data) || [];
  } catch (err) {
    console.error('Failed to read embedded store:', err);
    return [];
  }
}

function writeEmbeddedScans(scans: any[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(scans, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write embedded store:', err);
  }
}

/**
 * Initializes database connection
 */
export async function initDatabase(): Promise<void> {
  ensureDataDir();

  if (env.MONGODB_URI && env.MONGODB_URI !== '') {
    try {
      mongoose.set('strictQuery', true);
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 2000,
        connectTimeoutMS: 2000,
      });
      dbState.connected = true;
      dbState.provider = 'mongodb';
      console.log('✅ Connected to MongoDB at:', env.MONGODB_URI);
    } catch (err: any) {
      console.warn('⚠️ MongoDB connection could not be established; running with embedded persistent storage:', err.message);
      dbState.connected = false;
      dbState.provider = 'embedded-persistence';
    }
  } else {
    dbState.provider = 'embedded-persistence';
  }

  if (env.NODE_ENV !== 'test') {
    await seedInitialScans();
  }
}

async function seedInitialScans() {
  const current = await getScans({ limit: 1 });
  if (current.total === 0) {
    const samples = [
      {
        hostname: 'github.com',
        sanitizedUrl: 'https://github.com/trending',
        protocol: 'https:',
        port: null,
        riskScore: 0,
        riskCategory: 'Low' as const,
        indicators: [
          {
            indicatorId: 'HTTP_INSECURE',
            name: 'Unencrypted HTTP Transport',
            triggered: false,
            explanation: 'URL employs modern TLS/HTTPS encryption.',
            scoreContribution: 0,
          },
          {
            indicatorId: 'IP_ADDRESS_HOST',
            name: 'Raw IP Address Hostname',
            triggered: false,
            explanation: 'Standard registered domain name utilized.',
            scoreContribution: 0,
          },
        ],
        recommendations: [
          'No obvious heuristic red flags detected. Maintain standard web hygiene.',
          'Always confirm the official domain name in the browser address bar when entering credentials.',
        ],
        sourceStatus: {
          heuristic: 'COMPLETED' as const,
          googleSafeBrowsing: 'NOT_CONFIGURED' as const,
        },
      },
      {
        hostname: 'legacy-documentation-archive.org',
        sanitizedUrl: 'http://legacy-documentation-archive.org/manuals/index.html',
        protocol: 'http:',
        port: null,
        riskScore: 40,
        riskCategory: 'Medium' as const,
        indicators: [
          {
            indicatorId: 'HTTP_INSECURE',
            name: 'Unencrypted HTTP Transport',
            triggered: true,
            explanation: 'The URL uses unencrypted HTTP protocol. All login credentials and traffic can be intercepted.',
            scoreContribution: 25,
          },
          {
            indicatorId: 'UNUSUAL_LENGTH',
            name: 'Suspicious URL Length',
            triggered: false,
            explanation: 'URL length is standard.',
            scoreContribution: 0,
          },
        ],
        recommendations: [
          'Exercise caution. Inspect the domain carefully in the browser address bar before interacting.',
          'Never input credit cards or sensitive credentials over unencrypted HTTP connections.',
        ],
        sourceStatus: {
          heuristic: 'COMPLETED' as const,
          googleSafeBrowsing: 'NOT_CONFIGURED' as const,
        },
      },
      {
        hostname: '192.168.1.55',
        sanitizedUrl: 'http://192.168.1.55:8080/secure/bank/login-verify',
        protocol: 'http:',
        port: '8080',
        riskScore: 85,
        riskCategory: 'High' as const,
        indicators: [
          {
            indicatorId: 'HTTP_INSECURE',
            name: 'Unencrypted HTTP Transport',
            triggered: true,
            explanation: 'The URL uses unencrypted HTTP protocol.',
            scoreContribution: 25,
          },
          {
            indicatorId: 'IP_ADDRESS_HOST',
            name: 'Raw IP Address Hostname',
            triggered: true,
            explanation: 'Host is an explicit IP address (192.168.1.55) instead of a trusted domain name.',
            scoreContribution: 35,
          },
          {
            indicatorId: 'SUSPICIOUS_KEYWORDS',
            name: 'High-Risk Security Keywords',
            triggered: true,
            explanation: 'High-risk authentication keywords found: [login, verify, secure, bank].',
            scoreContribution: 20,
          },
          {
            indicatorId: 'UNUSUAL_PORT',
            name: 'Non-Standard Service Port',
            triggered: true,
            explanation: 'Non-standard web service port :8080 detected.',
            scoreContribution: 20,
          },
        ],
        recommendations: [
          'Do NOT visit this link or enter any login credentials, passwords, or personal details.',
          'Close the browser tab immediately and report this link to your organization security team.',
          'Legitimate banking and consumer platforms virtually never use direct IP addresses or non-standard ports.',
        ],
        sourceStatus: {
          heuristic: 'COMPLETED' as const,
          googleSafeBrowsing: 'NOT_CONFIGURED' as const,
        },
      },
      {
        hostname: 'paypal.com.account-update.secure-center.biz',
        sanitizedUrl: 'https://paypal.com.account-update.secure-center.biz/verify?token=%5BREDACTED%5D',
        protocol: 'https:',
        port: null,
        riskScore: 65,
        riskCategory: 'High' as const,
        indicators: [
          {
            indicatorId: 'EXCESSIVE_SUBDOMAINS',
            name: 'Excessive Subdomain Stacking',
            triggered: true,
            explanation: 'Excessive subdomain nesting (4 levels). Attackers stack subdomains to disguise fraudulent host origins.',
            scoreContribution: 20,
          },
          {
            indicatorId: 'SUSPICIOUS_KEYWORDS',
            name: 'High-Risk Security Keywords',
            triggered: true,
            explanation: 'High-risk authentication keywords found: [account, update, secure, verify].',
            scoreContribution: 20,
          },
          {
            indicatorId: 'UNUSUAL_LENGTH',
            name: 'Suspicious URL Length',
            triggered: true,
            explanation: 'URL length exceeds the 75-character threshold.',
            scoreContribution: 15,
          },
        ],
        recommendations: [
          'Do NOT visit this link or enter any login credentials, passwords, or personal details.',
          'Close the browser tab immediately and report this link.',
        ],
        sourceStatus: {
          heuristic: 'COMPLETED' as const,
          googleSafeBrowsing: 'NOT_CONFIGURED' as const,
        },
      },
    ];

    for (const s of samples) {
      await createScanRecord(s);
    }
    console.log('🌱 Seeded 4 initial realistic URL scans for demonstration');
  }
}

export function isUsingMongo(): boolean {
  return dbState.provider === 'mongodb' && mongoose.connection.readyState === 1;
}

export interface GetScansOptions {
  page?: number;
  limit?: number;
  search?: string;
  riskCategory?: RiskCategory | '';
  sortBy?: 'createdAt' | 'riskScore';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  scans: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function createScanRecord(scanData: Partial<IScan>): Promise<any> {
  if (isUsingMongo()) {
    const doc = new ScanModel(scanData);
    return await doc.save();
  }

  // Embedded storage fallback
  const scans = readEmbeddedScans();
  const hex = () => Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
  const now = new Date();
  const newScan = {
    _id: `${Math.floor(Date.now() / 1000).toString(16)}${hex()}${hex()}`.slice(0, 24),
    ...scanData,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  scans.unshift(newScan);
  writeEmbeddedScans(scans);
  return newScan;
}

export async function getScans(options: GetScansOptions = {}): Promise<PaginatedResult<any>> {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(options.limit) || 10));
  const skip = (page - 1) * limit;
  const search = (options.search || '').trim();
  const riskCategory = options.riskCategory;
  const sortBy = options.sortBy || 'createdAt';
  const sortOrder = options.sortOrder === 'asc' ? 1 : -1;

  if (isUsingMongo()) {
    const filter: any = {};
    if (search) {
      filter.hostname = { $regex: search, $options: 'i' };
    }
    if (riskCategory && ['Low', 'Medium', 'High'].includes(riskCategory)) {
      filter.riskCategory = riskCategory;
    }

    const sortOption: any = { [sortBy]: sortOrder };

    const [total, scans] = await Promise.all([
      ScanModel.countDocuments(filter),
      ScanModel.find(filter).sort(sortOption).skip(skip).limit(limit).lean(),
    ]);

    return {
      scans,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  // Embedded storage
  let scans = readEmbeddedScans();

  if (search) {
    const lower = search.toLowerCase();
    scans = scans.filter((s) => s.hostname && s.hostname.toLowerCase().includes(lower));
  }

  if (riskCategory && ['Low', 'Medium', 'High'].includes(riskCategory)) {
    scans = scans.filter((s) => s.riskCategory === riskCategory);
  }

  // Sort
  scans.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    if (sortBy === 'createdAt') {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    }
    if (valA < valB) return sortOrder === 1 ? -1 : 1;
    if (valA > valB) return sortOrder === 1 ? 1 : -1;
    return 0;
  });

  const total = scans.length;
  const paginated = scans.slice(skip, skip + limit);

  return {
    scans: paginated,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function getScanById(id: string): Promise<any | null> {
  if (isUsingMongo()) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await ScanModel.findById(id).lean();
  }

  const scans = readEmbeddedScans();
  const scan = scans.find((s) => s._id === id || s.id === id);
  return scan || null;
}

export async function deleteScanById(id: string): Promise<boolean> {
  if (isUsingMongo()) {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const res = await ScanModel.findByIdAndDelete(id);
    return Boolean(res);
  }

  const scans = readEmbeddedScans();
  const idx = scans.findIndex((s) => s._id === id || s.id === id);
  if (idx === -1) return false;

  scans.splice(idx, 1);
  writeEmbeddedScans(scans);
  return true;
}

export async function deleteAllScans(): Promise<number> {
  if (isUsingMongo()) {
    const res = await ScanModel.deleteMany({});
    return res.deletedCount || 0;
  }

  const scans = readEmbeddedScans();
  const count = scans.length;
  writeEmbeddedScans([]);
  return count;
}

export async function getAnalyticsData(): Promise<any> {
  if (isUsingMongo()) {
    const totalScans = await ScanModel.countDocuments();
    if (totalScans === 0) {
      return {
        totalScans: 0,
        lowRiskCount: 0,
        mediumRiskCount: 0,
        highRiskCount: 0,
        averageRiskScore: 0,
        riskDistribution: [
          { category: 'Low', count: 0 },
          { category: 'Medium', count: 0 },
          { category: 'High', count: 0 },
        ],
        scansOverTime: [],
        topIndicators: [],
        recentActivity: [],
      };
    }

    const [categoryCounts, scoreAgg, topIndicatorsAgg, recentActivity] = await Promise.all([
      ScanModel.aggregate([
        { $group: { _id: '$riskCategory', count: { $sum: 1 } } },
      ]),
      ScanModel.aggregate([
        { $group: { _id: null, avgScore: { $avg: '$riskScore' } } },
      ]),
      ScanModel.aggregate([
        { $unwind: '$indicators' },
        { $match: { 'indicators.triggered': true } },
        {
          $group: {
            _id: '$indicators.indicatorId',
            name: { $first: '$indicators.name' },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      ScanModel.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const catMap: Record<string, number> = { Low: 0, Medium: 0, High: 0 };
    for (const c of categoryCounts) {
      if (c._id && catMap[c._id] !== undefined) {
        catMap[c._id] = c.count;
      }
    }

    const scansOverTimeAgg = await ScanModel.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          avgScore: { $avg: '$riskScore' },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 14 },
    ]);

    return {
      totalScans,
      lowRiskCount: catMap.Low,
      mediumRiskCount: catMap.Medium,
      highRiskCount: catMap.High,
      averageRiskScore: Math.round(scoreAgg[0]?.avgScore || 0),
      riskDistribution: [
        { category: 'Low', count: catMap.Low },
        { category: 'Medium', count: catMap.Medium },
        { category: 'High', count: catMap.High },
      ],
      scansOverTime: scansOverTimeAgg.map((s) => ({
        date: s._id,
        count: s.count,
        avgScore: Math.round(s.avgScore || 0),
      })),
      topIndicators: topIndicatorsAgg.map((ind) => ({
        id: ind._id,
        name: ind.name,
        count: ind.count,
        percentage: Math.round((ind.count / totalScans) * 100),
      })),
      recentActivity,
    };
  }

  // Embedded storage analytics aggregation
  const scans = readEmbeddedScans();
  const totalScans = scans.length;
  if (totalScans === 0) {
    return {
      totalScans: 0,
      lowRiskCount: 0,
      mediumRiskCount: 0,
      highRiskCount: 0,
      averageRiskScore: 0,
      riskDistribution: [
        { category: 'Low', count: 0 },
        { category: 'Medium', count: 0 },
        { category: 'High', count: 0 },
      ],
      scansOverTime: [],
      topIndicators: [],
      recentActivity: [],
    };
  }

  let low = 0;
  let med = 0;
  let high = 0;
  let totalScore = 0;
  const indicatorCounts: Record<string, { name: string; count: number }> = {};
  const dateMap: Record<string, { count: number; totalScore: number }> = {};

  for (const s of scans) {
    if (s.riskCategory === 'Low') low++;
    else if (s.riskCategory === 'Medium') med++;
    else if (s.riskCategory === 'High') high++;

    totalScore += s.riskScore || 0;

    const d = s.createdAt ? new Date(s.createdAt).toISOString().split('T')[0] : 'Today';
    if (!dateMap[d]) dateMap[d] = { count: 0, totalScore: 0 };
    dateMap[d].count++;
    dateMap[d].totalScore += s.riskScore || 0;

    if (Array.isArray(s.indicators)) {
      for (const ind of s.indicators) {
        if (ind.triggered) {
          if (!indicatorCounts[ind.indicatorId]) {
            indicatorCounts[ind.indicatorId] = { name: ind.name, count: 0 };
          }
          indicatorCounts[ind.indicatorId].count++;
        }
      }
    }
  }

  const topIndicators = Object.entries(indicatorCounts)
    .map(([id, info]) => ({
      id,
      name: info.name,
      count: info.count,
      percentage: Math.round((info.count / totalScans) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const scansOverTime = Object.entries(dateMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, data]) => ({
      date,
      count: data.count,
      avgScore: Math.round(data.totalScore / data.count),
    }));

  return {
    totalScans,
    lowRiskCount: low,
    mediumRiskCount: med,
    highRiskCount: high,
    averageRiskScore: Math.round(totalScore / totalScans),
    riskDistribution: [
      { category: 'Low', count: low },
      { category: 'Medium', count: med },
      { category: 'High', count: high },
    ],
    scansOverTime,
    topIndicators,
    recentActivity: scans.slice(0, 5),
  };
}
