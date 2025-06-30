import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-primary-tag-renderer',
  templateUrl: './primary-tag-renderer.component.html',
})
export class PrimaryTagRendererComponent implements ICellRendererAngularComp {
  public params: ICellRendererParams;
  public isPrimary: boolean;
  public title = '';

  public refresh(): boolean {
    return true;
  }

  public agInit(params: ICellRendererParams): void {
    this.params = params;
    this.isPrimary = params.value;
    this.title = params.data.title;
  }
}
