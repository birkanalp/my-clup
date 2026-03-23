import { ReportSummaryRequestSchema, ReportSummaryResponseSchema } from './schemas';

export const reportSummaryContract = {
  path: '/api/v1/reports/summary',
  method: 'GET' as const,
  request: ReportSummaryRequestSchema,
  response: ReportSummaryResponseSchema,
} as const;
