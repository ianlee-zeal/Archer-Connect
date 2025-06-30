import { ICellRendererAngularComp } from 'ag-grid-angular';
import { EditableCallbackParams, ICellRendererParams } from 'ag-grid-community';

export abstract class EditorRendererBase<T> implements ICellRendererAngularComp {
  public params: ICellRendererParams;
  public value: T;
  public editable: boolean;

  protected get colId():string {
    return this.params.column.getId();
  }

  abstract onChange(input: InputEvent): void;

  public refresh(): boolean {
    return true;
  }

  public agInit(params: ICellRendererParams): void {
    this.params = params;
    this.value = params.value;
    const editable = params.colDef.editable as ((params: EditableCallbackParams) => boolean);
    if (editable) {
      this.editable = editable(this.params as EditableCallbackParams);
    }
  }
}
