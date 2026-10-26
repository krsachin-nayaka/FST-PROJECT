import mongoose, { Document, Schema } from 'mongoose';
import { IndicatorResult, RiskCategory } from '../services/analyzer.service.ts';
import { SafeBrowsingStatus } from '../services/safeBrowsing.service.ts';

export interface IScanIndicator {
  indicatorId: string;
  name: string;
  triggered: boolean;
  explanation: string;
  scoreContribution: number;
}

export interface IAnalysisSourceStatus {
  heuristic: 'COMPLETED' | 'FAILED';
  googleSafeBrowsing: SafeBrowsingStatus;
  threatDetails?: string[];
}

export interface IScan extends Document {
  hostname: string;
  sanitizedUrl: string;
  protocol: string;
  port?: string | null;
  riskScore: number;
  riskCategory: RiskCategory;
  indicators: IScanIndicator[];
  recommendations: string[];
  sourceStatus: IAnalysisSourceStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ScanIndicatorSchema = new Schema<IScanIndicator>(
  {
    indicatorId: { type: String, required: true },
    name: { type: String, required: true },
    triggered: { type: Boolean, required: true },
    explanation: { type: String, required: true },
    scoreContribution: { type: Number, required: true },
  },
  { _id: false }
);

const AnalysisSourceStatusSchema = new Schema<IAnalysisSourceStatus>(
  {
    heuristic: { type: String, enum: ['COMPLETED', 'FAILED'], default: 'COMPLETED' },
    googleSafeBrowsing: {
      type: String,
      enum: ['NOT_CONFIGURED', 'NO_THREAT_FOUND', 'THREAT_DETECTED', 'PROVIDER_ERROR', 'TIMEOUT'],
      default: 'NOT_CONFIGURED',
    },
    threatDetails: [{ type: String }],
  },
  { _id: false }
);

export const ScanSchema = new Schema<IScan>(
  {
    hostname: {
      type: String,
      required: [true, 'Hostname is required'],
      trim: true,
      index: true,
    },
    sanitizedUrl: {
      type: String,
      required: [true, 'Sanitized URL is required'],
      trim: true,
    },
    protocol: {
      type: String,
      required: true,
      enum: ['http:', 'https:'],
    },
    port: {
      type: String,
      default: null,
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      index: true,
    },
    riskCategory: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High'],
      index: true,
    },
    indicators: [ScanIndicatorSchema],
    recommendations: [{ type: String }],
    sourceStatus: {
      type: AnalysisSourceStatusSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Composite & sorting indexes
ScanSchema.index({ createdAt: -1 });
ScanSchema.index({ riskCategory: 1, createdAt: -1 });
ScanSchema.index({ hostname: 1, createdAt: -1 });

export const ScanModel = mongoose.models.Scan || mongoose.model<IScan>('Scan', ScanSchema);
