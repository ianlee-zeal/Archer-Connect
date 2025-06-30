import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-line-limited-renderer',
  templateUrl: './line-limited-renderer.component.html',
  styleUrls: ['./line-limited-renderer.component.scss'],
})
export class LineLimitedRendererComponent implements ICellRendererAngularComp {
  private readonly DEFAULT_LINE_CLAMP = 2;
  public params: ICellRendererParams & { lineClamp: number };
  public value: string;
  public lineClamp: number;

  public refresh(): boolean {
    return true;
  }

  public agInit(params: ICellRendererParams & { lineClamp: number }): void {
    this.params = params;
    this.value = params.value;
    this.lineClamp = params.lineClamp || this.DEFAULT_LINE_CLAMP;
  }
}
