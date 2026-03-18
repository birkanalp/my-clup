import { describe, it, expect } from "vitest";
import {
  WhoamiRequestSchema,
  WhoamiResponseSchema,
  whoamiContract,
} from "./whoami";

describe("whoami contract", () => {
  describe("WhoamiRequestSchema", () => {
    it("validates empty object (GET, no body)", () => {
      expect(WhoamiRequestSchema.parse({})).toEqual({});
    });

    it("strips unknown keys", () => {
      const result = WhoamiRequestSchema.safeParse({ foo: "bar" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({});
      }
    });
  });

  describe("WhoamiResponseSchema", () => {
    const validResponse = {
      user: {
        id: "user-uuid",
        email: "user@example.com",
        phone: null,
        createdAt: "2025-03-18T12:00:00.000Z",
        updatedAt: "2025-03-18T12:00:00.000Z",
      },
      profile: {
        userId: "user-uuid",
        displayName: "Test User",
        avatarUrl: "https://example.com/avatar.png",
        localePreference: { locale: "en" as const, fallbackLocale: "tr" as const },
        createdAt: "2025-03-18T12:00:00.000Z",
        updatedAt: "2025-03-18T12:00:00.000Z",
      },
      tenantScope: {
        gymId: "gym-uuid",
        branchId: "branch-uuid",
      },
      roles: [
        {
          userId: "user-uuid",
          role: "gym_staff" as const,
          gymId: "gym-uuid",
          branchId: null,
          grantedAt: "2025-03-18T12:00:00.000Z",
          grantedBy: "admin-uuid",
        },
      ],
    };

    it("validates correct response", () => {
      expect(WhoamiResponseSchema.parse(validResponse)).toEqual(validResponse);
    });

    it("accepts null email and phone on user", () => {
      const withNulls = {
        ...validResponse,
        user: {
          id: "user-uuid",
          email: null,
          phone: null,
          createdAt: "2025-03-18T12:00:00.000Z",
          updatedAt: "2025-03-18T12:00:00.000Z",
        },
      };
      expect(WhoamiResponseSchema.parse(withNulls).user.email).toBeNull();
    });

    it("accepts null avatarUrl on profile", () => {
      const withNullAvatar = {
        ...validResponse,
        profile: {
          ...validResponse.profile,
          avatarUrl: null,
        },
      };
      expect(WhoamiResponseSchema.parse(withNullAvatar).profile.avatarUrl).toBeNull();
    });

    it("accepts null branchId on tenantScope", () => {
      const gymWide = {
        ...validResponse,
        tenantScope: { gymId: "gym-uuid", branchId: null },
      };
      expect(WhoamiResponseSchema.parse(gymWide).tenantScope.branchId).toBeNull();
    });

    it("accepts empty roles array", () => {
      const noRoles = { ...validResponse, roles: [] };
      expect(WhoamiResponseSchema.parse(noRoles).roles).toEqual([]);
    });

    it("rejects invalid email format", () => {
      const result = WhoamiResponseSchema.safeParse({
        ...validResponse,
        user: { ...validResponse.user, email: "not-an-email" },
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid role", () => {
      const result = WhoamiResponseSchema.safeParse({
        ...validResponse,
        roles: [{ ...validResponse.roles[0], role: "invalid_role" }],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("whoamiContract", () => {
    it("has correct path and method", () => {
      expect(whoamiContract.path).toBe("/api/v1/auth/whoami");
      expect(whoamiContract.method).toBe("GET");
    });

    it("exposes request and response schemas", () => {
      expect(whoamiContract.request).toBe(WhoamiRequestSchema);
      expect(whoamiContract.response).toBe(WhoamiResponseSchema);
    });
  });
});
