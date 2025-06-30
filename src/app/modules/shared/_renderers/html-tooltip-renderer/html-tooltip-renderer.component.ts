import { Component } from '@angular/core';
import { ITooltipAngularComp } from 'ag-grid-angular';
import { ITooltipParams } from 'ag-grid-community';
import { AllHtmlEntities } from 'html-entities';

const entities = new AllHtmlEntities();

@Component({
  selector: 'app-html-tooltip-renderer',
  templateUrl: './html-tooltip-renderer.component.html',
  styleUrls: ['./html-tooltip-renderer.component.scss'],
})
export class HtmlTooltipRendererComponent implements ITooltipAngularComp {
  private params: any;
  public html: string;

  public agInit(params: ITooltipParams): void {
    this.params = params;

    if (params.value) {
      this.html = entities.decode(params.value);
    }
  }
}
