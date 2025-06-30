import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

export class ClientLiensRequest {
  rootProductCategoryId: number;
  lienTypeGroups: number [];
  lienPhases: number [];
  clientStages: number [];
  searchOptions: IServerSideGetRowsRequestExtended;
  isReleaseInGoodOrder?: boolean;

  constructor(model?: Partial<ClientLiensRequest>) {
    Object.assign(this, model);
  }
}
