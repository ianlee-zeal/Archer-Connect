export class FormulaSetVariables {
    id: number;
    formulaSetId: number;
    formulaId: number;
    variableId: number;

    public static toModel(item: any): FormulaSetVariables {
        if (item) {
            return {
                id: item.id,
                formulaSetId: item.formulaSetId,
                formulaId: item.formulaId,
                variableId: item.variableId,
            }
        }

        return null;
    }
}