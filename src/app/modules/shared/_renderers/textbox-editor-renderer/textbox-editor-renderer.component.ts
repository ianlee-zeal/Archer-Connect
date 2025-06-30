import { Component } from '@angular/core';

import { CommonHelper, PercentageHelper } from '@app/helpers';
import { ICellRendererParams } from 'ag-grid-community';
import { EditorRendererBase } from '../_base/editor-renderer-base';

/**
 * Defines data types available for the textbox renderer
 *
 * @export
 * @enum {number}
 */
export enum TextboxEditorRendererDataType {
  Text,
  Decimal,
  Percentage,
}

/**
 * Defines parameters for textbox renderer
 *
 * @export
 * @interface ITextboxEditorRendererParams
 */
export interface ITextboxEditorRendererParams {
  value: string;
  type: TextboxEditorRendererDataType;
  decimalsCount?: number;
  maxLength?: number;
}

/**
 * Component for rendering of textbox for provided data type in grid.
 *
 * In readonly mode shows formatted text value.
 * In editable mode shows input for value editing.
 *
 * @export
 * @class TextboxEditorRendererComponent
 * @extends {EditorRendererBase<string>}
 */
@Component({
  selector: 'app-textbox-editor-renderer',
  templateUrl: './textbox-editor-renderer.component.html',
  styleUrls: ['./textbox-editor-renderer.component.scss'],
})
export class TextboxEditorRendererComponent extends EditorRendererBase<string> {
  private defaultPercentageDecimalsCount = 8;
  private defaultMaxLength = 10000;

  /**
   * Available data types
   *
   * @memberof TextboxEditorRendererComponent
   */
  readonly modes = TextboxEditorRendererDataType;

  /**
   * Gets or sets currently selected data type
   *
   * @type {TextboxEditorRendererDataType}
   * @memberof TextboxEditorRendererComponent
   */
  type: TextboxEditorRendererDataType;

  /**
   * Current textbox parameters
   *
   * @readonly
   * @private
   * @type {ITextboxEditorRendererParams}
   * @memberof TextboxEditorRendererComponent
   */
  private get textBoxParams(): ITextboxEditorRendererParams {
    return this.params as unknown as ITextboxEditorRendererParams;
  }

  /**
   * Decimals count for percentage data type
   *
   * @readonly
   * @type {number}
   * @memberof TextboxEditorRendererComponent
   */
  get percentageDecimalsCount(): number {
    return this.textBoxParams?.decimalsCount || this.defaultPercentageDecimalsCount;
  }

  /**
   * MaxLength for input
   *
   * @readonly
   * @type {number}
   * @memberof TextboxEditorRendererComponent
   */
  get maxLength(): number {
    return this.textBoxParams?.maxLength || this.defaultMaxLength;
  }

  /**
   * Change event handler for input element
   *
   * @param {InputEvent} input - input event
   * @memberof TextboxEditorRendererComponent
   */
  onChange(input: InputEvent): void {
    const value = (input.target as HTMLInputElement).value;

    if (!value && this.type === TextboxEditorRendererDataType.Decimal) {
      this.params.node.setDataValue(this.colId, 0);
      return;
    }
    if (this.type === TextboxEditorRendererDataType.Percentage) {
      const numberValue = CommonHelper.toPercentageNumber(value, this.percentageDecimalsCount + 2);
      this.params.node.setDataValue(this.colId, numberValue);
      return;
    }
    if (this.type === TextboxEditorRendererDataType.Decimal) {
      const numberValue = Number(value);
      this.params.node.setDataValue(this.colId, numberValue);
      return;
    }

    this.params.node.setDataValue(this.colId, value);
  }

  /**
   * Called by AG Grid during cell initialization
   *
   * @param {ICellRendererParams} params
   * @memberof TextboxEditorRendererComponent
   */
  agInit(params: ICellRendererParams): void {
    super.agInit(params);
    this.type = this.textBoxParams.type || TextboxEditorRendererDataType.Text;
    if (this.editable && !CommonHelper.isNullOrUndefined(this.value)) {
      switch (this.type) {
        case TextboxEditorRendererDataType.Percentage: {
          const value = parseFloat(this.value);
          this.value = CommonHelper.fromPercentage(value, this.percentageDecimalsCount);
          break;
        }
        case TextboxEditorRendererDataType.Decimal: {
          this.value = parseFloat(this.value).toFixed(2);
          break;
        }
        default:
          break;
      }
    }
  }

  public getPipedPercent(value: number): string {
    return PercentageHelper.toFractionPercentage(value, 8);
  }
}
