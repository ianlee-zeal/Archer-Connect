export class FormulaSetSettings {
  projectSettingId: number;
  formulaSetId: number;
  mdlMode : string;
  costFeeFirst: string;
  netAllocationThreshold: number;
  defaultContractFeePercentage: number;
  defaultPercentageOfGross: number;
  defaultAttorneySplit: number;
  defaultClaimantSplit: number;
  netAllocationOriginatingFormulaId: number;
  feeAndExpensesOriginatingFormulaId: number;
  grossAllocationOriginatingFormulaId: number;

  public static toModel(item: any): FormulaSetSettings {
    if (item) {
      return {
        projectSettingId: item.projectSettingId,
        formulaSetId: item.formulaSetId,
        mdlMode: item.mdlMode,
        costFeeFirst: item.costFeeFirst,
        netAllocationThreshold: item.netAllocationThreshold,
        defaultContractFeePercentage: item.defaultContractFeePercentage,
        defaultPercentageOfGross: item.defaultPercentageOfGross,
        defaultAttorneySplit: item.defaultAttorneySplit,
        defaultClaimantSplit: item.defaultClaimantSplit,
        netAllocationOriginatingFormulaId: item.netAllocationOriginatingFormulaId,
        feeAndExpensesOriginatingFormulaId: item.feeAndExpensesOriginatingFormulaId,
        grossAllocationOriginatingFormulaId: item.grossAllocationOriginatingFormulaId,
      };
    }

    return null;
  }
}
