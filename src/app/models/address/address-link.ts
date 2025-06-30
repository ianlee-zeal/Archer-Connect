import { Address } from '.';
import { AddressType } from '../address-type';
import { EntityTypeEnum } from '../enums';

export class AddressLink {
  entityTypeId: number;
  entityType: EntityTypeEnum;
  entityId: number;
  addressId: number;
  address: Address;
  typeId?:number;
  addressType: AddressType;
  isPrimary: boolean;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;

  constructor(model?: Partial<AddressLink>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): AddressLink {
    if (item) {
      return {
        entityTypeId: item.entityTypeId,
        entityType: item.entityType,
        entityId: item.entityId,
        addressId: item.addressId,
        address: Address.toModel(item.address),
        typeId: item.typeId,
        addressType: AddressType.toModel(item.addressType),
        isPrimary: item.isPrimary,
        isActive: item.isActive,
        startDate: item.startDate,
        endDate: item.endDate,
      };
    }

    return null;
  }
}
