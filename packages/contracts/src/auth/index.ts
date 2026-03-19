/**
 * @myclup/contracts/auth — Auth and profile API contracts.
 */
export { whoamiContract, WhoamiRequestSchema, WhoamiResponseSchema } from './whoami';
export type { WhoamiRequest, WhoamiResponse } from './whoami';

export { sessionContract, SessionRequestSchema, SessionResponseSchema } from './session';
export type { SessionRequest, SessionResponse } from './session';

export {
  profilePatchContract,
  ProfilePatchRequestSchema,
  ProfilePatchResponseSchema,
} from './profile';
export type { ProfilePatchRequest, ProfilePatchResponse } from './profile';
