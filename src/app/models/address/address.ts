import { StringHelper } from '@app/helpers';
import moment from 'moment-timezone';
import { AddressState } from '../address-state';
import { Country } from '../country';
import { User } from '../user';

export class Address {
  id: number;

  line1: string;

  line2: string;

  city: string;

  state: string;

  zip: string;

  dataSourceId: number;

  dataSourceName: string;

  createdBy: User;

  country: Country;

  lastVerifiedDateTime?: Date;

  createdDate: Date;

  constructor(model?: Partial<Address>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): Address {
    if (item) {
      return {
        createdDate: item.createdDate,
        createdBy: item.createdBy,
        id: item.id,
        line1: item.lineOne,
        line2: item.lineTwo,
        city: item.city,
        zip: item.zipCode,
        state: item.state,
        country: (item.country && AddressState.toModel(item.country)) || null,
        lastVerifiedDateTime: item.lastVerifiedDateTime,
        dataSourceId: item.dataSourceId,
        dataSourceName: item.dataSourceName,
      };
    }

    return null;
  }

  public static toDto(item: Address): any {
    if (!item) {
      return null;
    }

    return {
      id: item.id,
      lineOne: StringHelper.toValueOrNull(item.line1),
      lineTwo: StringHelper.toValueOrNull(item.line2),
      city: StringHelper.toValueOrNull(item.city),
      state: StringHelper.toValueOrNull(item.state),
      zipCode: StringHelper.toValueOrNull(item.zip),
      country: item.country,
      lastVerifiedDateTime: item.lastVerifiedDateTime,
      dataSourceId: item.dataSourceId,
      createdDate: item.createdDate,
      createdBy: item.createdBy,
      dataSourceName: item.dataSourceName,
    };
  }

  public static fromValidation(original: Address, verified): any {
    return {
      id: original.id,
      lineOne: verified.lineOne,
      lineTwo: verified.lineTwo,
      city: verified.city,
      state: verified.state,
      zipCode: verified.zipCode,
      country: verified.country,
      lastVerifiedDateTime: moment().toISOString(),
    };
  }

  public static getAddressId(entityTypeId: number, entityId: number): string {
    return `${entityTypeId}_${entityId}`;
  }
}
