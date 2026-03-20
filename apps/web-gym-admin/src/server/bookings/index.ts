import type { NextRequest } from 'next/server';
import type {
  BookingSession,
  CancelBookingRequest,
  CancelBookingResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  JoinWaitlistRequest,
  JoinWaitlistResponse,
  ListBookingsRequest,
  ListBookingsResponse,
  ListBookingSessionsRequest,
  ListBookingSessionsResponse,
  ListInstructorAvailabilityRequest,
  ListInstructorAvailabilityResponse,
  UpdateAttendanceRequest,
  UpdateAttendanceResponse,
} from '@myclup/contracts/bookings';
import {
  AUDIT_EVENT_TYPES,
  checkPermission,
  createBooking,
  createServerClient,
  ForbiddenError,
  getBooking,
  getBookingSession,
  getCurrentUser,
  joinWaitlist,
  listBookings,
  listBookingSessions,
  listInstructorAvailability,
  resolveTenantScope,
  requirePermission,
  updateAttendance,
  writeAuditEvent,
  cancelBooking,
} from '@myclup/supabase';
import type { FeaturePermission, TenantScope } from '@myclup/types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getClient() {
  return createServerClient({
    supabaseUrl: SUPABASE_URL,
    serviceRoleKey: SERVICE_ROLE_KEY,
  });
}

function parseLimit(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseListSessionsParams(req: NextRequest): ListBookingSessionsRequest {
  const sp = req.nextUrl.searchParams;
  return {
    gymId: sp.get('gymId') ?? undefined,
    branchId: sp.get('branchId') ?? undefined,
    memberId: sp.get('memberId') ?? undefined,
    instructorUserId: sp.get('instructorUserId') ?? undefined,
    kind: (sp.get('kind') as ListBookingSessionsRequest['kind']) ?? undefined,
    status: (sp.get('status') as ListBookingSessionsRequest['status']) ?? undefined,
    startsFrom: sp.get('startsFrom') ?? undefined,
    startsUntil: sp.get('startsUntil') ?? undefined,
    cursor: sp.get('cursor') ?? undefined,
    limit: parseLimit(sp.get('limit'), 20),
  };
}

function parseListBookingsParams(req: NextRequest): ListBookingsRequest {
  const sp = req.nextUrl.searchParams;
  return {
    memberId: sp.get('memberId') ?? undefined,
    sessionId: sp.get('sessionId') ?? undefined,
    status: (sp.get('status') as ListBookingsRequest['status']) ?? undefined,
    attendanceStatus:
      (sp.get('attendanceStatus') as ListBookingsRequest['attendanceStatus']) ?? undefined,
    cursor: sp.get('cursor') ?? undefined,
    limit: parseLimit(sp.get('limit'), 20),
  };
}

function parseListAvailabilityParams(req: NextRequest): ListInstructorAvailabilityRequest {
  const sp = req.nextUrl.searchParams;
  return {
    gymId: sp.get('gymId') ?? undefined,
    branchId: sp.get('branchId') ?? undefined,
    instructorUserId: sp.get('instructorUserId') ?? undefined,
    startsFrom: sp.get('startsFrom') ?? undefined,
    startsUntil: sp.get('startsUntil') ?? undefined,
    limit: parseLimit(sp.get('limit'), 100),
  };
}

async function writeBookingAudit(
  client: ReturnType<typeof getClient>,
  params: Parameters<typeof writeAuditEvent>[1]
) {
  try {
    await writeAuditEvent(client, params);
  } catch (error) {
    console.error('[bookings] audit write failed', error);
  }
}

type ActorContext = {
  actorRole: string;
  isPlatformAdmin: boolean;
};

async function getActorContext(
  client: ReturnType<typeof getClient>,
  userId: string,
  scope: TenantScope
): Promise<ActorContext> {
  const { data } = await client
    .from('user_role_assignments')
    .select('role, gym_id')
    .eq('user_id', userId);
  const rows = data ?? [];
  const platform = rows.find((row) => row.role === 'platform_admin' && row.gym_id === null);
  if (platform) {
    return { actorRole: 'platform_admin', isPlatformAdmin: true };
  }
  const gymRole = rows.find((row) => row.gym_id === scope.gymId)?.role;
  return { actorRole: gymRole ?? 'staff', isPlatformAdmin: false };
}

async function resolveAuthorizedScopes(
  client: ReturnType<typeof getClient>,
  userId: string,
  permission: FeaturePermission,
  gymId?: string,
  branchId?: string
) {
  const scopes = await resolveTenantScope(client, userId, gymId, branchId);
  if (scopes.length === 0) {
    throw new ForbiddenError('No tenant scope for booking access');
  }

  const allowed: TenantScope[] = [];
  for (const scope of scopes) {
    if (await checkPermission(client, userId, scope, permission)) {
      allowed.push(scope);
    }
  }

  if (allowed.length === 0) {
    throw new ForbiddenError(`No permitted scope for ${permission}`);
  }

  return allowed;
}

async function maybeWriteCrossTenantAudit(
  client: ReturnType<typeof getClient>,
  userId: string,
  actor: ActorContext,
  scope: TenantScope,
  action: string
) {
  if (!actor.isPlatformAdmin) return;

  await writeBookingAudit(client, {
    event_type: AUDIT_EVENT_TYPES.cross_tenant_support,
    actor_id: userId,
    target_type: 'bookings',
    target_id: null,
    payload: {
      target_gym_id: scope.gymId,
      target_branch_id: scope.branchId ?? undefined,
      action,
      actor_role: actor.actorRole,
      tenant_id: scope.gymId,
      before_state: 'request_received',
      after_state: 'scope_granted',
      timestamp: new Date().toISOString(),
    },
    tenant_context: { gym_id: scope.gymId, branch_id: scope.branchId ?? undefined },
  });
}

export async function listSessions(req: NextRequest): Promise<ListBookingSessionsResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const params = parseListSessionsParams(req);
  const client = getClient();
  const scopes = await resolveAuthorizedScopes(
    client,
    currentUser.user.id,
    'bookings:read',
    params.gymId,
    params.branchId
  );
  const actor = await getActorContext(client, currentUser.user.id, scopes[0]);
  await maybeWriteCrossTenantAudit(
    client,
    currentUser.user.id,
    actor,
    scopes[0],
    'booking_sessions_list_access'
  );

  return listBookingSessions(client, {
    ...params,
    gymIds: [...new Set(scopes.map((scope) => scope.gymId))],
    branchScopes: scopes,
  });
}

