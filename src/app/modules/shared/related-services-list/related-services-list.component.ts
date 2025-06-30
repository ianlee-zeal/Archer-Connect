import { Component, ElementRef, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonHelper } from '@app/helpers';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { ProductCategoryEnum } from '@app/models/enums/billing-rule/product-category.enum';
import { GridId } from '@app/models/enums/grid-id.enum';
import { GridOptions } from 'ag-grid-community';
import { ListView } from '../_abstractions/list-view';
import { RelatedServicesActionsRendererComponent } from './related-services-actions-renderer/related-services-actions-renderer.component';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

@Component({
  selector: 'app-related-services-list',
  templateUrl: './related-services-list.component.html',
  styleUrls: ['./related-services-list.component.scss'],
})
export class RelatedServicesListComponent extends ListView implements OnChanges {
  @Input() public gridId: GridId = GridId.BankAccounts;
  @Input() public relatedServices: any[];
  @Input() public canEdit;
  @Input() public additionalPageItemsCountValues = [];
  @Output() public relatedServicesChange = new EventEmitter<any[]>();

  public readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'ID',
        field: 'id',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Service Name',
        field: 'serviceName',
        colId: 'name',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Product Name',
        field: 'productName',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      AGGridHelper.getActionsColumn({
        deleteHandler: this.onDeleteHandler.bind(this),
        hidden: this.isDeleteButtonHidden.bind(this),
      }),
    ],
    animateRows: false,
    defaultColDef: {
      sortable: false,
    },
    paginationPageSize: 5,
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    components: { buttonRenderer: RelatedServicesActionsRendererComponent },
  } as GridOptions;

  constructor(
    protected router: Router,
    protected elementRef: ElementRef,
  ) { super(router, elementRef); }

  ngOnChanges(changes: SimpleChanges): void {
    const { relatedServices } = this;
    const stateChanges = changes[CommonHelper.nameOf({ relatedServices })];

    if (relatedServices && stateChanges && this.gridApi) {
      this.changeIdColumnVisibility();
      this.gridApi.setGridOption('rowData', this.relatedServices);
    }

    this.toggleActionsColumn(!this.canEdit);
  }

  public gridReady(gridApi): void {
    this.gridApi = gridApi;
    this.changeIdColumnVisibility();
    this.gridApi.setGridOption('rowData', this.relatedServices);
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;
  }

  private onDeleteHandler(data): void {
    const services = data.id ? this.relatedServices.filter(service => service.id !== data.id) : [];
    this.relatedServicesChange.emit(services);
  }

  private isDeleteButtonHidden(): boolean {
    return this.canEdit;
  }

  private changeIdColumnVisibility() {
    const hideId = this.relatedServices[0]?.serviceName === ProductCategoryEnum[ProductCategoryEnum.All];
    const columns = this.gridApi.getColumnDefs();

    this.gridApi.setGridOption('columnDefs', columns.map(col => {
      if (col.headerName === 'ID') { return { ...col, hide: hideId }; }
      return col;
    }));
  }
}
