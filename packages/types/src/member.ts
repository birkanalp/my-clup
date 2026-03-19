export type MemberStatus =
  | "active"
  | "expired"
  | "frozen"
  | "cancelled"
  | "trial"
  | "pending";

export interface Member {
  id: string;
  userId: string; // links to User.id
  gymId: string;
  branchId: string | null;
  status: MemberStatus;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProspectLead {
  id: string;
  gymId: string;
  branchId: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  createdAt: string;
  updatedAt: string;
}
