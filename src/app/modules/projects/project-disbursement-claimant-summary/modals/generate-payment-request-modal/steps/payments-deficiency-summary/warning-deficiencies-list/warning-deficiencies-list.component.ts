import { Component } from '@angular/core';

import { Store } from '@ngrx/store';

import { GridId } from '@app/models/enums/grid-id.enum';
import * as fromShared from '@app/modules/shared/state';
import * as projectSelectors from '@app/modules/projects/state/selectors';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { TextboxEditorRendererComponent, TextboxEditorRendererDataType } from '@app/modules/shared/_renderers/textbox-editor-renderer/textbox-editor-renderer.component';
import { CellValueChangedEvent, SuppressKeyboardEventParams } from 'ag-grid-community';
import { filter, map, takeUntil } from 'rxjs/operators';
import { RequestReviewOption } from '@app/models/payment-request/payment-request-review-result';
import { GridHeaderValidationStatusComponent, IGridHeaderValidationStatusParams } from '@app/modules/shared/grid/grid-header-validation-status/grid-header-validation-status.component';
import { ValidationStatus } from '@app/models/enums';
import { DeficienciesListBase } from '@app/modules/shared/_abstractions/deficiencies-list.base';
import { KeyCodes } from '@app/models/enums/keycodes.enum';

@Component({
  selector: 'app-warning-deficiencies-list',
  templateUrl: './warning-deficiencies-list.component.html',
})
export class WarningDeficienciesListComponent extends DeficienciesListBase {

  private readonly defaultAgGridKeysForEditing: Set<string> = new Set([
    KeyCodes.Backspace,
    KeyCodes.Delete,
    KeyCodes.F2,
    KeyCodes.Enter,
    KeyCodes.NumpadEnter,
    KeyCodes.ArrowDown,
    KeyCodes.ArrowUp,
    KeyCodes.ArrowLeft,
    KeyCodes.ArrowRight,
    KeyCodes.ShiftLeft,
    KeyCodes.ShiftRight,
    KeyCodes.Home,
    KeyCodes.End,
  ]);

  public readonly gridId: GridId = GridId.GeneratePaymentsWarningDeficiencies;
  readonly deficiencies$ = this.store.select(projectSelectors.paymentRequestWarningDeficiencies);

  private warningDeficiencies: RequestReviewOption[];

  constructor(
    private store: Store<fromShared.AppState>,
  ) {
    super();
  }

  ngOnInit() {
    this.deficiencies$.pipe(
      filter(data => data !== null),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(data => {
      this.warningDeficiencies = data;
    });

  }

  public gridOptions = {
    ...this.gridOptions,
    columnDefs: [
      ...this.gridOptions.columnDefs,
      {
        headerName: 'Reason for by-passing Deficiency',
        field: 'bypass',
        cellRendererSelector: params => AGGridHelper.getTextBoxRenderer({
          value: params.value,
          type: TextboxEditorRendererDataType.Text,
          maxLength: 500
        }),
        ...AGGridHelper.nameColumnDefaultParams,
        editable: () => true,
        cellClass: () => 'ag-cell-editable',
        headerComponent: GridHeaderValidationStatusComponent,
        headerComponentParams: this.getValidationParams(this.byPassIsValid),

      },
    ],
    components: {
      textBoxRenderer: TextboxEditorRendererComponent,
    },
    onCellValueChanged: this.onCellValueChanged.bind(this),
    suppressClickEdit: true,
    animateRows: false,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      suppressKeyboardEvent: this.suppressDefaultKeyboardKeys.bind(this),
    },
    pagination: false,
  };

  private onCellValueChanged(event: CellValueChangedEvent): void {
    const rowData = event.data as RequestReviewOption;
    this.warningDeficiencies = this.warningDeficiencies.map(item => {
      if (item.id === rowData.id) {
        return { ...item, bypass: rowData.bypass };
      }
      return item;
    });
    this.gridApi.refreshHeader();
  }

  private getValidationParams(isValid: ((item: RequestReviewOption) => boolean)): IGridHeaderValidationStatusParams {
    return {
      getStatus: () => this.deficiencies$.pipe(
        filter(item => !!item),
        takeUntil(this.ngUnsubscribe$),
        map(items => (items.every(item => isValid(item)) ? ValidationStatus.Ok : ValidationStatus.Error)),
      ),
    };
  }

  private byPassIsValid(item: RequestReviewOption): boolean {
    return !!item.bypass?.trim();
  }

  private suppressDefaultKeyboardKeys(params: SuppressKeyboardEventParams) {
    return this.defaultAgGridKeysForEditing.has(params.event.code);
  }

}
