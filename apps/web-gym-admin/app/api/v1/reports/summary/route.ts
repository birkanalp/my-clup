import { reportSummaryContract } from '@myclup/contracts/reports';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as reportsServer from '@/src/server/reports';

export const GET = withAuthContractRoute(reportSummaryContract, async (req) =>
  reportsServer.getReportSummary(req)
);
