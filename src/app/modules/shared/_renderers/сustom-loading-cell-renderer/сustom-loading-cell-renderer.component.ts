import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'custom-loading-cell-renderer',
  template:
    '<span\>',
})
export class CustomLoadingCellRenderer implements ICellRendererAngularComp {
  public refresh(): boolean {
    return true;
  }


  agInit(): void {
  }
}
