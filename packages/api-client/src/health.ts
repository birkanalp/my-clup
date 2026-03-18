import type { PingResponse } from "@myclup/contracts/health";
import { pingContract } from "@myclup/contracts/health";
import type { ApiContract } from "./client";

type RequestFn = <T>(
  contract: ApiContract<unknown, T>,
  requestData?: unknown
) => Promise<T>;

/**
 * Creates the health API with typed methods. Uses the shared ping contract
 * for request/response validation.
 */
export function createHealthApi(request: RequestFn) {
  return {
    /** Calls GET /api/v1/health/ping and parses response with contract.response.parse() */
    async ping(): Promise<PingResponse> {
      return request(
        pingContract as ApiContract<unknown, PingResponse>
      );
    },
  };
}
