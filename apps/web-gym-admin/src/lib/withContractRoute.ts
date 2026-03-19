/**
 * Reusable route handler pattern for /api/v1 routes.
 *
 * Enforces the validation boundary:
 * - Never use raw request body before Zod validation
 * - Always validate response with contract.response before returning
 *
 * Route handlers must not contain business logic; they delegate to server modules.
 */
import type { NextRequest } from 'next/server';
import { z } from 'zod';

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
 * Wraps a route handler with contract-based validation.
 *
 * - For GET: No body parsing. Calls handler with undefined. Validates response.
 * - For POST/PUT/PATCH: Parses body as JSON, validates with contract.request,
 *   calls handler with validated data. Validates response.
 *
 * Raw body is never passed to the handler; only validated data is used.
 */
export function withContractRoute<TRequest, TResponse>(
  contract: ApiContract & {
    request?: z.ZodType<TRequest>;
    response: z.ZodType<TResponse>;
  },
  handler: (validatedRequest: TRequest | undefined) => Promise<TResponse>
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

      const result = await handler(validatedRequest);
      const validated = contract.response.safeParse(result);
      if (!validated.success) {
        return errorResponse(500, 'internal_error');
      }
      return Response.json(validated.data);
    } catch (err) {
      if (err instanceof SyntaxError) {
        return errorResponse(400, 'validation_error', 'Invalid JSON body');
      }
      return errorResponse(500, 'internal_error');
    }
  };
}
