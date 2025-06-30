
import { IServerSideGetRowsRequestExtended } from '../_interfaces/ag-grid/ss-get-rows-request';
import { NavigationSettings } from '../action-bar/navigation-settings';

export class ClaimantDetailsRequest {
  id?: number;
  projectId?: number;
  rootProductCategoryId?: number;
  clientStages?: number[];
  lienPhases?: number[];
  lienType?: number[];
  filterParameter?: string;
  filterValue?: number;
  fieldId?: number;
  navSettings?: NavigationSettings;
  gridParamsRequest: IServerSideGetRowsRequestExtended;
}
