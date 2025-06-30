import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

export class DocumentGeneratorRequest{
  searchOptions: IServerSideGetRowsRequestExtended;
  channelName: string;
}
