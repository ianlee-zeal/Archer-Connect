import { Component, ElementRef, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { CommonHelper } from '@app/helpers';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { GridId } from '@app/models/enums/grid-id.enum';
import { GridOptions } from 'ag-grid-community';
import { ListView } from '../_abstractions/list-view';
import { SelectedOrgListCellRendererComponent } from './renderers/actions-renderer/actions-renderer.component';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

@Component({
  selector: 'app-selected-orgs-list',
  templateUrl: './selected-orgs-list.component.html',
  styleUrls: ['./selected-orgs-list.component.scss'],
})
export class SelectedOrgsListComponent extends ListView implements OnInit, OnChanges {
  @Input() public orgsList: any[];
  @Input() public onDeleteHandler: any;
  public gridId = GridId.SelectedOrgList;
  public gridOptions: GridOptions;

  public initGridOptions() {
    this.gridOptions = {
      columnDefs: [
        {
          headerName: 'Selected Organizations',
          field: 'name',
          headerClass: 'ag-header-cell-bold',
          sortable: false,
          ...AGGridHelper.nameColumnDefaultParams,
        },
        AGGridHelper.getActionsColumn({ deleteHandler: this.onDeleteHandler.bind(this), hidden: this.isDeleteButtonHidden.bind(this)}),
      ],
      animateRows: false,
      defaultColDef: {
        sortable: false,
      },
      rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
      components: {
        buttonRenderer: SelectedOrgListCellRendererComponent,
      },
    } as GridOptions;
  }

  constructor(
    protected router: Router,
    protected elementRef: ElementRef,
  ) { super(router, elementRef); }

  ngOnChanges(changes: SimpleChanges): void {
    const { orgsList } = this;
    const stateChanges = changes[CommonHelper.nameOf({ orgsList })];

    if (orgsList && stateChanges && this.gridApi) {
      this.gridApi.setGridOption('rowData', this.orgsList);
    }
  }

  ngOnInit(): void {
    this.initGridOptions();
  }

  public gridReady(gridApi): void {
    this.gridApi = gridApi;
    this.gridApi.setGridOption('rowData', this.orgsList);
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;
  }

  private isDeleteButtonHidden(): boolean {
    return true;
  }
}
