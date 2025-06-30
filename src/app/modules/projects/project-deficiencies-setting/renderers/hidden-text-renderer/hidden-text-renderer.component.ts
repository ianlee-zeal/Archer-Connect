import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

export interface IHiddenTextRendererParams {
  value: string;
  isHidden: boolean;
}

@Component({
  selector: 'app-hidden-text-renderer',
  templateUrl: './hidden-text-renderer.component.html',
})
export class HiddenTextRendererComponent implements ICellRendererAngularComp {
  public params: ICellRendererParams;
  public value: string;
  public isHidden: boolean;

  public refresh(): boolean {
    return true;
  }

  public agInit(params: ICellRendererParams & IHiddenTextRendererParams): void {
    this.params = params;
    this.value = params.value;
    this.isHidden = params.isHidden;
  }
}
