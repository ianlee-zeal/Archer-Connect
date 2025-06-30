import { Component } from '@angular/core';
import { BillingRule } from '@app/models/billing-rule/billing-rule';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-br-services-cell-renderer',
  templateUrl: './services-cell-renderer.component.html',
  styleUrls: ['./services-cell-renderer.component.scss'],
})
export class BrServicesCellRendererComponent implements ICellRendererAngularComp {
  public params: any;
  public services = [];

  refresh(): boolean {
    return true;
  }

  agInit(params: any): void {
    const br: BillingRule = params.data;

    this.params = params;
    this.services = br.relatedServices;

    if (params.useShortNames) {
      this.services.sort((a, b) => ((a.productCategory.shortName > b.productCategory.shortName) ? 1 : -1));
    }
  }
}
