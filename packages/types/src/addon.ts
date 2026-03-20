/**
 * Add-on platform identifiers — keep aligned with @myclup/contracts add-on schemas.
 */
export type AddonPackageId = 'sms_messaging' | 'ai_chatbot' | 'e_signature' | 'ads_campaigns';

export type AddonEntitlementStatus = 'inactive' | 'active' | 'suspended';

export type AddonEntitlementRecord = {
  id: string;
  gymId: string;
  packageId: AddonPackageId;
  status: AddonEntitlementStatus;
  activatedAt: string;
  updatedAt: string;
};
