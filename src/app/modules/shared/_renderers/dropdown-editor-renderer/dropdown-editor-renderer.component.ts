/* eslint-disable @typescript-eslint/dot-notation */
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { Component } from '@angular/core';
import { EditableCallbackParams, ICellRendererParams } from 'ag-grid-community';
import { EditorRendererBase } from '../_base/editor-renderer-base';

/**
 * Defines parameters for dropdown renderer component
 *
 * @export
 * @interface IDropdownEditorRendererParams
 */
export interface IDropdownEditorRendererParams {
  /**
   * Defines list of values available for selection in the dropdown
   *
   * @type {SelectOption[]}
   * @memberof IDropdownEditorRendererParams
   */
  values: SelectOption[];

  /**
   * Defines currently selected value
   *
   * @type {*}
   * @memberof IDropdownEditorRendererParams
   */
  value: any;

  /**
   * Defines placeholder text (default item with null value in the dropdown)
   *
   * @type {string}
   * @memberof IDropdownEditorRendererParams
   */
  placeholder: string;

  /**
   * Defines disabled flag for placeholder text (default item with null value in the dropdown)
   *
   * @type {string}
   * @memberof IDropdownEditorRendererParams
   */
  disabledPlaceholder: boolean;

  /**
   * When provided, is displayed inside of the select dropdown, but is not present in the options list
   *
   * @type {SelectOption}
   * @memberof IDropdownEditorRendererParams
   */
  defaultOption?: SelectOption;

  /**
   * Defines with primary tag
   *
   * @type {boolean}
   * @memberof IDropdownEditorRendererParams
   */
  withTag?: boolean;

  /**
   * Defines with grouped select
   *
   * @type {boolean}
   * @memberof IDropdownEditorRendererParams
   */
  groups?: string[];

  /**
   * Defines showing primary tag
   *
   * @type {boolean}
   * @memberof IDropdownEditorRendererParams
   */
  isPrimary?: (data: any) => boolean;

  isRequired?: () => boolean;

  isValid?: (data: any) => boolean;
}

/**
 * Component for rendering of the dropdown element for the AG grid cell.
 *
 * In readonly mode shows text of the selected item.
 * In editable mode shows dropdown component.
 *
 * @export
 * @class DropdownEditorRendererComponent
 * @extends {EditorRendererBase<string>}
 */
@Component({
  selector: 'app-dropdown-editor-renderer',
  templateUrl: './dropdown-editor-renderer.component.html',
  styleUrls: ['./dropdown-editor-renderer.component.scss'],
})
export class DropdownEditorRendererComponent extends EditorRendererBase<string> {
  /**
   * Gets or sets selected value
   *
   * @type {SelectOption}
   * @memberof DropdownEditorRendererComponent
   */
  selectedValue: SelectOption;

  /**
   * Gets or sets an array of available values for the dropdown
   *
   * @type {SelectOption[]}
   * @memberof DropdownEditorRendererComponent
   */
  values: SelectOption[];

  /**
   * Gets or sets placeholder text (default item with null value in the dropdown)
   *
   * @type {string}
   * @memberof DropdownEditorRendererComponent
   */
  placeholder: string;

  /**
   * Gets or sets disable flag for placeholder text
   * @type {boolean}
   * @memberof DropdownEditorRendererComponent
   */
  disabledPlaceholder: boolean;

  defaultOption: SelectOption;

  /**
   * Defines whether a tag (Primary or Invalid) will be used
   *
   * @type {boolean}
   * @memberof IDropdownEditorRendererParams
   */
  withTag?: boolean;

  /**
   * Defines with grouped select will be used
   *
   * @type {boolean}
   * @memberof IDropdownEditorRendererParams
   */
  groups?: string[];

  /**
   * Defines showing primary tag
   *
   * @type {boolean}
   * @memberof IDropdownEditorRendererParams
   */
  isPrimary: (data: any) => boolean;

  isValid: (data: any) => boolean;

  isRequired: () => boolean;

  /**
   * Change event handler
   *
   * @memberof DropdownEditorRendererComponent
   */
  onChange(): void {
    this.params.node.setDataValue(this.colId, this.value);
    this.params.api.redrawRows({ rowNodes: [this.params.node] });
  }

  agInit(params: ICellRendererParams): void {
    this.params = params;

    const dropdownParams = this.params as unknown as IDropdownEditorRendererParams;
    this.value = dropdownParams.value;
    this.values = dropdownParams.values;
    this.placeholder = dropdownParams.placeholder;
    this.disabledPlaceholder = dropdownParams.disabledPlaceholder;
    this.withTag = dropdownParams.withTag;
    this.groups = dropdownParams.groups;
    this.isPrimary = dropdownParams.isPrimary || ((): boolean => false);
    this.defaultOption = dropdownParams.defaultOption;
    this.isValid = dropdownParams.isValid || ((): boolean => true);
    this.isRequired = dropdownParams.isRequired || ((): boolean => false);

    if (this.values && this.values.length > 0) {
      this.selectedValue = this.values.find((v: SelectOption) => v.id === this.value);
    }

    if (!this.selectedValue && this.defaultOption) {
      this.value = this.defaultOption.id as string;
      this.selectedValue = this.defaultOption;
    }

    const editable = params.colDef.editable as ((params: EditableCallbackParams) => boolean);
    if (editable) {
      this.editable = editable(this.params as EditableCallbackParams);
    }
  }

  filteredByGroups(group): SelectOption[] {
    return this.values?.filter((item: SelectOption) => item.group === group);
  }
}
