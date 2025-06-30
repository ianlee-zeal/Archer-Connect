export class ScheduledReport {
  id: number;
  caseId: number;
  integrationTypeName: string;
  cronExpression: string;
  cronDescription: string;
  frequencyId?: number;
  frequencyName: string;
  automationEnabled: boolean;
  recipientsCount? : number;
  lastRunDate?: Date;
  statusId?: number;
  statusName: string;
  lastModifiedDate: Date;
  lastModifiedByUserName: string;

  constructor(model?: Partial<ScheduledReport>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): ScheduledReport | null {
    if (item) {
      return {
        ...item,
      };
    }
    return null;
  }
}
