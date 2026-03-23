import type {
  GetMemberResponse,
  ListMembersRequest,
  ListMembersResponse,
  UpdateMemberStatusRequest,
  UpdateMemberStatusResponse,
} from '@myclup/contracts/members';
import {
  getMemberContract,
  listMembersContract,
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
    async list(params?: ListMembersRequest): Promise<ListMembersResponse> {
      return request(
        listMembersContract as ApiContract<ListMembersRequest, ListMembersResponse>,
        params
      );
    },

    async get(id: string): Promise<GetMemberResponse> {
      return request(getMemberContract as ApiContract<unknown, GetMemberResponse>, undefined, {
        pathParams: { id },
      });
    },

    async updateStatus(
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
