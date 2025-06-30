/* eslint-disable @typescript-eslint/dot-notation */
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { Component } from '@angular/core';
import { EditableCallbackParams, ICellRendererParams } from 'ag-grid-community';
import { EditorRendererBase } from '../_base/editor-renderer-base';

export interface IMultiselectDropdownEditorRendererParams {
  options: SelectOption[];

  values: any[];

  placeholder: string;

  isValid?: (data: any) => boolean;
  isWide?: boolean;
}

@Component({
  selector: 'app-multiselect-dropdown-editor-renderer',
  templateUrl: './multiselect-dropdown-editor-renderer.component.html',
  styleUrls: ['./multiselect-dropdown-editor-renderer.component.scss'],
})
export class MultiselectDropdownEditorRendererComponent extends EditorRendererBase<string> {
  values: any[];

  options: SelectOption[];

  placeholder: string;

  isValid: (data: any) => boolean;

  isWide?: boolean = false;

  get displayValue(): string {
    const names = [];
    if (this.values) {
      this.values.forEach(val => {
        const opt = this.options.find(o => o.id === val);
        names.push(opt?.name);
      });
    }
    return names.join(', ');
  }

  get valuesCount(): number {
    return this.values?.length || 0;
  }

  onChange(values: any) {
    this.values = values;
    this.params.node.setDataValue(this.colId, values);
    this.params.api.redrawRows({ rowNodes: [this.params.node] });
  }

  agInit(params: ICellRendererParams): void {
    this.params = params;

    const dropdownParams = this.params as unknown as IMultiselectDropdownEditorRendererParams;
    this.values = dropdownParams.values;
    this.options = dropdownParams.options;
    this.placeholder = dropdownParams.placeholder;
    this.isValid = dropdownParams.isValid || (() => true);
    this.isWide = dropdownParams.isWide;

    // if (this.options && this.options.length > 0) {
    //  this.selectedValue = this.options.find(v => v.id === this.value);
    // }

    const editable = params.colDef.editable as ((params: EditableCallbackParams) => boolean);
    if (editable) {
      this.editable = editable(this.params as EditableCallbackParams);
    }
  }
}
