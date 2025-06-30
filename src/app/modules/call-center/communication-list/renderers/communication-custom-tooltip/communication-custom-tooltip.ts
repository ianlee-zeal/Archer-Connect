import { Component } from '@angular/core';
import { ITooltipAngularComp } from 'ag-grid-angular';
import { StringHelper } from '@app/helpers/string.helper';
import { IconHelper } from '@app/helpers';

@Component({
  selector: 'app-communication-tooltip-component',
  templateUrl: './communication-custom-tooltip.html',
  styleUrls: ['./communication-custom-tooltip.scss'],
})
export class CommunicationCustomTooltip implements ITooltipAngularComp {
  private params: any;
  public items: any;
  public readonly getMimeIconByExtension = IconHelper.getMimeIconByExtension;

  agInit(params): void {
    this.params = params;

    if (params.value && StringHelper.isString(params.value)) {
      this.items = [params.value];
    } else {
      this.items = params.value || [];
    }
  }
}
