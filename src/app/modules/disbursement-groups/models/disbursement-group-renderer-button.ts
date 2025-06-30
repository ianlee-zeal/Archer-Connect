import { ICellRendererParams } from 'ag-grid-community';

export interface DisbursementGroupRendererButton {
  title: string;
  handler: (params: ICellRendererParams) => void;
  permission: string | undefined;
}
