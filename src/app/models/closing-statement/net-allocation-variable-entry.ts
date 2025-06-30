export class NetAllocationVariableEntry {
    description: string;
    value: number;
    accountGroupNo: string;
    accountNo: string;

  public static toModel(item: any): NetAllocationVariableEntry {
    if (item) {
      return {
        description: item.description,
        value: item.value,
        accountGroupNo: item.accountGroupNo,
        accountNo: item.accountNo,
      };
    }

    return null;
  }
}
