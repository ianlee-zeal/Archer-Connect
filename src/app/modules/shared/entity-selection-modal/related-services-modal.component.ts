import { GridId } from '@app/models/enums/grid-id.enum';
import { GridOptions, RowSelectedEvent } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import * as sharedActions from '@app/modules/shared/state/entity-selection-modal/actions';
import { SelectHelper } from '@app/helpers/select.helper';
import { ProductCategoryEnum } from '@app/models/enums/billing-rule/product-category.enum';
import { GridRowToggleCheckbox, SetAllRowSelected } from '@app/state/root.actions';
import { Component, OnDestroy } from '@angular/core';
import { IGridLocalData } from '@app/state/root.state';
import { gridLocalDataByGridId } from '@app/state';
import { takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { GridHeaderCheckboxComponent } from '../grid/grid-header-checkbox/grid-header-checkbox.component';
import { EntitySelectionModalComponent } from './entity-selection-modal.component';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { FilterModel } from '@app/models/advanced-search/filter-model';

@Component({
  selector: 'app-related-services-selection-modal',
  templateUrl: './entity-selection-modal.component.html',
})
export class RelatedServicesModalComponent extends EntitySelectionModalComponent implements OnDestroy {
  // inherited fields from EntitySelectionModalComponent
  title = 'Related Services Selection';
  gridId = GridId.RelatedServicesSelection;
  entityLabel = 'Related Services';
  gridDataFetcher = (params: IServerSideGetRowsParamsExtended): void => {
    this.addProductCategoryFilterIntoSearchParam(params);
    this.store.dispatch(sharedActions.SearchRelatedServices({ params }));
  };
  // ---

  private isAllRowSelected: boolean = false;
  private gridLocalData$: Observable<IGridLocalData> = this.store.select(gridLocalDataByGridId({ gridId: this.gridId }));

  gridOptions: GridOptions = {
    onRowSelected: this.onRowSelected.bind(this),
    columnDefs: [
      {
        width: 40,
        maxWidth: 40,
        checkboxSelection: true,
        headerComponent: GridHeaderCheckboxComponent,
        headerComponentParams: { gridId: this.gridId, floatingFilter: false, pinned: true },
        pinned: 'left',
        floatingFilter: false,
      },
      {
        headerName: 'Product Category',
        field: 'productCategory.name',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Product',
        field: 'product.name',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
    ],
    animateRows: false,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    rowSelection: 'multiple',
    rowMultiSelectWithClick: true,
  };

  public get selectedRecordsIds(): Map<string, boolean> {
    return new Map<string, boolean>(this.selectedEntities.map((entity: any) => [entity.key, entity.selected]));
  }

  public ngOnInit(): void {
    if (this.selectedEntities?.length) {
      const allSelected: boolean = this.selectedEntities.some((entity: any) => entity.key === ProductCategoryEnum.All.toString());

      if (allSelected) {
        this.selectedEntities = [];
        this.store.dispatch(SetAllRowSelected({ gridId: this.gridId, isAllRowSelected: true }));
      } else {
        this.store.dispatch(GridRowToggleCheckbox({
          gridId: this.gridId,
          selectedRecordsIds: this.selectedRecordsIds,
        }));
      }
    }

    this.gridLocalData$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((data: IGridLocalData) => {
        this.isAllRowSelected = data?.isAllRowSelected;
      });
  }

  private onRowSelected(event: RowSelectedEvent): void {
    if (event.node.rowIndex !== null) {
      const { data } = event.node;

      const existingRecord = this.selectedEntities.find((entity: any) => entity.key === data.id);
      const isSelected = event.node.isSelected();

      if (existingRecord) {
        existingRecord.selected = isSelected;
      } else {
        const value = SelectHelper.serviceToKeyValuePair(data);
        const newRecord = { ...value, selected: isSelected };

        this.selectedEntities.push(newRecord);
      }

      if (this.isAllRowSelected && !isSelected) {
        this.store.dispatch(SetAllRowSelected({
          gridId: this.gridId,
          isAllRowSelected: false,
        }));
      }

      this.store.dispatch(GridRowToggleCheckbox({
        gridId: this.gridId,
        selectedRecordsIds: this.selectedRecordsIds,
      }));
    }
  }

  private addProductCategoryFilterIntoSearchParam(params: IServerSideGetRowsParamsExtended): void {
    params.request.filterModel.push(new FilterModel({
      filter: ProductCategoryEnum.All,
      filterType: FilterTypes.Number,
      key: 'productCategory.id',
      type: 'notEqual',
    }));
  }

  public onSave(): void {
    let selectedRecords = [];

    if (this.isAllRowSelected) {
      selectedRecords = [{ key: ProductCategoryEnum.All.toString(), value: ProductCategoryEnum[ProductCategoryEnum.All] }];
    } else {
      selectedRecords = this.selectedEntities.filter((item: any) => !!item.selected);
    }

    this.onEntitySelected(selectedRecords);
    this.modalRef.hide();
  }

  public ngOnDestroy(): void {
    this.selectedEntities = [];
    super.ngOnDestroy();
  }
}
