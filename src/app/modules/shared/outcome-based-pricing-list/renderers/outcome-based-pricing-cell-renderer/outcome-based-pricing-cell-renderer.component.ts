import { Component } from '@angular/core';
import { GridActionsRendererComponent } from '@app/entities';

@Component({
  selector: 'app-brt-obp-cell-renderer',
  templateUrl: './outcome-based-pricing-cell-renderer.component.html',
})
export class BrtOutcomeBasedPricingCellRendererComponent extends GridActionsRendererComponent<any> {

  onDelete() {
    this.params.deleteHandler(this.params);
  }

  onEdit() {
    this.params.editHandler(this.params);
  }
}
