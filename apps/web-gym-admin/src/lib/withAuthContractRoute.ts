/**
 * Auth-aware route handler pattern for protected /api/v1 routes.
 *
 * Extends withContractRoute with:
 * - Passes the NextRequest to the handler so auth helpers (getSession,
 *   getCurrentUser) can extract the session from cookies or Bearer token.
 * - Returns 401 when the handler returns null (unauthenticated).
 * - Catches ForbiddenError and returns 403.
 *
 * Route handlers must not contain business logic; they delegate to server modules.
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { ForbiddenError, NotFoundError } from '@myclup/supabase';

/** Contract shape: path, method, optional request schema, response schema. */
type ApiContract = {
  path: string;
  method: string;
  request?: z.ZodType;
  response: z.ZodType;
};

/** Standard error response shape. */
function errorResponse(status: number, error: string, details?: unknown): Response {
  const body = details !== undefined ? { error, details } : { error };
  return Response.json(body, { status });
}

/**
 * Wraps a protected route handler with contract-based validation and auth
 * lifecycle management.
 *
 * - Passes the NextRequest to the handler (needed for session extraction).
 * - For GET: No body parsing. Calls handler with (request, undefined).
 * - For POST/PUT/PATCH: Parses body as JSON, validates with contract.request,
 *   calls handler with (request, validatedData).
 * - Handler returning null signals unauthenticated → 401.
 * - ForbiddenError → 403.
 * - Response is always validated against contract.response.
 */
export function withAuthContractRoute<TRequest, TResponse>(
  contract: ApiContract & {
    request?: z.ZodType<TRequest>;
    response: z.ZodType<TResponse>;
  },
  handler: (
    request: NextRequest,
    validatedRequest: TRequest | undefined
  ) => Promise<TResponse | null>
): (request: NextRequest) => Promise<Response> {
  return async (request: NextRequest) => {
    try {
      let validatedRequest: TRequest | undefined;

      if (contract.method !== 'GET' && contract.request) {
        const rawBody = await request.json();
        const parsed = contract.request.safeParse(rawBody);
        if (!parsed.success) {
          return errorResponse(400, 'validation_error', parsed.error.flatten());
        }
        validatedRequest = parsed.data;
      }

      const result = await handler(request, validatedRequest);

      if (result === null) {
        return errorResponse(401, 'unauthorized');
      }

      const validated = contract.response.safeParse(result);
      if (!validated.success) {
        return errorResponse(500, 'internal_error');
      }
      return Response.json(validated.data);
    } catch (err) {
      if (err instanceof ForbiddenError) {
        return errorResponse(403, 'forbidden');
      }
      if (err instanceof NotFoundError) {
        return errorResponse(404, 'not_found');
      }
      if (err instanceof SyntaxError) {
        return errorResponse(400, 'validation_error', 'Invalid JSON body');
      }
      return errorResponse(500, 'internal_error');
    }
  };
}
