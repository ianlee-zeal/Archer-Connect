import { ColumnExport } from '../column-export';
import { ClientsForQsfDashboardRequest } from './clients-for-qsf-dashboard-request';

export class ClientsForQsfDashboardRequestExport {
  name: string;
  columns: ColumnExport[];
  clientLiens: ClientsForQsfDashboardRequest;
  channelName: string;

  constructor(model?: Partial<ClientsForQsfDashboardRequestExport>) {
    Object.assign(this, model);
  }
}
