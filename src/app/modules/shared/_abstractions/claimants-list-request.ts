import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

export class ClaimantsListRequest {
  projectId: number;
  rootProductCategoryId:number;
  agGridParams?: IServerSideGetRowsParamsExtended;
  lienTypes?: number[];
  lienPhases?: number[];
  clientStages?: number[];
}
