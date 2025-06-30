export class LedgerEntryValidationData {
  caseId: number;
  lienResolutionStatusId: number;
  validateLienCredits: boolean;

  public static toModel(item: any): LedgerEntryValidationData {
    if (item) {
      return {
        caseId: item.caseId,
        lienResolutionStatusId: item.lienResolutionStatusId,
        validateLienCredits: item.validateLienCredits,
      };
    }
    return null;
  }
}
