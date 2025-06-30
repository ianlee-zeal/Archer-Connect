import { Component } from '@angular/core';

import { CommonHelper } from '@app/helpers';
import { ICellRendererParams } from 'ag-grid-community';
import { EditorRendererBase } from '../_base/editor-renderer-base';

/**
 * Defines parameters for range renderer
 *
 * @export
 * @interface IRangeEditorRendererParams
 */
export interface IRangeEditorRendererParams {
  lowerValue: string,
  upperValue: string,
}

/**
 * Component for rendering of range for provided data type in grid.
 *
 * In readonly mode shows formatted range values.
 * In editable mode shows inputs for value editing.
 *
 * @export
 * @class RangeEditorRendererComponent
 * @extends {EditorRendererBase<string>}
 */
@Component({
  selector: 'app-range-editor-renderer',
  templateUrl: './range-editor-renderer.component.html',
  styleUrls: ['./range-editor-renderer.component.scss'],
})
export class RangeEditorRendererComponent extends EditorRendererBase<string> {
  /**
   * Values
   *
   * @memberof RangeEditorRendererComponent
   */
  lowerValue: string;
  upperValue: string;

  /**
   * Current range parameters
   *
   * @readonly
   * @private
   * @type {IRangeEditorRendererParams}
   * @memberof RangeEditorRendererComponent
   */
  private get rangeParams(): IRangeEditorRendererParams {
    return this.params as unknown as IRangeEditorRendererParams;
  }

  /**
   * Change event handler for input element
   *
   * @param {InputEvent} input - input event
   * @memberof RangeEditorRendererComponent
   */
  onChange(input: InputEvent) {
    const target = (input.target as HTMLInputElement);
    if (target.dataset.value === 'lowerValue') {
      this.lowerValue = target.value;
    } else {
      this.upperValue = target.value;
    }

    this.params.node.setDataValue(this.colId, `${this.lowerValue}-${this.upperValue}`);
  }

  /**
   * Called by AG Grid during cell initialization
   *
   * @param {ICellRendererParams} params
   * @memberof RangeEditorRendererComponent
   */
  agInit(params: ICellRendererParams): void {
    super.agInit(params);

    this.lowerValue = this.rangeParams.lowerValue;
    this.upperValue = this.rangeParams.upperValue;

    if (this.editable && !CommonHelper.isNullOrUndefined(this.lowerValue)) {
      this.lowerValue = parseFloat(this.lowerValue).toFixed(2);
    }

    if (this.editable && !CommonHelper.isNullOrUndefined(this.upperValue)) {
      this.upperValue = parseFloat(this.upperValue).toFixed(2);
    }
  }
}
