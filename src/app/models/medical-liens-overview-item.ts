export class MedicalLiensOverviewItem {
  onBenefits?: boolean;
  inboundLienAmount: string;
  currentLienAmount: string;
  finalLienAmount: string;
  phase: string;
  stage: string;
  status: string;
  lienType: string;
  lienHolder: string;
  collector: string;
  lienPaidDate: Date;
  lienProductId: number;
  lienProductCategory: string;

  constructor(model?: Partial<MedicalLiensOverviewItem>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): MedicalLiensOverviewItem | null {
    if (!item) {
      return null;
    }

    return {
      onBenefits: item.onBenefits,
      inboundLienAmount: item.inboundLienAmount,
      currentLienAmount: item.currentLienAmount,
      finalLienAmount: item.finalLienAmount,
      phase: item.phase,
      stage: item.stage,
      status: item.status,
      lienHolder: item.lienHolder,
      lienType: item.lienType,
      collector: item.collector,
      lienPaidDate: item.lienPaidDate,
      lienProductId: item.lienProductId,
      lienProductCategory: item.lienProductCategory
    };
  }
}
