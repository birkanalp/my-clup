import type {
  BillingSummaryRequest,
  BillingSummaryResponse,
  GetInvoiceDetailRequest,
  GetInvoiceDetailResponse,
  ListInvoicesRequest,
  ListInvoicesResponse,
  RecordInvoicePaymentRequest,
  RecordInvoicePaymentResponse,
} from '@myclup/contracts/billing';
import {
  getBillingSummaryContract,
  getInvoiceDetailContract,
  listInvoicesContract,
  recordInvoicePaymentContract,
} from '@myclup/contracts/billing';
import type { ApiContract, RequestOptions } from './client';

type RequestFn = <T>(
  contract: ApiContract<unknown, T>,
  requestData?: unknown,
  options?: RequestOptions
) => Promise<T>;

export function createBillingApi(request: RequestFn) {
  return {
    async getBillingSummary(params?: BillingSummaryRequest): Promise<BillingSummaryResponse> {
      return request(
        getBillingSummaryContract as ApiContract<BillingSummaryRequest, BillingSummaryResponse>,
        params
      );
    },

    async listInvoices(params?: ListInvoicesRequest): Promise<ListInvoicesResponse> {
      return request(
        listInvoicesContract as ApiContract<ListInvoicesRequest, ListInvoicesResponse>,
        params
      );
    },

    async getInvoiceDetail(id: string): Promise<GetInvoiceDetailResponse> {
      return request(
        getInvoiceDetailContract as ApiContract<GetInvoiceDetailRequest, GetInvoiceDetailResponse>,
        {},
        { pathParams: { id } }
      );
    },

    async recordInvoicePayment(
      id: string,
      input: RecordInvoicePaymentRequest
    ): Promise<RecordInvoicePaymentResponse> {
      return request(
        recordInvoicePaymentContract as ApiContract<
          RecordInvoicePaymentRequest,
          RecordInvoicePaymentResponse
        >,
        input,
        { pathParams: { id } }
      );
    },
  };
}
