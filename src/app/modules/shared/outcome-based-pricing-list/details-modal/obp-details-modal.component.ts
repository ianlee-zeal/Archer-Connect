import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ActionsSubject, Store } from '@ngrx/store';
import { OutcomeBasedPricingDetails } from '@app/models/billing-rule/outcome-based-pricing-details';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { InjuryCategoryTitlePipe } from '@app/modules/shared/_pipes';
import { GridId } from '@app/models/enums/grid-id.enum';
import { GridOptions } from 'ag-grid-community';
import { Router } from '@angular/router';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

@Component({
  selector: 'app-obp-details-modal',
  templateUrl: './obp-details-modal.component.html',
})
export class ObpDetailsModal extends ListView implements OnInit, OnDestroy {
  public gridId: GridId = GridId.ObpDetailsModelList;
  public gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    pagination: false,
    suppressPaginationPanel: false,
  };

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;
  }

  constructor(
    private injuryCategoryTitlePipe: InjuryCategoryTitlePipe,
    public modal: BsModalRef,
    public store: Store<any>,
    public actionsSubj: ActionsSubject,
    protected readonly router: Router,
    protected readonly elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  public details: OutcomeBasedPricingDetails;

  public gridReady(gridApi): void {
    this.gridApi = gridApi;
    this.trySetSlidingPrices();
    this.tryTieredPrices();
    this.tryPercentageOfSavings();
  }

  private trySetSlidingPrices() : void {
    if (this.details.slidingScalePricings.length > 0) {
      this.gridApi.setGridOption('columnDefs',
        [
          {
            headerName: 'Settlement Amount',
            field: 'settlementAmount',
            valueFormatter: data => `$${data.data.lowerValue ?? 0} – $${data.data.upperValue ?? 0}`,
            sortable: false,
            resizable: false,
            ...AGGridHelper.nameColumnDefaultParams,
          },
          {
            headerName: 'Injury Categories',
            field: 'injuryCategories',
            valueFormatter: data => data?.value?.length
              ? data.value.map(category => this.injuryCategoryTitlePipe.transform(category)).join(', ')
              : '-',
            sortable: false,
            resizable: false,
            ...AGGridHelper.nameColumnDefaultParams,
          },
          {
            headerName: 'Tier Price',
            field: 'tierPrice',
            valueFormatter: data => `$${data.value ?? 0}`,
            sortable: false,
            resizable: false,
            ...AGGridHelper.nameColumnDefaultParams,
          },
        ],
      );
      this.gridApi.setGridOption('rowData', this.details.slidingScalePricings);
    }
  }

  private tryTieredPrices() : void {
    if (this.details.tieredPricings.length > 0) {
      this.gridApi.setGridOption('columnDefs',
        [
          {
            headerName: 'Range',
            field: 'range',
            valueFormatter: data => `$${data.data.lowerValue ?? 0} – $${data.data.upperValue ?? 0}`,
            sortable: false,
            resizable: false,
            ...AGGridHelper.nameColumnDefaultParams,
          },
          {
            headerName: 'Tier Price',
            field: 'tierPrice',
            valueFormatter: data => `${data.data.priceType === 1 ? '$' : '%'} ${data.value ?? 0}`,
            sortable: false,
            resizable: false,
            ...AGGridHelper.nameColumnDefaultParams,
          },
        ],
      );
      this.gridApi.setGridOption('rowData', this.details.tieredPricings);
    }
  }

  private tryPercentageOfSavings() : void {
    if (this.details.percentageOfSavingsPricings.length > 0) {
      this.gridApi.setGridOption('columnDefs',
        [
          {
            headerName: 'Percentage of Savings',
            field: 'name',
            valueFormatter: data => `Percentage of Savings ${Number(data.node.id) + 1}`,
            sortable: false,
            resizable: false,
            ...AGGridHelper.nameColumnDefaultParams,
          },
          {
            headerName: '%',
            field: 'percentageOfSavings',
            valueFormatter: data => `${data.value ?? 0} %`,
            sortable: false,
            resizable: false,
            ...AGGridHelper.nameColumnDefaultParams,
          },
        ],
      );
      this.gridApi.setGridOption('rowData', this.details.percentageOfSavingsPricings);
    }
  }
}
