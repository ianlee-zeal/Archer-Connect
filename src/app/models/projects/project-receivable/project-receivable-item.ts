import { ReceivableItemData } from './project-receivable-item-data';

export interface ReceivableItem {
  checked: boolean;
  data: ReceivableItemData[];
  deficiencyId: number;
  deficiencyTypeId: number;
  enabled: boolean;
  groupCode: string;
  id: number;
  name: string;
  note: string;
  order: number;
  projectId: number;
  recievableCategoryId: number;
  recievableGroup: number;
  recievableTypeId: number;
}
