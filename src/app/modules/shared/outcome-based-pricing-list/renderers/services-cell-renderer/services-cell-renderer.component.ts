import { Component } from '@angular/core';
import { BillingRuleTemplate } from '@app/models/billing-rule/billing-rule-template';
import { BillingRuleTemplateRelatedService } from '@app/models/billing-rule/billing-rule-template-service';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-brt-services-cell-renderer',
  templateUrl: './services-cell-renderer.component.html',
})
export class BrtServicesCellRendererComponent implements ICellRendererAngularComp {
  public params: any;
  public services: BillingRuleTemplateRelatedService[] = [];

  refresh(): boolean {
    return true;
  }

  agInit(params: any): void {
    this.params = params;
    const brt: BillingRuleTemplate = params.data;
    this.services = brt.relatedServices;
  }
}
