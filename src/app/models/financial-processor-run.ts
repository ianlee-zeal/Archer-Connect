export class FinancialProcessorRun {
  id: number;
  createdDate: Date;
  createdById: number;
  evaluationResultDocId: number;
  entityId: number;
  entityTypeId: number;
  details: string;

  static toModel(item: any): FinancialProcessorRun {
    if (!item) return null;

    return {
      id: item.id,
      createdDate: item.createdDate,
      createdById: item.createdById,
      evaluationResultDocId: item.evaluationResultDocId,
      entityId: item.entityId,
      entityTypeId: item.entityTypeId,
      details: item.details,
    };
  }
}
