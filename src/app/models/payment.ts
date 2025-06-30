/* eslint-disable import/no-cycle */
import { Hidable } from '@app/modules/shared/_functions/hidable';
import { DateHelper } from '@app/helpers/date.helper';
import { Auditable } from './auditable';
import { PaymentMethod } from './payment-method';
import { DataSource } from './dataSource';
import { PostalCode } from './postalCode';
import { BankAccount } from './bank-account';
import { StopPaymentRequest } from './stop-payment-request';
import { AddressType } from './address-type';
import { EntityTypeEnum } from './enums';
import { CheckVerification } from './check-verification/check-verification';
import { PaymentItem } from './payment-item';
import { User } from './user';
import { IdValue } from './idValue';

export class Payment extends Auditable {
  id: string;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  reference: string;
  payeeName: string;
  amount: number;
  dateSubmitted: Date;
  dateSent: Date;
  dateModified: Date;
  dateLastModified: Date;
  disbursementType: string;
  status: string;
  clearedDate: Date;
  dataSource: DataSource;
  payeeExternalId: string;
  payeeAddress1: string;
  payeeAddress2: string;
  payeeAddressCity: string;
  payeeAddressState: string;
  payeeAddressZip: string;
  payeeAddressCountry: string;
  payeeAddressType: AddressType;
  trackingNumber: string;
  postalCode: PostalCode;
  bankAccountId: string;
  bankAccountName: string;
  hiddenBankAccountNumber: string;
  bankName: string;
  memoReference: string;
  memoText: string;
  payerAccountId: string;
  externalTrxnId: string;
  paymentDescriptionType: string;
  payerAccount: BankAccount;
  rowId: number;
  payerAccountNumber: string;
  payerName: string;
  resolvedPayerName: string;
  payerRoutingNumber: string;
  numberOfClients: number;
  payerBankName: string;
  paymentItemTypeId: number;
  paymentMethodId: number;
  payeeBankAccountId: number;
  payeeBankName: string;
  payeeAccountNumber: string;
  payeeRoutingNumber: string;
  stopPaymentRequest: StopPaymentRequest;
  stopPaymentRequestId: number;
  checkVerificationsCount: number;
  entityId: number;
  entityTypeId: EntityTypeEnum;
  checkVerifications: CheckVerification[];
  isIndividual: boolean;
  paymentItems: PaymentItem[];
  claimantIds: string;
  projectIds: string;
  cannotVoid: boolean;
  voidedByUser?: User;
  voidedBy?: number;
  voidedDate?: Date;
  voidReason: string;

  hasPaymentRequest: boolean;
  paymentRequestStatusId?: number;
  disbursementGroupName?: string;
  disbursementGroupClaimantId?: number;
  acPaymentProviderId?: number;
  acPaymentProvider?: IdValue;
  paymentProviderStatusId?: number;
  paymentProviderStatusName?: string;

  accountingSystem: string;
  accountingSystemLastModifiedDate?: Date;

  paymentProviderOption?: string;
  digitalPaymentCreatedDate?: Date;
  digitalPaymentSubmittedDate?: Date;
  digitalPaymentDisbursedDate?: Date;
  digitalPaymentFinishedDate?: Date;

  hasTransferItems: boolean;
  caseId: number;
  selectionDeadline?: Date;
  constructor(model?: Partial<Payment>) {
    super();
    Object.assign(this, model);
  }

