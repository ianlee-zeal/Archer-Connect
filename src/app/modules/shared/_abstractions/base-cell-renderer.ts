import { ICellRendererAngularComp } from 'ag-grid-angular';

export class BaseCellRendererComponent implements ICellRendererAngularComp {
  public params: any;

  public refresh(): boolean {
    return true;
  }

  public agInit(params: any): void {
    this.params = params;
  }
}
