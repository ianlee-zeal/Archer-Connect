import { Person } from './person';
import { Auditable } from './auditable';
import { IdValue } from './idValue';

export class PersonContact extends Auditable {
  id: number;
  person: Person;
  parentPersonId: number;
  isLegalContact: boolean;
  relationshipType: IdValue;
  representativeType: IdValue;
  description: string;
  specialInstructions: string;
  clientId: number;
  isSkipDuplicateChecking: boolean;
  isPaidOnBehalfOfClaimant?: boolean;
  memoText?: string;
  percentageAllocation?: number;
  amountAllocation?: number;
  paymentMethodId?: number;
  isPrimaryContact?: boolean;
  isLocalCounsel: boolean;
  isReleaseSignatureRequired: boolean;
  additionalInfo: string;
  isCsSignatureRequired: boolean;
  nameOnCheck: string;

  constructor(model?: Partial<PersonContact>) {
    super();
    Object.assign(this, model);
  }

  public static toModel(item: any): PersonContact {
    if (item) {
      return {
        ...super.toModel(item),
        id: item.id,
        person: Person.toModel(item.person),
        parentPersonId: item.parentPersonId,
        isLegalContact: item.isLegal,
        relationshipType: item.relationshipType,
        representativeType: item.representativeType,
        description: item.description,
        specialInstructions: item.specialInstructions,
        clientId: item.clientId,
        isSkipDuplicateChecking: false,
        isPaidOnBehalfOfClaimant: item?.isPaidOnBehalfOfClaimant,
        memoText: item?.memoText,
        percentageAllocation: !!item.percentageAllocation ? item.percentageAllocation * 100 : item.percentageAllocation,
        amountAllocation: item?.amountAllocation,
        paymentMethodId: item?.paymentMethodId,
        isPrimaryContact: item?.isPrimaryContact,
        isLocalCounsel: item.isLocalCounsel,
        isReleaseSignatureRequired: item.isReleaseSignatureRequired,
        additionalInfo: item.additionalInfo,
        isCsSignatureRequired: item.isCsSignatureRequired,
        nameOnCheck: item.nameOnCheck,
      };
    }

    return null;
  }

  public static toDto(item: PersonContact) {
    return {
      ...Person.toContactDto(item.person),
      clientContactId: item.id,
      phoneId: item.person.primaryPhone.id ?? 0,
      emailId: item.person.primaryEmail.id ?? 0,
      addressId: item.person.primaryAddress.id ?? 0,
      isLegal: item.isLegalContact,
      relationshipType: item.relationshipType,
      representativeType: item.representativeType,
      description: item.description,
      specialInstructions: item.specialInstructions,
      isPaidOnBehalfOfClaimant: item?.isPaidOnBehalfOfClaimant,
      memoText: item.memoText,
      percentageAllocation: !!item.percentageAllocation ? item.percentageAllocation / 100 : item.percentageAllocation,
      amountAllocation: item.amountAllocation,
      paymentMethodId: item.paymentMethodId,
      clientId: item.clientId,
      isSkipDuplicateChecking: item.isSkipDuplicateChecking,
      isPrimaryContact: item?.isPrimaryContact,
      isReleaseSignatureRequired: item.isReleaseSignatureRequired,
      additionalInfo: item.additionalInfo,
      isCsSignatureRequired: item.isCsSignatureRequired,
      nameOnCheck: item.nameOnCheck,
    };
  }
}
