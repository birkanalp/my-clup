import {
  ListCampaignsRequestSchema,
  ListCampaignsResponseSchema,
  CreateCampaignRequestSchema,
  CreateCampaignResponseSchema,
  SendCampaignRequestSchema,
  SendCampaignResponseSchema,
} from './schemas';

export const listCampaignsContract = {
  path: '/api/v1/campaigns',
  method: 'GET' as const,
  request: ListCampaignsRequestSchema,
  response: ListCampaignsResponseSchema,
} as const;

export const createCampaignContract = {
  path: '/api/v1/campaigns',
  method: 'POST' as const,
  request: CreateCampaignRequestSchema,
  response: CreateCampaignResponseSchema,
} as const;

export const sendCampaignContract = {
  path: '/api/v1/campaigns/:id/send',
  method: 'POST' as const,
  request: SendCampaignRequestSchema,
  response: SendCampaignResponseSchema,
} as const;
