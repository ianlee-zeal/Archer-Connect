import { ClientWorkflowAdvancedSearchKey } from './client-workflow-advanced-search-key.enum';
import { OtherFieldsAdvancedSearchKey } from './other-fields-advanced-search-key.enum';

export class AdvancedSearchFieldDataWithCheckboxKeys {
  static readonly [ClientWorkflowAdvancedSearchKey.ProductCategory] = 'includeNoProductCategory';
  static readonly [OtherFieldsAdvancedSearchKey.LedgerFirmApprovedStatus] = 'includeHoldbackReleaseLedgers';
  static readonly [OtherFieldsAdvancedSearchKey.HoldTypeReason] = 'excludeActivePaymentHold';
}
