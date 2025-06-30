import { Component } from '@angular/core';
import { GridActionsRendererComponent } from '@app/entities';

@Component({
  selector: 'app-fee-split-list-actions-renderer',
  templateUrl: './fee-split-list-actions-renderer.component.html',
  styleUrls: ['./fee-split-list-actions-renderer.component.scss'],
})
export class FeeSplitListActionsRendererComponent extends GridActionsRendererComponent<any> {
  onDelete() {
    this.params.deleteHandler(this.params);
  }
}
