import { Component } from '@angular/core';
import { GridActionsRendererComponent } from '@app/entities';

@Component({
  selector: 'app-release-packet-actions-renderer',
  templateUrl: './release-packet-actions-renderer.component.html',
  styleUrls: ['./release-packet-actions-renderer.component.scss'],
})
export class ReleasePacketActionsRendererComponent extends GridActionsRendererComponent<any> {
  onDelete() {
    this.params.deleteHandler(this.params);
  }
}
