/* eslint-disable import/no-cycle */
import { Hidable } from '@app/modules/shared/_functions/hidable';
import { Address } from './address/address';
import { Project } from './projects/project';
import { Auditable } from './auditable';
import { Claimant } from './claimant';

export class PaymentPreferencesItem extends Auditable {
  id: number;
  isGlobal: boolean;
  level: string;
  case?: Project;
  caseId?: number;
  client: Claimant;
  clientId?: number;
  orgId: number;
  paymentType: string;
  paymentItemTypeId: number;
  paymentItemTypeName: string;
  paymentMethod: string;
  paymentMethodId: number;
  address?: Address;
  addressId?: number;
  status: boolean;
  bankAccountName?: string;
  bankAccountId?: number;
  bankName?: string;
  accountNumber?: string;
  accountType?: string;
  bankAccountStatus?: string;
  active: boolean;
  furtherCreditAccount?: string;
  enableNetToFirmByDefault?: boolean;
  transferToSubAccount?: boolean;
  qsfOrgId?: number;
  qsfOrg?: string;
  qsfBankAccountId?: number;
  qsfBankAccount?: string;
  transferFFC?: string;

  constructor(model?: Partial<PaymentPreferencesItem>) {
    super();
    Object.assign(this, model);
  }

  public static toModel(item: any): PaymentPreferencesItem {
    if (!item) {
      return null;
    }
    return {
      ...Auditable.toModel(item),
      id: item.id,
      orgId: item?.orgId,
      isGlobal: item.isGlobal,
      level: item.clientId ? `${item.clientId} - ${item.client?.fullName}` : item.case?.name,
      case: item?.case,
      caseId: item.case?.id,
      client: item?.client,
      clientId: item.client?.id,
      paymentType: item.paymentItemType?.name,
      paymentItemTypeId: item.paymentItemType?.id,
      paymentItemTypeName: item.paymentItemType?.name,
      paymentMethod: item.paymentMethod?.name,
      paymentMethodId: item.paymentMethod?.id,
      address: item.address,
      status: item.active,
      bankAccountName: item.bankAccount?.name,
      bankAccountId: item.bankAccount?.id,
      bankName: item.bankAccount?.bankName,
      accountNumber: Hidable.hideNumber(item.bankAccount?.accountNumber?.toString()),
      accountType: item.bankAccount?.bankAccountType?.name,
      bankAccountStatus: item.bankAccount?.status?.name,
      active: item.active,
      furtherCreditAccount: item.furtherCreditAccount,
      enableNetToFirmByDefault: item.enableNetToFirmByDefault,
      transferToSubAccount: item.transferToSubAccount,
      qsfOrgId: item.qsfOrgId,
      qsfOrg: item.qsfOrg,
      qsfBankAccountId: item.qsfBankAccountId,
      qsfBankAccount: item.qsfBankAccount,
      transferFFC: item.transferFFC,
    };
  }

  public static toDto(item: PaymentPreferencesItem) {
    return {
      id: item?.id,
      orgId: item.orgId,
      caseId: item.caseId,
      clientId: item.clientId,
      paymentMethodId: item.paymentMethodId,
      bankAccountId: item.bankAccountId,
      addressId: item.addressId,
      paymentItemTypeId: item.paymentItemTypeId,
      active: item.active,
      furtherCreditAccount: item.furtherCreditAccount,
      enableNetToFirmByDefault: item.enableNetToFirmByDefault,
      transferToSubAccount: item.transferToSubAccount,
      qsfOrgId: item.qsfOrgId,
      qsfBankAccountId: item.qsfBankAccountId,
      transferFFC: item.transferFFC
    };
  }
}
