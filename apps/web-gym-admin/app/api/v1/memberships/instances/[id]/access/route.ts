import type { NextRequest } from 'next/server';
import { validateMembershipAccessContract } from '@myclup/contracts/membership';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as instancesServer from '@/src/server/membership/instances';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const searchParams = request.nextUrl.searchParams;
  const branchId = searchParams.get('branchId');
  if (!branchId) {
    return Response.json(
      { error: 'validation_error', details: 'branchId is required' },
      { status: 400 }
    );
  }

  const handler = withAuthContractRoute(validateMembershipAccessContract, (req) => {
    return instancesServer.validateInstanceAccess(req, id, {
      membershipInstanceId: id,
      branchId,
      at: searchParams.get('at') ?? undefined,
    });
  });
  return handler(request);
}
