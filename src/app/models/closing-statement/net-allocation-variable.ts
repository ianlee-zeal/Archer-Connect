import { NetAllocationVariableEntry } from "./net-allocation-variable-entry";

export class NetAllocationVariable {
    variable: string;
    value: number;
    entries: NetAllocationVariableEntry[];

  public static toModel(item: any): NetAllocationVariable {
    if (item) {
      return {
          variable: item.variable,
          value: item.value,
          entries: item.entries,
      };
    }

    return null;
  }
}
