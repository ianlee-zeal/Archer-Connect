import { EntityTypeEnum } from '../enums';
import { ISearchOptions } from '../search-options';

export class PaymentRequestConfig {
  paymentItemsTypes: number[];
  attachRemittance = false;
  attachClosingStatement = false;
  closingStatementTemplateId: number = null;
  attachLetterForLiens = false;
  attachLetterForLiensTemplateId: number = null;
  memoLienId = false;
  memoClaimantId = false;
  memoClaimantName = false;
  remittanceDetailsTemplateId: number = null;
  attachRemittanceDetails: boolean = false;
  paymentCoversheetTemplateId: number = null;
  attachPaymentCoversheet: boolean = false;
  searchOptions: ISearchOptions;
  paymentRequestEntityType: EntityTypeEnum = null;

  attachCheckTable: boolean = false;
  checkTableTemplateId: number = null;
}
