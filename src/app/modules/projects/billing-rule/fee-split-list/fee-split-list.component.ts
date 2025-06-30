import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { CommonHelper, StringHelper } from '@app/helpers';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { FeeSplit } from '@app/models/billing-rule/fee-split';
import { GridId, BillToEnum } from '@app/models/enums';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { DropdownEditorRendererComponent } from '@app/modules/shared/_renderers/dropdown-editor-renderer/dropdown-editor-renderer.component';
import { TextboxEditorRendererComponent, TextboxEditorRendererDataType } from '@app/modules/shared/_renderers/textbox-editor-renderer/textbox-editor-renderer.component';
import { Store } from '@ngrx/store';
import { CellValueChangedEvent, GridOptions } from 'ag-grid-community';
import * as rootSelectors from '@app/state/index';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import * as rootActions from '@app/state/root.actions';
import * as sharedActions from '@app/modules/shared/state/entity-selection-modal/actions';
import { first, takeUntil } from 'rxjs/operators';
import { IdValue, Org } from '@app/models';
import { OrganizationSelectionModalComponent } from '@app/modules/shared/entity-selection-modal/organization-selection-modal.component';
import { ModalEditorRendererComponent } from '@app/modules/shared/_renderers/modal-editor-renderer/modal-editor-renderer.component';
import { Subject } from 'rxjs';
import { FeeSplitListActionsRendererComponent } from './fee-split-list-actions-renderer/fee-split-list-actions-renderer.component';

@Component({
  selector: 'app-fee-split-list',
  templateUrl: './fee-split-list.component.html',
  styleUrls: ['./fee-split-list.component.scss'],
})
export class FeeSplitListComponent extends ListView implements OnInit, OnChanges, OnDestroy {
  @Input() defaultOrg: Org;
  @Input() canEdit: boolean;
  @Input() isFeeSplitted: boolean;
  @Input() feeSplits: FeeSplit[] = [];
  @Output() feeSplitsChange = new EventEmitter<FeeSplit[]>();

  public gridId: GridId = GridId.BillingRulesFeeSplits;
  public errorMessage: string = null;
  public billToOptions: IdValue[] = [];

  public readonly billToOptions$ = this.store.select(rootSelectors.billToOptions);
  public readonly ngUnsubscribe$ = new Subject<void>();

