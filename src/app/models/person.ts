/* eslint-disable import/no-cycle */
import { Hidable } from '@app/modules/shared/_functions/hidable';
import { DateHelper } from '@app/helpers/date.helper';
import { CommonHelper } from '@app/helpers/common.helper';
import { Email } from './email';
import { Phone } from './phone/phone';
import { Auditable } from './auditable';
import { IdValue } from './idValue';
import { Address } from './address';

export class Person extends Auditable {
  id: number;

  companyName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;

  representativeType: string;
  relationship: string;
  prefix: string;
  suffix: string;
  ssn: string;
  cleanSsn: string;
  hiddenSSN: string;
  dateOfBirth: Date;
  dateOfDeath: Date;
  gender: string;
  maritalStatus: IdValue;
  attentionTo: string;
  emailAddress?: string;
  zipcode?: string;

  primaryEmail: Email;
  primaryPhone: Phone;
  primaryAddress: Address;

  address1?: string;
  emails: Email[];
  phones: Phone[];

  deceased: boolean;
  minor: boolean;
  incapacitatedAdult: boolean;
  spanishSpeakerOnly: boolean;

  isPrimaryContact?: boolean;

  otherIdentifier: string;

  organization: IdValue;
  orgId?: number;

  clientId?: number;

  pin: string;
  designatedNotes: string;

  constructor(model?: Partial<Person>) {
    super();
    Object.assign(this, model);
  }

  public static toModel(item): Person {
    if (!item) {
      return null;
    }
    const hiddenSSN = Hidable.hideNumber(item.ssn);

    return {
      ...super.toModel(item),
      id: item.id,
      companyName: item.companyName,
      firstName: item.firstName,
      middleName: item.middleName,
      lastName: item.lastName,
      fullName: item.fullName,
      representativeType: item.representativeType,
      relationship: item.relationship,
      prefix: item.prefix,
      suffix: item.suffix,
      ssn: item.ssn,
      cleanSsn: item.cleanSsn,
      hiddenSSN,
      dateOfBirth: item.dateOfBirth ? new Date(item.dateOfBirth) : null,
      dateOfDeath: item.dateOfDeath ? new Date(item.dateOfDeath) : null,
      gender: item.gender,
      maritalStatus: item.maritalStatus,
      primaryEmail: item.primaryEmail,
      primaryPhone: item.primaryPhone,
      primaryAddress: Address.toModel(item.primaryAddress),
      address1: item?.address1,
      emails: item.emails || [],
      phones: item.phones || [],
      deceased: item.deceased,
      minor: item.minor,
      incapacitatedAdult: item.incapacitatedAdult,
      spanishSpeakerOnly: item.spanishSpeakerOnly,
      attentionTo: item.attentionTo,
      emailAddress: item?.emailAddress,
      zipcode: item?.zipcode,
      orgId: item?.orgId,
      organization: item?.organization,
      clientId: item?.clientId,
      pin: item?.pin,
      designatedNotes: item?.designatedNotes,
      otherIdentifier: item?.otherIdentifier,
    } as Person;
  }

  public static toDto(item: Person) {
    return {
      id: item.id,
      companyName: item.companyName,
      firstName: item.firstName,
      middleName: item.middleName,
      lastName: item.lastName,
      fullName: item.fullName,
      representativeType: item.representativeType,
      relationship: item.relationship,
      prefix: item.prefix,
      suffix: item.suffix,
      ssn: item.ssn,
      dateOfBirth: DateHelper.toStringWithoutTime(item.dateOfBirth),
      dateOfDeath: DateHelper.toStringWithoutTime(item.dateOfDeath),
      gender: item.gender,
      maritalStatus: item.maritalStatus,
      attentionTo: item.attentionTo,

      primaryEmail: item.primaryEmail,
      primaryPhone: item.primaryPhone,
      primaryAddress: Address.toDto(item.primaryAddress),

      emails: item.emails,
      phones: item.phones,

      deceased: item.deceased,
      minor: item.minor,
      incapacitatedAdult: item.incapacitatedAdult,
      spanishSpeakerOnly: item.spanishSpeakerOnly,

      orgId: item?.orgId,
      organization: item?.organization,

      clientId: item?.clientId,
      pin: item?.pin,
      designatedNotes: item?.designatedNotes,
      otherIdentifier: item?.otherIdentifier,
    };
  }

  public static toContactDto(item: Person) {
    return {
      personId: item.id ?? 0,
      companyName: item.companyName,
      firstName: item.firstName,
      middleName: item.middleName,
      lastName: item.lastName,
      prefix: item.prefix,
      suffix: item.suffix,
      attentionTo: item.attentionTo,
      ssn: item.ssn,
      dateOfBirth: DateHelper.toStringWithoutTime(item.dateOfBirth),
      dateOfDeath: DateHelper.toStringWithoutTime(item.dateOfDeath),
      maritalStatusId: item.maritalStatus?.id,
      gender: item.gender,
      phoneNumber: item.primaryPhone.number,
      email: item.primaryEmail.email,
      lineOne: item.primaryAddress.line1,
      lineTwo: item.primaryAddress.line2,
      city: item.primaryAddress.city,
      state: item.primaryAddress.state,
      zipCode: item.primaryAddress.zip,
      countryId: item.primaryAddress.country?.id,
      orgId: item?.orgId,
      organization: item?.organization,
    };
  }

  public static getFirstMiddleLastName(person: Person): string {
    let fullName = '';
    if (person) {
      fullName += !CommonHelper.isBlank(person.firstName) ? `${person.firstName} ` : '';
      fullName += !CommonHelper.isBlank(person.middleName) ? `${person.middleName} ` : '';
      fullName += !CommonHelper.isBlank(person.lastName) ? `${person.lastName} ` : '';
    }
    return fullName;
  }
}
