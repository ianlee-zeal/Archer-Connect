import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

export interface ITextWithIconRendererParams {
  text: string,
  icon?: string;
  title?: string;
  textFirst?: boolean;
  faIconClass?: string;
}

@Component({
  selector: 'app-text-with-icon-renderer',
  templateUrl: './text-with-icon-renderer.component.html',
  styleUrls: ['./text-with-icon-renderer.component.scss'],
})
export class TextWithIconRendererComponent implements ICellRendererAngularComp {
  public params: ICellRendererParams;
  public value: string;
  public data: ITextWithIconRendererParams;

  public refresh(): boolean {
    return true;
  }

  public agInit(params: ICellRendererParams & ITextWithIconRendererParams): void {
    this.params = params as ICellRendererParams;
    this.value = params.value;
    this.data = params as ITextWithIconRendererParams;
  }
}
