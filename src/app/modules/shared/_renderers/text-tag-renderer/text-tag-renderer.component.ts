import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

export interface ITextTagRenderer {
  tagType: string;
  tagTitle: string;
}

@Component({
  selector: 'app-text-tag-renderer',
  templateUrl: './text-tag-renderer.component.html',
  styleUrls: ['./text-tag-renderer.component.scss'],
})
export class TextTagRendererComponent implements ICellRendererAngularComp {
  public params: ICellRendererParams;
  public value: string;
  public data: ITextTagRenderer;

  public refresh(): boolean {
    return true;
  }

  public agInit(params: ICellRendererParams & ITextTagRenderer): void {
    this.params = params as ICellRendererParams;
    this.value = params.value;
    this.data = params as ITextTagRenderer;
  }
}
