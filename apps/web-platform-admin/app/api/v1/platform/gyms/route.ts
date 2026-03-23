import { platformGymsListResponseSchema } from '@myclup/contracts';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { listPlatformGyms } from '@/src/server/platform/data';
import { requirePlatformOperator } from '@/src/server/platform/gate';

export async function GET(request: NextRequest) {
  const gate = await requirePlatformOperator(request);
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  const data = await listPlatformGyms();
  const parsed = platformGymsListResponseSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }

  return NextResponse.json(parsed.data);
}
