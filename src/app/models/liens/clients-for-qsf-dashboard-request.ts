import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

export class ClientsForQsfDashboardRequest {
  attorneyPaymentStatuses: number [];
  clientStages: number [];
  searchOptions: IServerSideGetRowsRequestExtended;

  constructor(model?: Partial<ClientsForQsfDashboardRequest>) {
    Object.assign(this, model);
  }
}