export async function getSession(
  req: NextRequest,
  sessionId: string
): Promise<BookingSession | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = getClient();
  const session = await getBookingSession(client, sessionId);
  const scopes = await resolveAuthorizedScopes(
    client,
    currentUser.user.id,
    'bookings:read',
    session.gymId,
    session.branchId ?? undefined
  );
  await requirePermission(client, currentUser.user.id, scopes[0], 'bookings:read');
  return session;
}

export async function listAllBookings(req: NextRequest): Promise<ListBookingsResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const params = parseListBookingsParams(req);
  const client = getClient();
  const scopes = await resolveAuthorizedScopes(client, currentUser.user.id, 'bookings:read');
  return listBookings(client, {
    ...params,
    gymIds: [...new Set(scopes.map((scope) => scope.gymId))],
    branchScopes: scopes,
  });
}

export async function createNewBooking(
  req: NextRequest,
  input: CreateBookingRequest
): Promise<CreateBookingResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = getClient();
  const session = await getBookingSession(client, input.sessionId);
  const scopes = await resolveAuthorizedScopes(
    client,
    currentUser.user.id,
    'bookings:write',
    session.gymId,
    session.branchId ?? undefined
  );
  await requirePermission(client, currentUser.user.id, scopes[0], 'bookings:write');
  return createBooking(client, input);
}

export async function cancelExistingBooking(
  req: NextRequest,
  bookingId: string,
  input: CancelBookingRequest
): Promise<CancelBookingResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = getClient();
  const booking = await getBooking(client, bookingId);
  const scopes = await resolveAuthorizedScopes(
    client,
    currentUser.user.id,
    'bookings:write',
    booking.gymId,
    booking.branchId ?? undefined
  );
  await requirePermission(client, currentUser.user.id, scopes[0], 'bookings:write');
  return cancelBooking(client, bookingId, input);
}

export async function createWaitlistEntry(
  req: NextRequest,
  input: JoinWaitlistRequest
): Promise<JoinWaitlistResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = getClient();
  const session = await getBookingSession(client, input.sessionId);
  const scopes = await resolveAuthorizedScopes(
    client,
    currentUser.user.id,
    'bookings:write',
    session.gymId,
    session.branchId ?? undefined
  );
  await requirePermission(client, currentUser.user.id, scopes[0], 'bookings:write');
  return joinWaitlist(client, input);
}

export async function patchAttendance(
  req: NextRequest,
  bookingId: string,
  input: UpdateAttendanceRequest
): Promise<UpdateAttendanceResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = getClient();
  const booking = await getBooking(client, bookingId);
  const scopes = await resolveAuthorizedScopes(
    client,
    currentUser.user.id,
    'bookings:write',
    booking.gymId,
    booking.branchId ?? undefined
  );
  await requirePermission(client, currentUser.user.id, scopes[0], 'bookings:write');
  return updateAttendance(client, bookingId, input);
}

export async function listAvailability(
  req: NextRequest
): Promise<ListInstructorAvailabilityResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const params = parseListAvailabilityParams(req);
  const client = getClient();
  const scopes = await resolveAuthorizedScopes(
    client,
    currentUser.user.id,
    'bookings:read',
    params.gymId,
    params.branchId
  );
  return listInstructorAvailability(client, {
    ...params,
    gymIds: [...new Set(scopes.map((scope) => scope.gymId))],
    branchScopes: scopes,
  });
}
