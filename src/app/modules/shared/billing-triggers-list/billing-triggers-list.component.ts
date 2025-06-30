import { Component, ElementRef, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { CommonHelper } from '@app/helpers';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { GridId } from '@app/models/enums/grid-id.enum';
import { GridOptions } from 'ag-grid-community';
import { ListView } from '../_abstractions/list-view';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

@Component({
  selector: 'app-billing-triggers-list',
  templateUrl: './billing-triggers-list.component.html',
  styleUrls: ['./billing-triggers-list.component.scss'],
})
export class BillingTriggersListComponent extends ListView implements OnInit, OnChanges {
  @Input() public gridId: GridId;
  @Input() public triggersList: any[];
  @Input() public title: string;
  public columnName: string;
  public gridOptions: GridOptions;

  public initGridOptions() {
    this.gridOptions = {
      columnDefs: [
        {
          headerName: this.columnName,
          field: 'name',
          headerClass: 'ag-header-cell-bold',
          sortable: false,
          ...AGGridHelper.nameColumnDefaultParams,
        },
      ],
      rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
      animateRows: false,
      defaultColDef: {
        sortable: false,
      },
    } as GridOptions;
  }

  constructor(
    protected router: Router,
    protected elementRef: ElementRef,
  ) { super(router, elementRef); }

  ngOnChanges(changes: SimpleChanges): void {
    const { triggersList, gridId } = this;
    const stateChanges = changes[CommonHelper.nameOf({ triggersList })];
    const idChanges = changes[CommonHelper.nameOf({ gridId })];

    if (gridId && idChanges) {
      this.columnName = this.gridId === GridId.BillingTriggers ? 'Billing Trigger Name' : 'Pricing Trigger Name';
      this.initGridOptions();
    }

    if (triggersList && stateChanges && this.gridApi) {
      this.gridApi.setGridOption('rowData', this.triggersList);
    }
  }

  ngOnInit(): void {
  }

  public gridReady(gridApi): void {
    this.gridApi = gridApi;
    this.gridApi.setGridOption('rowData', this.triggersList);
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;
  }
}
