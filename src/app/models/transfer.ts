import { DateHelper } from '@app/helpers/date.helper';
import { Auditable } from './auditable';
import { TransferItem } from './transfer-item';

export class Transfer extends Auditable {
  id: string;
  payeeExternalId: string;
  payeeLegalName: string;
  payeeName: string;
  payeeNameOnCheck: string;
  attention: string | null;

  payeeAddress1: string | null;
  payeeAddress2: string | null;
  payeeAddressCity: string | null;
  payeeAddressState: string | null;
  payeeAddressZip: string | null;
  payeeAddressCountry: string | null;

  amount: number;
  paymentMethodId: number;
  disbursementType: string;
  furtherCreditAccount: string;
  payeeAccountName: string;
  payeeBankName: string;
  payeeAccountNumber: string;

  payeeRoutingNumber: string;
	payeeBankAddress: string;
	wireAdditionalInformation: string;
	entityId: number;
	entityTypeId: number | null;
	disbursementGroupClaimantId: number | null;
	rowId: number;
	paymentItemTypeId: number | null;
	isIndividual: boolean;
  errorMessage: string;
	addressee: string | null;

	clientId: number | null;

	payeeAddressId: number | null;

	qsfOrgId: number;
	qsfBankAccountId: number;

  items: TransferItem[] | null;

  numberOfClients: number;
  paymentStatusName: string;

  constructor(model?: Partial<Transfer>) {
    super();
    Object.assign(this, model);
  }

  public static toModel(item: any): Transfer {
    return {
      ...super.toModel(item),
      id: item.id,
      createdDate: DateHelper.toLocalDate(item.createdDate),
      lastModifiedDate: DateHelper.toLocalDate(item.lastModifiedDate),
      payeeExternalId: item.payeeExternalId,
      payeeLegalName: item.payeeLegalName,
      payeeName: item.payeeName,
      payeeNameOnCheck: item.payeeNameOnCheck,
      attention: item.attention,

      payeeAddress1: item.payeeAddress1,
      payeeAddress2: item.payeeAddress2,
      payeeAddressCity: item.payeeAddressCity,
      payeeAddressState: item.payeeAddressState,
      payeeAddressZip: item.payeeAddressZip,
      payeeAddressCountry: item.payeeAddressCountry,



      amount: item.amount,
      paymentMethodId: item.paymentMethodId,
      disbursementType: item.disbursementType,
      payeeRoutingNumber: item.payeeRoutingNumber,
      payeeAccountName: item.payeeAccountName,



      rowId: item.rowId,
      paymentItemTypeId: item.paymentItemTypeId,
      payeeBankName: item.payeeBankName,
      payeeAccountNumber: item.payeeAccountNumber,
      furtherCreditAccount: item.furtherCreditAccount,

      payeeBankAddress: item.payeeBankAddress,
      wireAdditionalInformation: item.wireAdditionalInformation,
      errorMessage: item.errorMessage,
      addressee: item.addressee,

      clientId: item.clientId,

      entityId: item.entityId,
      entityTypeId: item.entityTypeId,
      isIndividual: item.isIndividual,
      disbursementGroupClaimantId: item.disbursementGroupClaimantId,

      payeeAddressId: item.payeeAddressId,
      qsfOrgId: item.qsfOrgId,
      qsfBankAccountId: item.qsfBankAccountId,

      items: item.items.map(TransferItem.toModel),

      numberOfClients: item.numberOfClients,
      paymentStatusName: item.paymentStatusName,
    };
  }
}
