import { IdValue } from '../idValue';

export class ClaimSettlementCurrentData {
  netAllocationThreshold: number;
  qsfProductId: number;
  isQsfServiceChanged: boolean;
  lienPaymentsOrganization?: IdValue;
  isDefaultLienPaymentsOrganization?: boolean;
  defenseApprovalRequired: boolean;
  multipleRoundsOfFunding: boolean;
  enableLienTransfers: boolean;
  isManualPaymentRequestsAllowed: boolean;
  isFeeAutomationEnabled: boolean;
  isClosingStatementAutomationEnabled: boolean;
  isPaymentAutomationEnabled?: boolean;
  isLienImportAutomationEnabled?: boolean;
  isLienImportAutomationPermissionEnabled?: boolean;
}
