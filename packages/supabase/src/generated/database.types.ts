/**
 * Generated Supabase database types.
 *
 * This file is the canonical location for output from:
 *   supabase gen types typescript --project-id <id> > src/generated/database.types.ts
 *
 * Until a Supabase project is provisioned and linked, this placeholder schema
 * provides minimal types so the server client can typecheck. Replace the contents
 * with real generated types when the database exists.
 *
 * See packages/supabase/README.md for type generation instructions.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
