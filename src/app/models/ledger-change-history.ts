import { DateHelper } from '@app/helpers/date.helper';

export class LedgerChangeHistory {
  modifiedBy: string;
  dateModified: Date;
  updatedByProcess: string;
  newStage: string;

  public static toModel(item): LedgerChangeHistory {
    return {
      modifiedBy: item.modifiedBy,
      dateModified: DateHelper.toLocalDate(item.dateModified),
      updatedByProcess: item.updatedByProcess,
      newStage: item.newStage,
    };
  }
}
