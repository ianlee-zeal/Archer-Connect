import { EntityTypeEnum } from '@app/models/enums';

export class Email {
  id: number;
  email: string;
  isPrimary: boolean;
  isActive: boolean;
  entityType: EntityTypeEnum;
  entityId: number;
  emailValue: string;

  constructor(model?: Partial<Email>) {
    Object.assign(this, model);
  }

  public static getEmailId(entityTypeId: number, entityId: number): string {
    return `${entityTypeId}_${entityId}`;
  }
}
