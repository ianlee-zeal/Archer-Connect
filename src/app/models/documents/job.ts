import { EntityTypeEnum, ScheduleType } from '../enums';

export class Job {
  id: number;
  entityTypeId?: EntityTypeEnum;
  entityId?: number;
  logDocId?: number;
  scheduleType: ScheduleType;
  statusId: number;

  description: string;
  statusMessage: string;

  queueTime?: Date;
  startTime?: Date;
  endTime?: Date;

  createdBy?: number;
  createdDate?: Date;

  lastModifiedBy?: number;
  lastModifiedDate?: number;

  constructor(model?: Job) {
    Object.assign(this, model);
  }

  public static toModel(item: any): Job {
    return {
        id: item.id,
        entityTypeId: item.entityTypeId,
        entityId: item.entityId,
        logDocId: item.logDocId,
        scheduleType: item.scheduleType,
        statusId: item.statusId,
        description: item.description,
        statusMessage: item.statusMessage,
        queueTime: item.queueTime,
        startTime: item.startTime,
        endTime: item.endTime,
        createdBy: item.createdBy,
        createdDate: item.createdDate,
        lastModifiedBy: item.lastModifiedBy,
        lastModifiedDate: item.lastModifiedDate,
    };
  }
}
