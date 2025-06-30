import { EntityTypeEnum } from '@app/models/enums';
import { PhoneType } from './phone-type';

export class Phone {
  id: number;
  number: string;
  cleanNumber: string;
  phoneType: PhoneType;
  isPrimary: boolean;
  isActive: boolean;
  entityType: EntityTypeEnum;
  entityId: number;

  constructor(model?: Partial<Phone>) {
    Object.assign(this, model);
  }
}
