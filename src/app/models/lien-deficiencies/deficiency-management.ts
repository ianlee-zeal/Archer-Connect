
export class DeficiencyManagement {
  name: string;
  category: string;
  id: number;
  resultDocumentId: number;
  automatedStatusChangeDate: Date;
  active: boolean;

  static toModel(item: DeficiencyManagement | any) : DeficiencyManagement | null {
    if (item) {
      return {
        ...item,
      };
    }

    return null;
  }
}
