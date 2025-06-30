import { Component } from '@angular/core';
import { KeyCodes } from '@app/models/enums/keycodes.enum';
import { EditorRendererBase } from '../_base/editor-renderer-base';

@Component({
  selector: 'app-checkbox-editor-renderer',
  templateUrl: './checkbox-editor-renderer.component.html',
  styleUrls: ['./checkbox-editor-renderer.component.scss'],
})
export class CheckboxEditorRendererComponent extends EditorRendererBase<boolean> {
  onChange() {
    this.value = !this.value;
    this.params.node.setDataValue(this.colId, this.value);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.code === KeyCodes.Enter || event.code === KeyCodes.Space) {
      this.onChange();
    }
  }
}
