export class Formula {
    id: number;
    formulaContent: string;
    alias: string;
    orderOfPrecedence: number;
    evaluationMessage: string;
    evaluationErrorMessage: string;
    evaluatedValue: string;
    description: string;

    public static toModel(item: any): Formula {
        if (item) {
            return {
                id: item.id,
                formulaContent: item.formulaContent,
                alias: item.alias,
                orderOfPrecedence: item.orderOfPrecedence,
                evaluationMessage: item.evaluationMessage,
                evaluationErrorMessage: item.evaluationErrorMessage,
                evaluatedValue: item.evaluatedValue,
                description: item.description,
            }
        }

        return null;
    }
}