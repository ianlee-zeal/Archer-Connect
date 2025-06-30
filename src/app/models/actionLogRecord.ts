import { DateHelper } from '@app/helpers/date.helper';
import { IdValue } from './idValue';

export class ActionLogRecord {
  userId: number;
  username: string;
  ip: string;
  logDate: Date;
  actionType: IdValue;

  constructor(model?: Partial<ActionLogRecord>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): ActionLogRecord {
    return {
      userId: item.userId,
      username: item.username,
      ip: item.ip,
      logDate: DateHelper.toLocalDate(item.logDate),
      actionType: item.actionType,
    };
  }
}
