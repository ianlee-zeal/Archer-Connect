import { Component } from '@angular/core';
import { EditableCallbackParams, ICellRendererParams } from 'ag-grid-community';
import { ModalService } from '@app/services';
import { ModalOptions } from 'ngx-bootstrap/modal';
import { IdValue } from '../../../../models/idValue';
import { EditorRendererBase } from '../_base/editor-renderer-base';

/**
 * Defines parameters for modal renderer component
 *
 * @export
 * @interface IModalEditorRendererParams
 */
export interface IModalEditorRendererParams {

  /**
    * Defines currently selected value
    *
    * @type {string}
    * @memberof IModalEditorRendererParams
    */
  selectedId: string;

  /**
    * Defines field that provides displayed value
    *
    * @type {string}
    * @memberof IModalEditorRendererParams
    */
  displayedField: string;

  /**
   * Gets modal window to display
   *
   * @type {*}
   * @memberof IModalEditorRendererParams
   */
  modalComponent: any;

  /**
    * Gets modal window to display
    *
    * @type {ModalOptions}
    * @memberof IModalEditorRendererParams
    */
  modalConfig: ModalOptions;

  /**
   * Defines placeholder text (default item with null value in the modal)
   *
   * @type {string}
   * @memberof IModalEditorRendererParams
   */
  placeholder: string;

  additionalInfoField?: string;
  convertToAdditionalInfo?: (entity: any) => any;
}

/**
 * Component for rendering of the modal element for the AG grid cell.
 *
 * In readonly mode shows text of the selected item.
 * In editable mode shows modal component.
 *
 * @export
 * @class ModalEditorRendererComponent
 * @extends {EditorRendererBase<string>}
 */
@Component({
  selector: 'app-modal-editor-renderer',
  templateUrl: './modal-editor-renderer.component.html',
  styleUrls: ['./modal-editor-renderer.component.scss'],
})
export class ModalEditorRendererComponent extends EditorRendererBase<string> {
  /**
    * Defines currently selected value
    *
    * @type {string | number}
    * @memberof ModalEditorRendererComponent
    */
  selectedId: number | string;

  /**
    * Defines field that provides displayed value
    *
    * @type {string}
    * @memberof ModalEditorRendererComponent
    */
  displayedField: string;

  /**
    * Defines displayed value
    *
    * @type {string}
    * @memberof ModalEditorRendererComponent
    */
  displayedValue: string;

  /**
    * Defines field that provides additional info value
    *
    * @type {string}
    * @memberof ModalEditorRendererComponent
    */
  additionalInfoField?: string;

  /**
      * Defines additional info value
      *
      * @type {string}
      * @memberof ModalEditorRendererComponent
      */
  additionalInfoValue?: any;

  convertToAdditionalInfo?: (entity: any) => any;

  /**
   * Gets modal window to display
   *
   * @type {*}
   * @memberof ModalEditorRendererComponent
   */
  modalComponent: any;

  /**
   * Gets modal window to display
   *
   * @type {ModalOptions}
   * @memberof ModalEditorRendererComponent
   */
  modalConfig: ModalOptions;

  /**
   * Gets or sets placeholder text (default item with null value in the modal)
   *
   * @type {string}
   * @memberof ModalEditorRendererComponent
   */
  placeholder: string;

  /**
   * Creates an instance of ModalEditorRendererComponent.
   * @param {ModalService} modalService
   * @memberof ModalEditorRendererComponent
   */
  constructor(private readonly modalService: ModalService) {
    super();
  }

  /**
   * Change event handler
   *
   * @memberof ModalEditorRendererComponent
   */
  onChange() {
    this.params.node.setDataValue(this.colId, this.value);
    this.params.node.data[this.displayedField] = this.displayedValue;
    if (this.additionalInfoField) {
      this.params.node.data[this.additionalInfoField] = this.additionalInfoValue;
    }
    this.params.api.redrawRows({ rowNodes: [this.params.node] });
  }

  agInit(params: ICellRendererParams): void {
    this.params = params;

    const modalParams = this.params as unknown as IModalEditorRendererParams;
    this.value = modalParams.selectedId;
    this.displayedField = modalParams.displayedField;
    this.displayedValue = this.params.data[this.displayedField];
    this.modalComponent = modalParams.modalComponent;
    this.modalConfig = modalParams.modalConfig;
    this.placeholder = modalParams.placeholder;
    this.additionalInfoField = modalParams.additionalInfoField;
    this.additionalInfoValue = this.params.data[this.additionalInfoValue];
    this.convertToAdditionalInfo = modalParams.convertToAdditionalInfo;

    const editable = params.colDef.editable as ((params: EditableCallbackParams) => boolean);
    if (editable) {
      this.editable = editable(this.params as EditableCallbackParams);
    }
  }

  public onOpenModal(): void {
    this.modalService.show(this.modalComponent, {
      ...this.modalConfig,
      initialState: {
        ...this.modalConfig.initialState,
        onEntitySelected: (entity: IdValue) => this.entitySelected(entity),
      },
    });
  }

  private entitySelected(entity: any) {
    this.value = entity.id.toString();
    this.displayedValue = entity.name || entity?.person?.fullName;
    if (this.convertToAdditionalInfo) {
      this.additionalInfoValue = this.convertToAdditionalInfo(entity);
    }
    this.onChange();
  }

  onClear(event: MouseEvent) {
    event.stopPropagation();
    this.value = null;
    this.displayedValue = null;
    this.additionalInfoValue = null;
    this.onChange();
  }
}
