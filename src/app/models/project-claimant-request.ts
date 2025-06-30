export class ProjectClaimantRequest {
  projectId: number;
  projectName: string;
  claimantId: number;
  claimantName: string;

  public static toModel(item: any): ProjectClaimantRequest {
    if (!item) {
      return null;
    }

    return {
      projectId: item.caseId,
      projectName: item.caseName,
      ...item,
    };
  }
}
