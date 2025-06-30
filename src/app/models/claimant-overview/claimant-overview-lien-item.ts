import { Stage } from "../stage";

export class ClaimantOverviewLienItem {
  productWorkflowId: number;
  productDetailProbateId?: number;
  productDetailBankruptcyId?: number;
  productDetailReleaseId?: number;
  productCategoryId: number;
  productId?: number;
  type: string;
  phase: string;
  stage: Stage;
  lienId?: number;
  lienCategory: string;
  lienHolder: string;
  collector: string;
  onBenefits: string;
  inboundAmount: string;
  currentLienAmount: string;
  finalLienAmount: string;
  lienPaid?: Date;
  status: string;
  deficiencies: number;
  finalDate?: Date;
  writtenToLedger: number;


  public static toModel(item: any): ClaimantOverviewLienItem {
    if (!item) {
      return null;
    }

    return {
      productWorkflowId: item.productWorkflowId,
      productDetailProbateId: item.productDetailProbateId,
      productDetailBankruptcyId: item.productDetailBankruptcyId,
      productDetailReleaseId: item.productDetailReleaseId,
      productCategoryId: item.productCategoryId,
      productId: item.productId,
      type: item.type,
      phase: item.phase,
      stage: Stage.toModel(item.stage),
      lienId: item.lienId,
      lienCategory: item.lienCategory,
      lienHolder: item.lienHolder,
      collector: item.collector,
      onBenefits: item.onBenefits,
      inboundAmount: item.inboundAmount,
      currentLienAmount: item.currentLienAmount,
      finalLienAmount: item.finalLienAmount,
      lienPaid: item.lienPaid,
      status: item.status,
      deficiencies: item.deficiencies,
      finalDate: item.finalDate,
      writtenToLedger: item.writtenToLedger,
    };
  }
}