  constructor(
    private store: Store<any>,
    protected readonly router: Router,
    protected readonly elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.store.dispatch(rootActions.GetBillToOptions());

    this.billToOptions$
      .pipe(
        first(opts => !!opts && !!opts.length),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(opts => {
        this.billToOptions = opts;
      });

    if (!this.feeSplits.length) {
      this.onAdd(this.defaultOrg);
    }

    this.validate();
  }

  public onAdd(defaultOrg: Org = null): void {
    const updatedValues = [...this.feeSplits, {
      id: CommonHelper.createEntityUniqueId(),
      feePercentage: !this.feeSplits.length ? 1 : null,
      org: defaultOrg ?? null,
      orgName: defaultOrg?.name ?? null,
      billTo: new IdValue(BillToEnum.ClaimantSettlement, ''),
    }];

    this.feeSplitsChange.emit(updatedValues);
    this.validate();
  }

  public get isValid(): boolean {
    return !this.errorMessage;
  }

  private validate(): void {
    if (!this.isPopulated()) {
      this.errorMessage = 'Fee split organizations and percentages are required';
    } else if (!this.hasValidPercentageSum()) {
      this.errorMessage = 'Fee split percentages must equal 100%';
    } else {
      this.errorMessage = null;
    }
  }

  private isPopulated(): boolean {
    const valid = this.feeSplits
      && this.feeSplits.length
      && this.feeSplits.every((f: FeeSplit) => f.feePercentage && f.org);
    return valid;
  }

  private hasValidPercentageSum(): boolean {
    let percentageSum = 0;

    for (const fs of this.feeSplits) {
      percentageSum += fs.feePercentage * 100;
    }

    return percentageSum.toFixed(2) === '100.00';
  }

  public readonly gridOptions: GridOptions = {
    animateRows: false,
    columnDefs: [
      {
        headerName: 'Organization Name',
        field: 'org',
        minWidth: 180,
        editable: () => this.canEdit,
        cellRendererSelector: params => {
          const modalComponent = OrganizationSelectionModalComponent;
          return AGGridHelper.getModalRenderer({
            modalComponent,
            modalConfig: {
              initialState: {
                isActiveDisplayed: true,
                gridDataFetcher: (parameters: IServerSideGetRowsParamsExtended) => this.store.dispatch(sharedActions.SearchOrganizations({ params: parameters })),
              },
              class: 'entity-selection-modal',
            },
            selectedId: params.value,
            displayedField: 'orgName',
            placeholder: 'Select Organization',
          });
        },
      },
      {
        headerName: 'Bill To',
        field: 'billTo.id',
        sortable: true,
        editable: () => this.canEdit,
        cellClass: () => this.getEditableClass(),
        cellRendererSelector: params => (this.canEdit
          ? AGGridHelper.getDropdownRenderer({
            values: this.billToOptions,
            value: params.value,
            placeholder: 'Bill To',
            disabledPlaceholder: true,
          })
          : AGGridHelper.getTextBoxRenderer({
            value: this.billToOptions?.find(value => value.id === params.value)?.name,
            type: TextboxEditorRendererDataType.Text,
          })),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Percentage',
        field: 'feePercentage',
        sortable: true,
        editable: () => this.canEdit && this.isFeeSplitted,
        cellClass: () => this.getEditableClass(),
        cellRendererSelector: params => AGGridHelper.getTextBoxRenderer({
          value: params.value,
          type: TextboxEditorRendererDataType.Percentage,
          decimalsCount: 3,
        }),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      AGGridHelper.getActionsColumn({ deleteHandler: this.onDeleteHandler.bind(this), hidden: this.isDeleteButtonHidden.bind(this) }),
    ],
    suppressClickEdit: true,
    suppressRowClickSelection: true,
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    onCellValueChanged: this.onCellValueChanged.bind(this),
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      suppressKeyboardEvent: this.suppressDefaultKeyboardKeys.bind(this),
    },
    components: {
      buttonRenderer: FeeSplitListActionsRendererComponent,
      textBoxRenderer: TextboxEditorRendererComponent,
      dropdownRenderer: DropdownEditorRendererComponent,
      modalRenderer: ModalEditorRendererComponent,
    },
  } as GridOptions;

  ngOnChanges(changes: SimpleChanges): void {
    const { feeSplits, isFeeSplitted, defaultOrg } = this;
    const stateChanges = changes[CommonHelper.nameOf({ feeSplits })];
    const splittedChanges = changes[CommonHelper.nameOf({ isFeeSplitted })];

    this.toggleActionsColumn(!this.canEdit);

    if (feeSplits && stateChanges && this.gridApi) {
      this.gridApi.setGridOption('rowData', this.feeSplits);
    }

    if (feeSplits) {
      this.validate();
    }

    if (isFeeSplitted && splittedChanges && this.gridApi) {
      this.gridApi.redrawRows();
    }

    if (defaultOrg && !feeSplits[0]?.org) {
      this.setDefaultOrg(defaultOrg);
    }
  }

  public gridReady(gridApi): void {
    this.gridApi = gridApi;
    this.gridApi.setGridOption('rowData', this.feeSplits);
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;
  }

  private onCellValueChanged(event: CellValueChangedEvent): void {
    const updatedValues = [...this.feeSplits];
    const rowData = event.data;
    const colId = event.column.getColId();
    const targetItemIndex = event.rowIndex;

    switch (colId) {
      case 'org':
      {
        updatedValues[targetItemIndex].org = new IdValue(StringHelper.parseInt(rowData.org), rowData.orgName);
        updatedValues[targetItemIndex].orgName = rowData.orgName;
        break;
      }
      case 'billTo.id':
      {
        updatedValues[targetItemIndex].billTo = { ...rowData.billTo };
        break;
      }
      case 'feePercentage':
      {
        updatedValues[targetItemIndex].feePercentage = rowData.feePercentage;
        break;
      }
    }

    this.feeSplitsChange.emit(updatedValues);
    this.validate();
  }

  private onDeleteHandler(params): void {
    const items = this.feeSplits.filter(
      (item: FeeSplit) => item.id !== params?.data?.id,
    );
    this.feeSplitsChange.emit(items);
  }

  private setDefaultOrg(defaultOrg: Org): void {
    const [defaultSplit, ...otherSplits] = this.feeSplits;
    const updatedDefaultSplit = {
      ...defaultSplit,
      org: defaultOrg ?? null,
      orgName: defaultOrg?.name ?? null,
    };

    this.feeSplitsChange.emit([
      updatedDefaultSplit,
      ...otherSplits,
    ]);
  }

  private isDeleteButtonHidden(): boolean {
    return this.canEdit && this.isFeeSplitted;
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
