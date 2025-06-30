import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-grid-checkmark-renderer',
  templateUrl: './grid-checkmark-renderer.component.html',
  styleUrls: ['./grid-checkmark-renderer.component.scss']
})
export class GridCheckmarkRendererComponent implements ICellRendererAngularComp {
  public isMarked = false;

  public refresh(_: ICellRendererParams): boolean {
    return true;
  }

  public agInit(params: ICellRendererParams): void {
    this.isMarked = params.value;
  }

}
