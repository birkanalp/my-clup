import type { NextRequest } from 'next/server';
import { z } from 'zod';

type ApiContract = {
  path: string;
  method: string;
  request?: z.ZodType;
  response: z.ZodType;
};

function errorResponse(status: number, error: string, details?: unknown): Response {
  const body = details !== undefined ? { error, details } : { error };
  return Response.json(body, { status });
}

export function withContractRoute<TRequest, TResponse>(
  contract: ApiContract & {
    request?: z.ZodType<TRequest>;
    response: z.ZodType<TResponse>;
  },
  handler: (validatedRequest: TRequest | undefined) => Promise<TResponse>,
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
