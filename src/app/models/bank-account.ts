import { Hidable } from '@app/modules/shared/_functions/hidable';
import { DateHelper } from '@app/helpers/date.helper';
import { Address } from './address/address';
import { BankAccountStatus } from './enums/bank-account-status.enum';
import { Auditable } from './auditable';
import { BankAccountType } from './bank-account-type';
import { Status } from './status';
import { Org } from './org';
import { BankAccountFormatEnum } from './enums';

export class BankAccount extends Auditable {
  id: number;
  name: string;
  bankName: string;
  accountNumber: string;
  hiddenAccountNumber: string;
  statusId: BankAccountStatus;
  accountTypeId: number;
  statusActive: boolean;
  isPrimary: boolean;
  lastModifiedById: number | undefined;
  orgId: number;
  wireABARoutingNumber: string;
  ffcAccount: string;
  enableACH: boolean;
  enableWire: boolean;
  enableCheck: boolean;
  nextCheckNumber: number;
  nextWireNumber: number;
  bankPhone: string;
  bankAddress: Address;
  bankAccountType: BankAccountType;
  status: Status;
  organization: Org;
  swift: string;
  dateVerifiedWithFirm: Date;
  bankContactName: string;
  firmContactProvidingVerification: string;
  clearingAccount: string;
  clearingBankName: string;
  achabaRoutingNumber: string;
  bankAccountFormat: BankAccountFormatEnum;
  bankAccountName: string;

  constructor(model?: Partial<BankAccount>) {
    super();
    Object.assign(this, model);
  }

  public static toModel(item: any): BankAccount {
    const hiddenAccountNumber = Hidable.hideNumber(item.accountNumber?.toString());
    return {
      ...super.toModel(item),
      id: item.id,
      name: item.name,
      bankName: item.bankName,
      accountNumber: item.accountNumber,
      accountTypeId: item.bankAccountType ? item.bankAccountType.id : null,
      statusId: item.statusId,
      statusActive: item.active,
      isPrimary: item.isPrimary,
      lastModifiedById: item.lastModifiedById,
      orgId: item.orgId,
      wireABARoutingNumber: item.wireABARoutingNumber,
      ffcAccount: item.ffcAccount,
      enableACH: item.enableACH,
      enableCheck: item.enableCheck,
      enableWire: item.enableWire,
      nextCheckNumber: item.nextCheckNumber || null,
      nextWireNumber: item.nextWireNumber || null,
      bankPhone: item.bankPhone,
      bankAddress: item.bankAddress ? Address.toModel(item.bankAddress) : null,
      bankAccountType: item.bankAccountType ? BankAccountType.toModel(item.bankAccountType) : null,
      status: item.status ? Status.toModel(item.status) : null,
      hiddenAccountNumber,
      organization: item.organization ? Org.toModel(item.organization) : null,
      swift: item.swift,
      dateVerifiedWithFirm: DateHelper.toLocalDate(item.dateVerifiedWithFirm),
      bankContactName: item.bankContactName,
      firmContactProvidingVerification: item.firmContactProvidingVerification,
      clearingAccount: item.clearingAccount,
      clearingBankName: item.clearingBankName,
      achabaRoutingNumber: item.achabaRoutingNumber,
      bankAccountFormat: item.bankAccountFormat,
      bankAccountName: item.bankAccountName
    };
  }

  public static toDTO(bankAccount: BankAccount): any {
    return {
      id: bankAccount.id,
      name: bankAccount.name,
      bankName: bankAccount.bankName,
      accountNumber: bankAccount.accountNumber,
      statusId: bankAccount.statusId,
      lastModifiedById: bankAccount.lastModifiedById,
      lastModifiedDate: new Date(),
      wireABARoutingNumber: bankAccount.wireABARoutingNumber,
      ffcAccount: bankAccount.ffcAccount,
      defaultPaymentMethod: '',
      bankPhone: bankAccount.bankPhone,
      bankAddress: Address.toDto(bankAccount.bankAddress),
      swift: bankAccount.swift,
      dateVerifiedWithFirm: bankAccount.dateVerifiedWithFirm,
      bankContactName: bankAccount.bankContactName,
      firmContactProvidingVerification: bankAccount.firmContactProvidingVerification,
      clearingAccount: bankAccount.clearingAccount,
      clearingBankName: bankAccount.clearingBankName,
      achabaRoutingNumber: bankAccount.achabaRoutingNumber,
      // start of required DTO properties that FE doesn't have
      balance: '',
      enableACH: bankAccount.enableACH,
      enableWire: bankAccount.enableWire,
      enableCheck: bankAccount.enableCheck,
      externalCode: '',
      nextACHNumber: '',
      nextCheckNumber: bankAccount.nextCheckNumber,
      nextWireNumber: bankAccount.nextWireNumber,
      lastBalanceUpdate: '',
      defaultPaymentMethodId: '',
      bankAccountTypeId: bankAccount.accountTypeId,
      active: !!bankAccount.statusActive,
      isPrimary: bankAccount.isPrimary,
      orgId: bankAccount.orgId,
      bankAccountFormat: bankAccount.bankAccountFormat,
      bankAccountName: bankAccount.bankAccountName
    };
  }
}
