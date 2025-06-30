import { ColumnExport } from '../column-export';
import { ClientLiensRequest } from './client-liens-request';

export class ClientLiensRequestExport {
  name: string;
  columns: ColumnExport[];
  clientLiens: ClientLiensRequest;
  channelName: string;

  constructor(model?: Partial<ClientLiensRequestExport>) {
    Object.assign(this, model);
  }
}
