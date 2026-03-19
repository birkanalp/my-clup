/**
 * Gym is the root tenant; Branch is the operational scope.
 * Per docs/07-technical-plan.md §5.1
 */
export interface Gym {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: string;
  gymId: string; // parent gym (root tenant)
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents a resolved tenant scope for a server-side request.
 * Never trust tenant scope from the client — always derive from server context.
 */
export interface TenantScope {
  gymId: string;
  branchId: string | null; // null means gym-wide scope
}
