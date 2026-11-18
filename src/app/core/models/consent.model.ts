export interface ConsentStatus {
  termsAccepted: boolean;
  termsVersion: string | null;
  termsAcceptedAt: string | null;
  sensitiveDataConsentActive: boolean;
  sensitiveDataConsentVersion?: string | null;
  sensitiveDataConsentAt?: string | null;
  currentTermsVersion?: string | null;
  currentPrivacyVersion?: string | null;
  sensitiveConsentVersion?: string | null;
  sensitiveConsentAt?: string | null;
  termsAcceptancePending?: boolean;
  sensitiveConsentPending?: boolean;
  [key: string]: unknown;
}

export interface ConsentVersions {
  termsVersion: string;
  privacyVersion: string;
  lastUpdated?: string;
  [key: string]: unknown;
}
