export class FormulaSetMappings {
    id: number;
    formulaSetId: number;
    name: string;
    formulaVariableId: number;

    public static toModel(item: any): FormulaSetMappings {
        if (item) {
            return {
                id: item.id,
                formulaSetId: item.formulaSetId,
                name: item.name,
                formulaVariableId: item.formulaVariableId,
            }
        }

        return null;
    }
}