import { DateHelper } from "@app/helpers";
import { Schedule } from "./schedule";

export class ReportSchedule {
    integrationId?: number;
    integrationName: string;
    integrationTypeName?: string;
    integrationTypeId?: number;
    projectId: number;
    active: boolean;
    schedule: Schedule;
    endDate?: Date;

    constructor(model?: Partial<ReportSchedule>) {
        Object.assign(this, model);
    }

    public static toModel(item: any): ReportSchedule {
      if (!item) return null;

      return {
        integrationId: item.integrationId,
        integrationTypeName: item.integrationTypeName,
        integrationName: item.integrationName,
        integrationTypeId: item.integrationTypeId,
        projectId: item.projectId,
        active: item.active,
        schedule: item.schedule,
        endDate:  DateHelper.toLocalDate(item.endDate),
      };
    }
  }