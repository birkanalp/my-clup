import type {
  CancelMembershipRequest,
  CancelMembershipResponse,
  CreateMembershipPlanRequest,
  CreateMembershipPlanResponse,
  DeactivateMembershipPlanResponse,
  FreezeMembershipRequest,
  FreezeMembershipResponse,
  GetMembershipInstanceResponse,
  ListMembershipInstancesRequest,
  ListMembershipInstancesResponse,
  ListMembershipPlansRequest,
  ListMembershipPlansResponse,
  RenewMembershipRequest,
  RenewMembershipResponse,
  UpdateMembershipPlanRequest,
  UpdateMembershipPlanResponse,
  ValidateMembershipAccessRequest,
  ValidateMembershipAccessResponse,
} from '@myclup/contracts/membership';
import {
  cancelMembershipContract,
  createMembershipPlanContract,
  deactivateMembershipPlanContract,
  freezeMembershipContract,
  getMembershipInstanceContract,
  listMembershipInstancesContract,
  listMembershipPlansContract,
  renewMembershipContract,
  updateMembershipPlanContract,
  validateMembershipAccessContract,
} from '@myclup/contracts/membership';
import type { ListInvoicesRequest, ListInvoicesResponse } from '@myclup/contracts/billing';
import { listInvoicesContract, listPaymentsContract } from '@myclup/contracts/billing';
import type { ListPaymentsRequest, ListPaymentsResponse } from '@myclup/contracts/billing';
import type { ApiContract, RequestOptions } from './client';

type RequestFn = <T>(
  contract: ApiContract<unknown, T>,
  requestData?: unknown,
  options?: RequestOptions
) => Promise<T>;

export function createMembershipApi(request: RequestFn) {
  return {
    async listMembershipPlans(
      params?: ListMembershipPlansRequest
    ): Promise<ListMembershipPlansResponse> {
      return request(
        listMembershipPlansContract as ApiContract<
          ListMembershipPlansRequest,
          ListMembershipPlansResponse
        >,
        params
      );
    },

    async getMembershipInstance(id: string): Promise<GetMembershipInstanceResponse> {
      return request(
        getMembershipInstanceContract as ApiContract<unknown, GetMembershipInstanceResponse>,
        undefined,
        { pathParams: { id } }
      );
    },

    async listMembershipInstances(
      params?: ListMembershipInstancesRequest
    ): Promise<ListMembershipInstancesResponse> {
      return request(
        listMembershipInstancesContract as ApiContract<
          ListMembershipInstancesRequest,
          ListMembershipInstancesResponse
        >,
        params
      );
    },

    async renewMembership(
      id: string,
      input: RenewMembershipRequest
    ): Promise<RenewMembershipResponse> {
      return request(
        renewMembershipContract as ApiContract<RenewMembershipRequest, RenewMembershipResponse>,
        input,
        { pathParams: { id } }
      );
    },

    async freezeMembership(
      id: string,
      input: FreezeMembershipRequest
    ): Promise<FreezeMembershipResponse> {
      return request(
        freezeMembershipContract as ApiContract<FreezeMembershipRequest, FreezeMembershipResponse>,
        input,
        { pathParams: { id } }
      );
    },

    async cancelMembership(
      id: string,
      input: CancelMembershipRequest
    ): Promise<CancelMembershipResponse> {
      return request(
        cancelMembershipContract as ApiContract<CancelMembershipRequest, CancelMembershipResponse>,
        input,
        { pathParams: { id } }
      );
    },

    async validateMembershipAccess(
      id: string,
      input: ValidateMembershipAccessRequest
    ): Promise<ValidateMembershipAccessResponse> {
      return request(
        validateMembershipAccessContract as ApiContract<
          ValidateMembershipAccessRequest,
          ValidateMembershipAccessResponse
        >,
        input,
        { pathParams: { id } }
      );
    },

    async listInvoices(params?: ListInvoicesRequest): Promise<ListInvoicesResponse> {
      return request(
        listInvoicesContract as ApiContract<ListInvoicesRequest, ListInvoicesResponse>,
        params
      );
    },

    async listPayments(params?: ListPaymentsRequest): Promise<ListPaymentsResponse> {
      return request(
        listPaymentsContract as ApiContract<ListPaymentsRequest, ListPaymentsResponse>,
        params
      );
    },

    async createMembershipPlan(
      input: CreateMembershipPlanRequest
    ): Promise<CreateMembershipPlanResponse> {
      return request(
        createMembershipPlanContract as ApiContract<
          CreateMembershipPlanRequest,
          CreateMembershipPlanResponse
        >,
        input
      );
    },

    async updateMembershipPlan(
      id: string,
      input: UpdateMembershipPlanRequest
    ): Promise<UpdateMembershipPlanResponse> {
      return request(
        updateMembershipPlanContract as ApiContract<
          UpdateMembershipPlanRequest,
          UpdateMembershipPlanResponse
        >,
        input,
        { pathParams: { id } }
      );
    },

    async deactivateMembershipPlan(id: string): Promise<DeactivateMembershipPlanResponse> {
      return request(
        deactivateMembershipPlanContract as ApiContract<
          undefined,
          DeactivateMembershipPlanResponse
        >,
        undefined,
        { pathParams: { id } }
      );
    },
  };
}
