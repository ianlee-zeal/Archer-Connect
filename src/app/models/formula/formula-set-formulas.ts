import { Formula } from "./formula";

export class FormulaSetFormulas {
    id: number;
    formulaSetId: number;
    formulaId: number;

    formula: Formula;

    public static toModel(item: any): FormulaSetFormulas {
        if (item) {
            return {
                id: item.id,
                formulaSetId: item.formulaSetId,
                formulaId: item.formulaId,
                formula: item.formula,
            }
        }

        return null;
    }
}