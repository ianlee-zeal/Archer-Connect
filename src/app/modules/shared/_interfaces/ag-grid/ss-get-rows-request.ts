import { FilterModel } from '@app/models/advanced-search/filter-model';
import { IServerSideGetRowsRequest } from 'ag-grid-community';

// In previous version of ag-grid the filterModel property was of type any,
// so it was reassigned as an array without any issues.
// In v31 that field was updated to strong type, so I created extended interfaces.
export interface IServerSideGetRowsRequestExtended extends Omit<IServerSideGetRowsRequest, 'filterModel'> {
  filterModel: FilterModel[]; // | FilterModel | AdvancedFilterModel | null;
}
