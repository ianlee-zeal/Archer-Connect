import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { stripHtml } from 'string-strip-html';

@Component({
  selector: 'app-strip-html-renderer',
  templateUrl: './strip-html-renderer.component.html',
})
export class StripHtmlRendererComponent implements ICellRendererAngularComp {
  private params: any;

  public plainText: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public refresh(_params: any): boolean {
    return true;
  }

  public agInit(params: any): void {
    this.params = params;
    this.plainText = stripHtml(params.value || '')?.result;
  }
}
