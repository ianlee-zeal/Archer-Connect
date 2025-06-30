import { DateHelper } from '@app/helpers/date.helper';
import { User } from './user';
import { AddressType } from './address-type';
import { Address } from './address/address';

export class EntityAddress extends Address {
  type: AddressType;
  isPrimary: boolean;
  isActive: boolean;
  isPartial: boolean;
  range: {
    from: Date;
    to: Date;
  };
  addressee: string;
  attnTo: string;

  countryName: string;

  entityType: number;
  entityId: number;

  createdBy: User;
  createdDate: Date;
  lastModifiedBy: User;
  lastModifiedDate: Date;

  constructor(model?: Partial<EntityAddress>) {
    super(model);

    Object.assign(this, model);
  }

  public static toModel(item: any): EntityAddress {
    if (!item) {
      return null;
    }

    return {
      ...Address.toModel(item),
      type: AddressType.toModel(item.addressType),
      isPrimary: item.isPrimary,
      isActive: item.isActive,
      isPartial: item.isPartial,
      addressee: item.addressee,
      attnTo: item.attnTo,
      range: {
        from: item.startDate ? new Date(item.startDate) : null,
        to: item.endDate ? new Date(item.endDate) : null,
      },
      countryName: item.country && item.country.name,
      entityType: item.entityType,
      entityId: item.entityId,
      createdBy: User.toModel(item.createdBy),
      createdDate: DateHelper.toLocalDate(item.createdDate),
      lastModifiedBy: (item.lastModifiedBy && User.toModel(item.lastModifiedBy)) || null,
      lastModifiedDate: DateHelper.toLocalDate(item.lastModifiedDate),
    };
  }

  public static toDto(item: EntityAddress): any {
    return {
      ...Address.toDto(item),
      addressType: item.type,
      isPrimary: item.isPrimary,
      isActive: item.isActive,
      isPartial: item.isPartial,
      addressee: item.addressee,
      attnTo: item.attnTo,
      startDate: DateHelper.toUtcDateString(item.range?.from),
      endDate: DateHelper.toUtcDateString(item.range?.to),
      entityType: item.entityType,
      entityId: item.entityId,
    };
  }

  public static fromValidation(item: any, verified): EntityAddress {
    const fromDate: Date = item.startDate ? new Date(item.startDate) : item.range?.from ? new Date(item.range?.from) : null;
    const toDate: Date = item.endDate ? new Date(item.endDate) : item.range?.to ? new Date(item.range?.to) : null;
    return {
      ...Address.fromValidation(item, verified),
      addressType: AddressType.toModel(item.type),
      isPrimary: item.isPrimary,
      isActive: item.isActive,
      isPartial: item.isPartial,
      addressee: item.addressee,
      attnTo: item.attnTo,
      startDate: fromDate,
      endDate: toDate,
      countryName: item.country && item.country.name,
      entityType: item.entityType,
      entityId: item.entityId,
      createdBy: User.toModel(item.createdBy),
      createdDate: (item.createdDate) != null ? new Date(item.createdDate) : new Date(),
      lastModifiedBy: (item.lastModifiedBy && User.toModel(item.lastModifiedBy)) || null,
      lastModifiedDate: (item.lastModifiedDate && new Date(item.lastModifiedDate)) || null,
    };
  }
}
