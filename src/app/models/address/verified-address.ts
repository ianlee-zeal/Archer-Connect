import { RecipientAddress } from './recipient-address';
import { ResultDetail } from './result-detail';
import { Address } from './address';
import { AddressType } from '../address-type';
import { User } from '../user';

export class VerifiedAddress extends RecipientAddress {
  name: string;
  resultDetails: ResultDetail[];
  statusCode: number;

  constructor(model?: Partial<VerifiedAddress>) {
    super(model);

    Object.assign(this, model);
  }

  public static toModel(item: any): VerifiedAddress {
    return {
      ...RecipientAddress.toModel(item),
      name: item.name,
      resultDetails: item.resultDetails as ResultDetail[],
      statusCode: item.statusCode
    };
  }

  public static fromValidation(item: any, verified): VerifiedAddress {
    return {
      ...Address.fromValidation(item, verified),
      name: item.name,
      addressType: AddressType.toModel(item.type),
      isPrimary: item.isPrimary,
      isActive: item.isActive,
      range: {
        from: item.startDate ? new Date(item.startDate) : null,
        to: item.endDate ? new Date(item.endDate) : null,
      },
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
