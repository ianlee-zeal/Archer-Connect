import { PaymentRequestProgressStatistics } from './payment-request-progress-statistics';

export class PaymentRequestProgress {
  CurrentRow: number;
  TotalRows: number;
  Message: string;
  Statistics: PaymentRequestProgressStatistics;
}
