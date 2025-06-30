import { DateHelper } from '@app/helpers/date.helper';

export class ChangeHistory {
  displayName: string;
  date: Date;
  columnName: string;
  oldValue: string;
  newValue: string;
  entityType: string;
  entityId: number;

  public static toModel(item): ChangeHistory {
    return {
      displayName: item.displayName,
      date: DateHelper.toLocalDate(item.auditDate),
      columnName: item.columnName,
      oldValue: item.oldValue,
      newValue: item.newValue,
      entityType: item.entityType,
      entityId: item.entityId,
    };
  }
}
