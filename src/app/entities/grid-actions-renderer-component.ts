import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams, IAfterGuiAttachedParams } from 'ag-grid-community';

export abstract class GridActionsRendererComponent<T> implements IGridActionsRendererComponent<T> {
  params: IGridActionRendererParams<T>;

  refresh(params: ICellRendererParams): boolean {
    this.params = params;
    return true;
  }

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterGuiAttached?(_params?: IAfterGuiAttachedParams): void {
    return null;
  }

  onDelete() {
    this.params.deleteHandler(this.params.data);
  }

  onEdit() {
    this.params.editHandler(this.params.data);
  }

  onView() {
    this.params.viewHandler(this.params.data);
  }

  onDownload() {
    this.params.downloadHandler(this.params.data);
  }
}

interface IGridActionsRendererComponent<T> extends ICellRendererAngularComp {
  params: IGridActionRendererParams<T>;
}

export interface IGridActionRendererParams<T> {
  data?: T;
  deleteHandler?: (data: T) => void;
  editHandler?: (data: T) => void;
  viewHandler?: (data: T) => void;
  downloadHandler?: (data: T) => void;
  hidden?: (data?: T) => boolean;
  disabled?: (data?: T) => boolean;
  inProgress?: (data?: T) => boolean;
}
