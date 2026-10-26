import { Router } from 'express';
import {
  createScanHandler,
  getScansHandler,
  getScanByIdHandler,
  deleteScanHandler,
  deleteAllScansHandler,
  getAnalyticsHandler,
  getHealthHandler,
} from '../controllers/scan.controller.ts';
import { validateRequest } from '../middleware/validate.ts';
import {
  createScanSchema,
  getScansQuerySchema,
  scanIdParamSchema,
} from '../validators/scan.validator.ts';

const router = Router();

// Health
router.get('/health', getHealthHandler);

// Analytics
router.get('/analytics', getAnalyticsHandler);

// Scans CRUD
router.post('/scans', validateRequest(createScanSchema), createScanHandler);
router.get('/scans', validateRequest(getScansQuerySchema), getScansHandler);
router.delete('/scans', deleteAllScansHandler);
router.get('/scans/:id', validateRequest(scanIdParamSchema), getScanByIdHandler);
router.delete('/scans/:id', validateRequest(scanIdParamSchema), deleteScanHandler);

export default router;
