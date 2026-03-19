/**
 * Auth API namespace for the shared api-client.
 *
 * Provides typed methods for whoami, session, and profile update.
 * Auth token must be injected via getAuthHeaders in ApiClientConfig.
 *
 * Web configuration:
 *   const api = createApi({
 *     baseUrl: process.env.NEXT_PUBLIC_API_URL,
 *     getAuthHeaders: async () => {
 *       const { data } = await supabase.auth.getSession();
 *       const token = data.session?.access_token;
 *       return token ? { Authorization: `Bearer ${token}` } : {};
 *     },
 *   });
 *
 * Mobile configuration:
 *   const api = createApi({
 *     baseUrl: process.env.EXPO_PUBLIC_API_URL,
 *     getAuthHeaders: async () => {
 *       const session = await getLocalSession();
 *       return session?.access_token
 *         ? { Authorization: `Bearer ${session.access_token}` }
 *         : {};
 *     },
 *   });
 */

import type {
  WhoamiResponse,
  SessionResponse,
  ProfilePatchRequest,
  ProfilePatchResponse,
} from '@myclup/contracts/auth';
import { whoamiContract, sessionContract, profilePatchContract } from '@myclup/contracts/auth';
import type { ApiContract } from './client';

type RequestFn = <T>(contract: ApiContract<unknown, T>, requestData?: unknown) => Promise<T>;

/**
 * Creates the auth API namespace with typed methods.
 * All responses are validated against their contract schemas.
 */
export function createAuthApi(request: RequestFn) {
  return {
    /**
     * GET /api/v1/auth/whoami
     *
     * Returns the authenticated user, profile, primary tenant scope, and role assignments.
     * Throws ApiError with status 401 when unauthenticated.
     */
    async whoami(): Promise<WhoamiResponse> {
      return request(whoamiContract as ApiContract<unknown, WhoamiResponse>);
    },

    /**
     * GET /api/v1/auth/session
     *
     * Returns session validity. Does not throw on unauthenticated — returns { valid: false }.
     */
    async getSession(): Promise<SessionResponse> {
      return request(sessionContract as ApiContract<unknown, SessionResponse>);
    },

    /**
     * PATCH /api/v1/auth/profile
     *
     * Updates the authenticated user's profile fields.
     * Throws ApiError with status 401 when unauthenticated.
     * Throws ApiError with status 400 when input validation fails.
     *
     * @param input - Fields to update (all optional; only provided fields are updated)
     */
    async updateProfile(input: ProfilePatchRequest): Promise<ProfilePatchResponse> {
      return request(
        profilePatchContract as ApiContract<ProfilePatchRequest, ProfilePatchResponse>,
        input
      );
    },
  };
}
