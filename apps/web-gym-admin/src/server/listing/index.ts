import type { NextRequest } from 'next/server';
import type {
  GetListingResponse,
  UpdateListingRequest,
  UpdateListingResponse,
  UpdateListingVisibilityRequest,
  UpdateListingVisibilityResponse,
} from '@myclup/contracts/listing';
import {
  createServerClient,
  ForbiddenError,
  getCurrentUser,
  requirePermission,
  resolveTenantScope,
} from '@myclup/supabase';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getClient() {
  return createServerClient({
    supabaseUrl: SUPABASE_URL,
    serviceRoleKey: SERVICE_ROLE_KEY,
  });
}

const DEFAULT_OPERATING_HOURS = {
  monday: { open: false, openTime: null, closeTime: null },
  tuesday: { open: false, openTime: null, closeTime: null },
  wednesday: { open: false, openTime: null, closeTime: null },
  thursday: { open: false, openTime: null, closeTime: null },
  friday: { open: false, openTime: null, closeTime: null },
  saturday: { open: false, openTime: null, closeTime: null },
  sunday: { open: false, openTime: null, closeTime: null },
};

function rowToListing(row: Record<string, unknown>): GetListingResponse {
  return {
    gymId: row.id as string,
    name: (row.name as string) ?? '',
    description: (row.description as string | null) ?? null,
    addressLine1: (row.address_line1 as string | null) ?? null,
    addressLine2: (row.address_line2 as string | null) ?? null,
    city: (row.city as string | null) ?? null,
    country: (row.country as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    website: (row.website as string | null) ?? null,
    amenities: ((row.amenities as string[]) ?? []) as GetListingResponse['amenities'],
    operatingHours: (row.operating_hours as GetListingResponse['operatingHours']) ?? DEFAULT_OPERATING_HOURS,
    isPublished: (row.is_published as boolean) ?? false,
    updatedAt: (row.updated_at as string) ?? new Date().toISOString(),
  };
}

export async function getGymListing(req: NextRequest): Promise<GetListingResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = getClient();
  const scopes = await resolveTenantScope(client, currentUser.user.id);
  if (scopes.length === 0) throw new ForbiddenError('No tenant scope for listing');

  const scope = scopes[0];
  await requirePermission(client, currentUser.user.id, scope, 'members:read');

  const { data, error } = await client
    .from('gyms')
    .select(
      'id, name, description, address_line1, address_line2, city, country, phone, website, amenities, operating_hours, is_published, updated_at'
    )
    .eq('id', scope.gymId)
    .maybeSingle();

  if (error) throw new Error(`getGymListing failed: ${error.message}`);
  if (!data) {
    const { NotFoundError } = await import('@myclup/supabase');
    throw new NotFoundError('Gym listing not found');
  }

  return rowToListing(data as Record<string, unknown>);
}

export async function updateGymListing(
  req: NextRequest,
  input: UpdateListingRequest
): Promise<UpdateListingResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = getClient();
  const scopes = await resolveTenantScope(client, currentUser.user.id);
  if (scopes.length === 0) throw new ForbiddenError('No tenant scope for listing update');

  const scope = scopes[0];
  await requirePermission(client, currentUser.user.id, scope, 'members:write');

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) updatePayload.name = input.name;
  if (input.description !== undefined) updatePayload.description = input.description;
  if (input.addressLine1 !== undefined) updatePayload.address_line1 = input.addressLine1;
  if (input.addressLine2 !== undefined) updatePayload.address_line2 = input.addressLine2;
  if (input.city !== undefined) updatePayload.city = input.city;
  if (input.country !== undefined) updatePayload.country = input.country;
  if (input.phone !== undefined) updatePayload.phone = input.phone;
  if (input.website !== undefined) updatePayload.website = input.website;
  if (input.amenities !== undefined) updatePayload.amenities = input.amenities;
  if (input.operatingHours !== undefined) updatePayload.operating_hours = input.operatingHours;

  const { data, error } = await client
    .from('gyms')
    .update(updatePayload)
    .eq('id', scope.gymId)
    .select(
      'id, name, description, address_line1, address_line2, city, country, phone, website, amenities, operating_hours, is_published, updated_at'
    )
    .single();

  if (error) throw new Error(`updateGymListing failed: ${error.message}`);

  return rowToListing(data as Record<string, unknown>);
}

export async function updateGymListingVisibility(
  req: NextRequest,
  input: UpdateListingVisibilityRequest
): Promise<UpdateListingVisibilityResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = getClient();
  const scopes = await resolveTenantScope(client, currentUser.user.id);
  if (scopes.length === 0) throw new ForbiddenError('No tenant scope for listing visibility');

  const scope = scopes[0];
  await requirePermission(client, currentUser.user.id, scope, 'members:write');

  const updatedAt = new Date().toISOString();
  const { error } = await client
    .from('gyms')
    .update({ is_published: input.isPublished, updated_at: updatedAt })
    .eq('id', scope.gymId);

  if (error) throw new Error(`updateGymListingVisibility failed: ${error.message}`);

  return {
    gymId: scope.gymId,
    isPublished: input.isPublished,
    updatedAt,
  };
}
