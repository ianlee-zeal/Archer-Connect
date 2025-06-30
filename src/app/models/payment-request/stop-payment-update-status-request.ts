import { Attachment } from '../attachment';
import { StopPaymentRequestStatusEnum } from '../enums/payment-status.enum';
import { ISearchOptions } from '../search-options';

export interface IStopPaymentUpdateStatusRequestDto {
  reason: string;
  waitingPeriod: number;
  stopPaymentRequestStatus: number;
  statusEnum: StopPaymentRequestStatusEnum;
  searchOptions: ISearchOptions;
  checkNumber: string,
  comment: string,
  attachments: Attachment[],
}
