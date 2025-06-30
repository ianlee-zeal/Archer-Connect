export class WorkflowCommand {
  id: number;
  productType: string;
  name: string;
  beginStatus: string;
  endStatus: string;
  description: string;
  automaticNote: string;
  managementInstructions: string;
  fieldsToUpdate: string;

  public static toModel(item: WorkflowCommand): WorkflowCommand {
    if (item) {
      return {
        id: item.id,
        productType: item.productType,
        name: item.name,
        endStatus: item.endStatus,
        beginStatus: item.beginStatus,
        description: item.description,
        automaticNote: item.automaticNote,
        fieldsToUpdate: item.fieldsToUpdate,
        managementInstructions: item.managementInstructions,
      };
    }
    return null;
  }
}
