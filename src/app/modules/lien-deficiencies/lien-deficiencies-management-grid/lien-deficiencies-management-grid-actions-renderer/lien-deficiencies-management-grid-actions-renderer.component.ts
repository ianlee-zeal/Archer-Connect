import { Component } from '@angular/core';
import { EditorRendererBase } from '@app/modules/shared/_renderers/_base/editor-renderer-base';

@Component({
  selector: 'app-lien-deficiencies-management-grid-actions-renderer',
  templateUrl: './lien-deficiencies-management-grid-actions-renderer.component.html',
  styleUrls: ['./lien-deficiencies-management-grid-actions-renderer.component.scss'],
})
export class LienDeficienciesManagementGridActionsRendererComponent extends EditorRendererBase<boolean> {

  public params: any;

  public onChange(): void {
    this.params.onChange(this.params.data);
  }
}