  public static toModel(item: any): Payment {
    return {
      ...super.toModel(item),
      id: item.id,
      paymentMethod: PaymentMethod.toModel(item.paymentMethod),
      referenceNumber: item.referenceNumber,
      reference: item.reference,
      payeeName: item.payeeName,
      amount: item.amount,
      dateSubmitted: item.dateSubmitted,
      dateSent: item.dateSent,
      dateModified: DateHelper.toLocalDate(item.dateModified),
      dateLastModified: DateHelper.toLocalDate(item.dateLastModified),
      disbursementType: item.disbursementType,
      status: item.status,
      clearedDate: DateHelper.toLocalDate(item.clearedDate),
      dataSource: DataSource.toModel(item.dataSource),
      payeeExternalId: item.payeeExternalId,
      payeeAddress1: item.payeeAddress1,
      payeeAddress2: item.payeeAddress2,
      payeeAddressCity: item.payeeAddressCity,
      payeeAddressState: item.payeeAddressState,
      payeeAddressZip: item.payeeAddressZip,
      payeeAddressCountry: item.payeeAddressCountry,
      payeeAddressType: AddressType.toModel(item.payeeAddressType),
      trackingNumber: item.trackingNumber,
      postalCode: PostalCode.toModel(item.postageCode),
      bankAccountId: item.payerAccountId,
      bankAccountName: item.payerAccount ? item.payerAccount.name : '',
      hiddenBankAccountNumber: item.payerAccount ? Hidable.hideNumber(item.payerAccount.accountNumber) : '',
      bankName: item.payerAccount ? item.payerAccount.bankName : '',
      memoReference: item.memoReference,
      memoText: item.memoText,
      payerAccountId: item.payerAccountId,
      externalTrxnId: item.externalTrxnId,
      paymentDescriptionType: item.paymentDescriptionType,
      payerAccount: item.payerAccount ? BankAccount.toModel(item.payerAccount) : null,
      rowId: item.rowId,
      payerAccountNumber: item.payerAccountNumber,
      payerRoutingNumber: item.payerRoutingNumber,
      payerName: item.payerName,
      numberOfClients: item.numberOfClients,
      payerBankName: item.payerBankName,
      paymentItemTypeId: item.paymentItemTypeId,
      paymentMethodId: item.paymentMethodId,
      payeeBankAccountId: item.payeeBankAccountId,
      payeeBankName: item.payeeBankName,
      payeeAccountNumber: item.payeeAccountNumber,
      payeeRoutingNumber: item.payeeRoutingNumber,
      stopPaymentRequest: StopPaymentRequest.toModel(item.stopPaymentRequest),
      stopPaymentRequestId: item.stopPaymentRequestId,
      entityId: item.entityId,
      entityTypeId: item.entityTypeId,
      checkVerificationsCount: item.checkVerifications?.length,
      checkVerifications: item.checkVerifications,
      isIndividual: item.isIndividual,
      paymentItems: item.paymentItems,
      claimantIds: item.claimantIds,
      projectIds: item.projectIds,
      resolvedPayerName: item.resolvedPayerName,
      hasPaymentRequest: item.hasPaymentRequest,
      paymentRequestStatusId: item.paymentRequestStatusId,
      cannotVoid: item.cannotVoid,
      disbursementGroupName: item.disbursementGroupName,
      disbursementGroupClaimantId: item.disbursementGroupClaimantId,
      voidedByUser: item.voidedByUser ? User.toModel(item.voidedByUser) : null,
      voidedBy: item.voidedBy ? item.voidedBy : null,
      voidedDate: DateHelper.toLocalDate(item.voidedDate),
      voidReason: item.voidReason,
      acPaymentProviderId: item.acPaymentProviderId,
      acPaymentProvider: item.acPaymentProvider,
      paymentProviderStatusId: item.paymentProviderStatusId,
      paymentProviderStatusName: item.paymentProviderStatusName,
      accountingSystem: item.accountingSystem,
      accountingSystemLastModifiedDate: DateHelper.toLocalDate(item.accountingSystemLastModifiedDate),
      paymentProviderOption: item.paymentProviderOption,
      digitalPaymentCreatedDate: item.digitalPaymentCreatedDate,
      digitalPaymentSubmittedDate: item.digitalPaymentSubmittedDate,
      digitalPaymentDisbursedDate: item.digitalPaymentDisbursedDate,
      digitalPaymentFinishedDate: item.digitalPaymentFinishedDate,
      hasTransferItems: item.hasTransferItems ? item.hasTransferItems : false,
      caseId: item.caseId,
      selectionDeadline: item.selectionDeadline
    };
  }
}
