import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { PaymentRequestConfig } from './payment-request-config';

export interface IGeneratePaymentRequestGlobal {
  searchOptions?: Partial<IServerSideGetRowsRequestExtended>;
  paymentRequestConfig: PaymentRequestConfig;
}
