import { DateHelper } from '@app/helpers/date.helper';

/* eslint-disable import/no-cycle */
import { User } from './user';
import { Email, Phone, EntityAddress, Address } from '.';
import { BankAccount } from './bank-account';
import { Auditable } from './auditable';
import { IdValue } from './idValue';
import { Document } from './documents';

export class Org extends Auditable {
  id: number;
  name: string;
  altName: string;
  legalName: string;
  website: string;
  nameOnCheck: string;
  erpVendorName: string;
  taxId: string;
  parentOrgId: number;
  primaryOrgTypeId: number;
  primaryOrgTypeName: string;
  accessPolicyId: number;
  accessPolicyName: string;
  emails: Email[];
  phones: Phone[];
  primaryBankAccountId: number;
  primaryBankAccount: BankAccount;
  defaultPaymentMethodId: IdValue;
  defaultPaymentMethod: IdValue;
  defaultPaymentAddressId: IdValue;
  defaultPaymentAddress: Address;
  w9Date: Date;
  w9OnFile: boolean;
  primaryPhone: Phone;
  primaryEmail: Email;
  primaryAddress: EntityAddress;
  createdById: number;
  lastModifiedById: number | undefined;
  deleted: boolean;
  active: boolean;
  isMaster: boolean;
  canSwitch?: boolean;
  defaultCheckMemoFormat: string;
  paymentGroupType: IdValue;
  paymentFrequency: IdValue;
  paymentSchedulingNotes: string;
  paymentInstructionDoc: Document;
  satisfactionRating: IdValue;
  accountManagerId: number;
  accountManager: User;
  clientRelationshipSpecialistId: number;
  clientRelationshipSpecialist: User;
  firmId?: number;
  portalAccess: boolean;
  aslpCashAcctNumber: string;

  /**
   * Flag which indicates whether loaded organization should be handled as
   * sub-organization or not
   *
   * @memberof Org
   */
  isSubOrg? = false;

  public static toModel(item): Org {
    if (!item) return null;

    return {
      ...super.toModel(item),
      id: item.id,
      name: item.name,
      altName: item.alternativeName,
      legalName: item.legalName,
      website: item.website,
      nameOnCheck: item.nameOnCheck,
      erpVendorName: item.erpVendorName,
      taxId: item.taxId,
      parentOrgId: item.parentOrgId,
      primaryOrgTypeId: item.primaryOrgTypeId || null,
      primaryOrgTypeName: item.primaryOrgTypeName,
      accessPolicyId: item.accessPolicyId,
      accessPolicyName: item.accessPolicyName,
      emails: item.emails,
      phones: item.phones,
      primaryBankAccountId: item.primaryBankAccount && item.primaryBankAccount.id,
      primaryBankAccount: item.primaryBankAccount,
      defaultPaymentMethodId: item.defaultPaymentMethod?.id,
      defaultPaymentMethod: item.defaultPaymentMethod,
      defaultPaymentAddressId: item.defaultPaymentAddress?.id,
      defaultPaymentAddress: item.defaultPaymentAddress,
      defaultCheckMemoFormat: item.checkMemoFormat,
      w9Date: DateHelper.toLocalDate(item.w9Date),
      w9OnFile: item.w9OnFile,
      primaryPhone: item.primaryPhone,
      primaryEmail: item.primaryEmail,
      primaryAddress: item.primaryAddress,
      createdById: item.createdById,
      lastModifiedById: item.lastModifiedById,
      deleted: item.deleted,
      active: item.active,
      isMaster: item.isMaster,
      paymentGroupType: item.paymentGroupType,
      paymentFrequency: item.paymentFrequency,
      paymentSchedulingNotes: item.paymentSchedulingNotes,
      paymentInstructionDoc: Document.toModel(item.paymentInstructionDoc),
      satisfactionRating: item.satisfactionRating,
      accountManagerId: item.accountManager?.id,
      accountManager: item.accountManager,
      clientRelationshipSpecialistId: item.clientRelationshipSpecialist?.id,
      clientRelationshipSpecialist: item.clientRelationshipSpecialist,
      firmId: item.firmId,
      portalAccess: item.portalAccess,
      aslpCashAcctNumber: item.aslpCashAcctNumber,
    };
  }

  public static toDto(org): any {
    if (org) {
      return {
        id: org.id,
        name: org.name,
        legalName: org.legalName,
        alternativeName: org.altName,
        website: org.website,
        nameOnCheck: org.nameOnCheck,
        erpVendorName: org.erpVendorName,
        taxId: org.taxId,
        primaryOrgTypeId: org.primaryOrgTypeId,
        accessPolicyId: org.accessPolicyId,
        emails: org.emails,
        phones: org.phones,
        active: org.active,
        primaryBankAccountId: org.primaryBankAccountId,
        defaultPaymentMethodId: org.defaultPaymentMethodId,
        defaultPaymentAddressId: org.defaultPaymentAddressId,
        w9Date: org.w9Date,
        w9OnFile: org.w9OnFile,
        checkMemoFormat: org.defaultCheckMemoFormat,
        paymentGroupTypeId: org.paymentGroupType?.id,
        paymentFrequencyId: org.paymentFrequency?.id,
        paymentSchedulingNotes: org.paymentSchedulingNotes,
        paymentInstructionDoc: org.paymentInstructionDoc ? Document.toDto(org.paymentInstructionDoc, true) : null,
        satisfactionRatingId: org.satisfactionRating?.id,
        accountManager: org.accountManagerDto,
        accountManagerId: org.accountManagerId,
        clientRelationshipSpecialist: org.clientRelationshipSpecialistDto,
        clientRelationshipSpecialistId: org.clientRelationshipSpecialistId,
        firmId: org.firmId,
        aslpCashAcctNumber: org.aslpCashAcctNumber,
      };
    }
    return undefined;
  }
}
