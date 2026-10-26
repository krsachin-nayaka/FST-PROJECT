import { z } from 'zod';

export const createScanSchema = z.object({
  body: z.object({
    url: z
      .string()
      .trim()
      .min(1, 'URL is required')
      .max(2048, 'URL exceeds maximum allowable length of 2048 characters')
      .refine(
        (val) => {
          try {
            const parsed = new URL(val);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
          } catch {
            return false;
          }
        },
        {
          message: 'Must be a valid HTTP or HTTPS URL (e.g., https://example.com)',
        }
      ),
  }),
});

export const getScansQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().trim().optional().default(''),
    riskCategory: z.enum(['Low', 'Medium', 'High', '']).optional().default(''),
    sortBy: z.enum(['createdAt', 'riskScore']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const scanIdParamSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, 'Scan ID is required'),
  }),
});
