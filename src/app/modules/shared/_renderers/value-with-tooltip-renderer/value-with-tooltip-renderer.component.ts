import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-value-with-tooltip-renderer',
  templateUrl: './value-with-tooltip-renderer.component.html',
})
export class ValueWithTooltipRendererComponent implements ICellRendererAngularComp {
  public params: ICellRendererParams;
  public value: string;

  public refresh(): boolean {
    return true;
  }

  public agInit(params: ICellRendererParams): void {
    this.params = params;
    this.value = params.value;
  }
}
