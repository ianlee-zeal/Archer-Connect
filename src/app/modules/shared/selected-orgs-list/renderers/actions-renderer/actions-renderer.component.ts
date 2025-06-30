import { Component } from '@angular/core';
import { GridActionsRendererComponent } from '@app/entities';

@Component({
  selector: 'app-selected-org-list-cell-renderer',
  templateUrl: './actions-renderer.component.html',
})
export class SelectedOrgListCellRendererComponent extends GridActionsRendererComponent<any> {

  onDelete() {
    this.params.deleteHandler(this.params);
  }
}
