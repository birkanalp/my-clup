/**
 * Server-side Supabase client exports.
 *
 * Entry point for BFF and server modules. Do not import from client apps.
 */
export {
  createServerClient,
  type CreateServerClientOptions,
  type ServerSupabaseClient,
} from "./create-server-client";
