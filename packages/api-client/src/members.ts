import type {
  GetGymMemberResponse,
  ListGymMembersRequest,
  ListGymMembersResponse,
  UpdateMemberStatusRequest,
  UpdateMemberStatusResponse,
} from '@myclup/contracts/members';
import {
  getGymMemberContract,
  listGymMembersContract,
  updateMemberStatusContract,
} from '@myclup/contracts/members';
import type { ApiContract, RequestOptions } from './client';

type RequestFn = <T>(
  contract: ApiContract<unknown, T>,
  requestData?: unknown,
  options?: RequestOptions
) => Promise<T>;

export function createMembersApi(request: RequestFn) {
  return {
    async listMembers(params?: ListGymMembersRequest): Promise<ListGymMembersResponse> {
      return request(
        listGymMembersContract as ApiContract<ListGymMembersRequest, ListGymMembersResponse>,
        params
      );
    },

    async getMember(id: string): Promise<GetGymMemberResponse> {
      return request(
        getGymMemberContract as ApiContract<undefined, GetGymMemberResponse>,
        undefined,
        { pathParams: { id } }
      );
    },

    async updateMemberStatus(
      id: string,
      input: UpdateMemberStatusRequest
    ): Promise<UpdateMemberStatusResponse> {
      return request(
        updateMemberStatusContract as ApiContract<
          UpdateMemberStatusRequest,
          UpdateMemberStatusResponse
        >,
        input,
        { pathParams: { id } }
      );
    },
  };
}
