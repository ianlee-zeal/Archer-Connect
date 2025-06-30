import { FilterModel } from '@app/models/advanced-search/filter-model';
import { ISearchOptions } from '@app/models/search-options';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { IGridLocalData } from '@app/state/root.state';

export class SearchOptionsHelper {
  public static getFilterRequest(filters: FilterModel[]): IServerSideGetRowsRequestExtended {
    return {
      endRow: 25,
      startRow: 0,
      rowGroupCols: [],
      valueCols: [],
      pivotCols: [],
      pivotMode: false,
      groupKeys: [],
      filterModel: filters,
      sortModel: [],
    };
  }

  public static getNumberFilter(key: string, filterType: string, type: string, filter: number): FilterModel {
    return {
      key,
      conditions: [],
      filterType,
      type,
      filter,
      filterTo: null,
      dateFrom: null,
      dateTo: null,
    };
  }

  public static getContainsFilter(key: string, filterType: string, type: string, filter: string): FilterModel {
    return {
      key,
      conditions: [],
      filterType,
      type,
      filter,
      filterTo: null,
      dateFrom: null,
      dateTo: null,
    };
  }

  public static getBooleanFilter(key: string, filterType: string, type: string, filter: boolean): FilterModel {
    return {
      key,
      conditions: [],
      filterType,
      type,
      filter,
      filterTo: null,
      dateFrom: null,
      dateTo: null,
    };
  }

  public static createSearchOptions(gridLocalData: IGridLocalData, gridParams?: IServerSideGetRowsParamsExtended): ISearchOptions {
    const searchOpts: ISearchOptions = {
      ...gridParams?.request,
      isSelectAll: false,
      containIds: [],
      notContainIds: [],
    };

    if (!gridLocalData?.selectedRecordsIds) {
      return searchOpts;
    }

    searchOpts.isSelectAll = gridLocalData.isAllRowSelected;

    const selectedRecords = [...gridLocalData.selectedRecordsIds.entries()];

    selectedRecords.forEach(([id, isSelected]) => {
      if (isSelected && !gridLocalData.isAllRowSelected) {
        searchOpts.containIds.push(+id);
      } else if (!isSelected && gridLocalData.isAllRowSelected) {
        searchOpts.notContainIds.push(+id);
      }
    });

    return searchOpts;
  }
}
