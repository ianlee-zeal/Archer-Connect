import { EntityTypeEnum } from './enums';

export class CallInfo {
  entityId: number;
  entityType: EntityTypeEnum;
  clientName: string;
  duration: number;
}
