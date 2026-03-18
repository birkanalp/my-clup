/**
 * Integration test for GET /api/v1/health/ping.
 * Calls the route handler, asserts response shape matches contract.
 */
import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { PingResponseSchema } from "@myclup/contracts/health";
import { GET } from "./route";

describe("GET /api/v1/health/ping", () => {
  it("returns validated response matching pingContract", async () => {
    const request = new NextRequest(
      "http://localhost:3001/api/v1/health/ping",
      { method: "GET" }
    );

    const response = await GET(request);

    expect(response.status).toBe(200);
    const json = (await response.json()) as unknown;
    const parsed = PingResponseSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.status).toBe("ok");
      expect(typeof parsed.data.timestamp).toBe("string");
      expect(parsed.data.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
      );
    }
  });
});
