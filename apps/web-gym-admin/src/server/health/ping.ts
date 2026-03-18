/**
 * Health ping server module.
 * Business logic lives here; route handlers only orchestrate.
 */
import type { PingResponse } from "@myclup/contracts/health";

/**
 * Returns a validated ping response. Logic is isolated from the route handler.
 */
export async function ping(): Promise<PingResponse> {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
  };
}
