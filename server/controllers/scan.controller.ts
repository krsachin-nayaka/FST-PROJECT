import { Request, Response, NextFunction } from 'express';
import { analyzeUrlRisk } from '../services/analyzer.service.ts';
import { checkGoogleSafeBrowsing } from '../services/safeBrowsing.service.ts';
import {
  createScanRecord,
  getScans,
  getScanById,
  deleteScanById,
  deleteAllScans,
  getAnalyticsData,
  dbState,
} from '../services/db.service.ts';

export async function createScanHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const rawUrl = req.body.url;
    // 1. Run deterministic static heuristic analyzer (critical: no external HTTP fetch to destination!)
    const analysis = analyzeUrlRisk(rawUrl);

    // 2. Query optional Google Safe Browsing provider if configured
    const safeBrowsingRes = await checkGoogleSafeBrowsing(analysis.sanitizedUrl);

    // 3. Assemble document with privacy redaction and status
    const scanData = {
      hostname: analysis.hostname,
      sanitizedUrl: analysis.sanitizedUrl,
      protocol: analysis.protocol,
      port: analysis.port,
      riskScore: analysis.riskScore,
      riskCategory: analysis.riskCategory,
      indicators: analysis.indicators,
      recommendations: analysis.recommendations,
      sourceStatus: {
        heuristic: 'COMPLETED' as const,
        googleSafeBrowsing: safeBrowsingRes.status,
        threatDetails: safeBrowsingRes.threatDetails,
      },
    };

    // 4. Save to database
    const saved = await createScanRecord(scanData);

    return res.status(201).json({
      success: true,
      message: 'URL analyzed and scan record stored successfully',
      data: saved,
    });
  } catch (err: any) {
    next(err);
  }
}

export async function getScansHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, search, riskCategory, sortBy, sortOrder } = req.query as any;

    const result = await getScans({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search: search || '',
      riskCategory: riskCategory || '',
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc',
    });

    return res.status(200).json({
      success: true,
      data: result.scans,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (err: any) {
    next(err);
  }
}

export async function getScanByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const scan = await getScanById(id);

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: `Scan record with ID '${id}' was not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: scan,
    });
  } catch (err: any) {
    next(err);
  }
}

export async function deleteScanHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const deleted = await deleteScanById(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Scan record with ID '${id}' was not found or could not be deleted`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Scan '${id}' was successfully deleted`,
    });
  } catch (err: any) {
    next(err);
  }
}

export async function deleteAllScansHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const count = await deleteAllScans();

    return res.status(200).json({
      success: true,
      message: `Successfully deleted ${count} scan records`,
      count,
    });
  } catch (err: any) {
    next(err);
  }
}

export async function getAnalyticsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const analytics = await getAnalyticsData();

    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (err: any) {
    next(err);
  }
}

export async function getHealthHandler(req: Request, res: Response) {
  return res.status(200).json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      provider: dbState.provider,
      connected: dbState.connected,
      status: dbState.connected ? 'healthy' : 'operational-fallback',
    },
    version: '1.0.0',
    app: 'PhishGuard',
  });
}
