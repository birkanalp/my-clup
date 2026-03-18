/**
 * Auth helpers for server-side request handling.
 *
 * ⚠️ SERVER-ONLY PACKAGE
 * Use only in BFF routes, API handlers, server actions, server modules.
 * Client apps must NOT import @myclup/supabase. All auth flows go through
 * the BFF; clients receive session via cookies (web) or pass Bearer token (mobile).
 *
 * Usage in API routes:
 *
 *   import { getSession, getCurrentUser, createUserScopedClient } from "@myclup/supabase/auth";
 *
 *   export async function GET(req: NextRequest) {
 *     const session = await getSession(req);
 *     if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 *
 *     const client = createUserScopedClient(session);  // RLS applies
 *     const { data } = await client.from("profiles").select("*").single();
 *     return NextResponse.json(data);
 *   }
 *
 * Security boundaries:
 * - Never trust client-supplied tenant_id or branch_id; derive from server context
 * - Always validate session via getSession before any protected operation
 * - createUserScopedClient uses user JWT; RLS enforces tenant isolation
 */

export {
  getSession,
  type AuthRequest,
} from "./get-session";
export {
  getCurrentUser,
  type CurrentUser,
  type Profile,
} from "./get-current-user";
export {
  createUserScopedClient,
  type UserScopedSupabaseClient,
} from "./create-user-scoped-client";
