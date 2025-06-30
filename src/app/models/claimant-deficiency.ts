export class ClaimantDeficiency {
  id: number;
  deficiencyCategoryName: string;
  deficiencyTypeDisplayName: string;
  stageId: number | null;
  stage: string;
  notes: string;
  createdDate: Date | null;
  lastModifiedDate: Date | null;
  deficiencyTypeDescription: string;
  expectedResponseId: number | null;
  documentsAttachedName: string | null;
  documentsAttachedId?: number | null;
  clientId?: number | null;
  extendedDescription?: string;

  constructor(model?: Partial<ClaimantDeficiency>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): ClaimantDeficiency | null {
    if (item) {
      return {
        ...item,
      };
    }
    return null;
  }
}
