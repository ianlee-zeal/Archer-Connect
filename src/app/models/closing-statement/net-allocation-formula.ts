import { NetAllocationVariable } from "./net-allocation-variable";

export class NetAllocationFormula {
  step: number;
  formula: string;
  operation: string;
  operationDescription: string;
  result: number;
  variables: NetAllocationVariable[];

  public static toModel(item: any): NetAllocationFormula {
    if (item) {
      return {
        step: item.step,
        formula: item.formula,
        operation: item.operation,
        operationDescription: item.operationDescription,
        result: item.result,
        variables: item.variables,
      };
    }

    return null;
  }
}
