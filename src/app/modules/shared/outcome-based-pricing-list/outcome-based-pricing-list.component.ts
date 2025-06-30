import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { Store } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { AppState } from '@app/modules/projects/state';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import { DecimalPipe } from '@angular/common';
import { ModalService, PermissionService } from '@app/services';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { OutcomeBasedPricing } from '@app/models/billing-rule/outcome-based-pricing';
import { CommonHelper } from '@app/helpers';
import { ObpDetailsModal } from './details-modal/obp-details-modal.component';
import { BrtOutcomeBasedPricingCellRendererComponent } from './renderers/outcome-based-pricing-cell-renderer/outcome-based-pricing-cell-renderer.component';
import { BrtServicesCellRendererComponent } from './renderers/services-cell-renderer/services-cell-renderer.component';
import { EditOutcomeBasedPricingModal } from './edit-outcome-based-pricing-modal/edit-outcome-based-pricing-modal.component';
import { OutcomeBasedPricingModalComponent } from './outcome-based-pricing-modal/outcome-based-pricing-modal.component';

@Component({
  selector: 'app-outcome-based-pricing-list',
  templateUrl: './outcome-based-pricing-list.component.html',
  styleUrls: ['./outcome-based-pricing-list.component.scss'],
})
export class OutcomeBasedPricingListComponent extends ListView implements OnInit, OnChanges {
  @Input() public outcomeBasePricingList: any[];
  @Input() public tortId: number;
  @Input() public canEdit: boolean = false;
  @Output() public outcomeBasePricingListChange = new EventEmitter<any[]>();

  public readonly gridId: GridId = GridId.OutcomeBasedPricingList;

  public actionBarActionHandlers: ActionHandlersMap = {
    new: {
      callback: () => this.onAddOutcomeBasedPricing(),
      permissions: PermissionService.create(PermissionTypeEnum.BillingRuleTemplate, PermissionActionTypeEnum.Create),
    },
  };

  public gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Scenario',
        field: 'scenario.name',
        sortable: true,
        resizable: true,
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Price',
        field: 'price',
        sortable: true,
        resizable: true,
        valueFormatter: data => (data.data.variablePricingApplies ? 'Variable Pricing Applies' : (data.data.priceType === 1 ? '$' : '') + (data.value || 0) + (data.data.priceType === 2 ? '%' : '')),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Variable Pricing Type',
        field: 'variablePricingType.name',
        sortable: true,
        minWidth: 150,
        width: 150,
        resizable: true,
      },
      {
        headerName: 'Default Price',
        field: 'details.defaultPrice',
        sortable: true,
        resizable: true,
        valueFormatter: data => (data.value ? (data.data.details.defaultPriceType === 1 ? '$' : '') + data.value + (data.data.details.defaultPriceType === 2 ? '%' : '') : '-'),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: '',
        colId: 'additionalDetails',
        valueFormatter: data => this.getValueFormatterForDetails(data),
        onCellClicked: event => {
          if (this.getValueFormatterForDetails(event).length > 0) {
            this.modalService.show(ObpDetailsModal, { initialState: { details: event.data.details } });
          }
        },
        cellStyle: { color: '#1774de', cursor: 'pointer', 'text-decoration-line': 'underline' },
        sortable: true,
        resizable: true,
        ...AGGridHelper.nameColumnDefaultParams,
      },
      AGGridHelper.getActionsColumn({
        editHandler: this.onEditOutcomeBasedPricing.bind(this),
        deleteHandler: this.onDelete.bind(this),
        hidden: this.isActionButtonsHidden.bind(this),
      }, 120, true),
    ],
    animateRows: false,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    components: {
      buttonRenderer: BrtOutcomeBasedPricingCellRendererComponent,
      servicesRenderer: BrtServicesCellRendererComponent,
    },
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  constructor(
    private readonly store: Store<AppState>,
    protected readonly router: Router,
    protected readonly elementRef: ElementRef,
    protected readonly decimalPipe: DecimalPipe,
    private modalService: ModalService,
    private permissionService: PermissionService,
  ) {
    super(router, elementRef);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { outcomeBasePricingList } = this;
    const stateChanges = changes[CommonHelper.nameOf({ outcomeBasePricingList })];

    if (outcomeBasePricingList && stateChanges && this.gridApi) {
      const hideId = outcomeBasePricingList[0]?.id === 0;
      const columns = this.gridApi.getColumnDefs();

      this.gridApi.setGridOption('columnDefs', columns.map(col => {
        if (col.headerName === 'ID') { return { ...col, hide: hideId }; }
        return col;
      }));

      this.gridApi.setGridOption('rowData', this.outcomeBasePricingList);
    }

    this.toggleActionsColumn(!this.canEdit);
  }

  public ngOnInit(): void {
  }

  public gridReady(gridApi): void {
    this.gridApi = gridApi;
    this.gridApi.setGridOption('rowData', this.outcomeBasePricingList);
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;
  }

  public onAddOutcomeBasedPricing(): void {
    this.modalService.show(OutcomeBasedPricingModalComponent, {
      class: 'edit-outcome-based-pricing-modal',
      initialState: {
        tortId: this.tortId,
        addHandler: (obp: OutcomeBasedPricing) => {
          if (!obp?.id) {
            obp.id = CommonHelper.createEntityUniqueId();
          }
          const newVal = [...this.outcomeBasePricingList, obp];
          this.outcomeBasePricingListChange.emit(newVal);
        },
      },
    });
  }

  public onEditOutcomeBasedPricing(data: any): void {
    this.modalService.show(EditOutcomeBasedPricingModal, {
      class: 'edit-outcome-based-pricing-modal',
      initialState: {
        pricing: this.outcomeBasePricingList.find(itm => itm.id === data?.data?.id),
        tortId: this.tortId,
        addHandler: (obp: OutcomeBasedPricing) => {
          const newVal = [...this.outcomeBasePricingList];
          const foundIndex = this.outcomeBasePricingList.findIndex(itm => itm.id === data?.data?.id);
          newVal[foundIndex] = obp;
          this.outcomeBasePricingListChange.emit(newVal);
        },
      },
    });
  }

  public onDeleteOutcomeBasedPricing(params: any): void {
    const newVal = this.outcomeBasePricingList.filter(
      (item: any) => item.id !== params?.data?.id,
    );
    this.outcomeBasePricingListChange.emit([...newVal]);
  }

  private isActionButtonsHidden(): boolean {
    return this.canEdit;
  }

  private onDelete(param: any): void {
    this.onDeleteOutcomeBasedPricing(param);
  }

  private getValueFormatterForDetails(param: any) {
    return param.data.variablePricingApplies
          && (param.data.details.percentageOfSavingsPricings.length
            + param.data.details.slidingScalePricings.length
            + param.data.details.tieredPricings.length) > 0 ? 'Details' : '';
  }

  private onRowDoubleClicked(param: any): void {
    if (this.permissionService.canEdit(PermissionTypeEnum.BillingRuleTemplate) && this.canEdit) {
      this.onEditOutcomeBasedPricing(param);
    }
  }
}
