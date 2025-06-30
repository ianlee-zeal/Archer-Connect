import { NetAllocationFormula } from "./net-allocation-formula";

export class NetAllocationDetails {
  clientId: number;
  netAllocation: number;
  formulas: NetAllocationFormula[];

  public static toModel(item: any): NetAllocationDetails {
    if (item) {
      return {
        clientId: item.clientId,
        netAllocation: item.netAllocation,
        formulas: item.formulas,
      };
    }

    return null;
  }
}
