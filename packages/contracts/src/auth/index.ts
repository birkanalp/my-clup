/**
 * @myclup/contracts/auth — Auth and profile API contracts.
 */
export { signInContract, SignInRequestSchema, SignInResponseSchema } from './sign-in';
export type { SignInRequest, SignInResponse } from './sign-in';

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
