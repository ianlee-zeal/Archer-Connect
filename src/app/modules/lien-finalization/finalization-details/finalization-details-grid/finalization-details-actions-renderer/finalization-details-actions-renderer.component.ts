import { Component } from '@angular/core';
import { EditorRendererBase } from '@app/modules/shared/_renderers/_base/editor-renderer-base';

@Component({
  selector: 'app-finalization-details-actions-renderer',
  templateUrl: './finalization-details-actions-renderer.component.html',
  styleUrls: ['./finalization-details-actions-renderer.component.scss'],
})
export class FinalizationDetailsActionsRendererComponent extends EditorRendererBase<boolean> {
  public params: any;

  public onChange(): void {
    this.params.onChange(this.params.data);
  }
}
