import { TotalPaymentChartItem } from './total-payment-chart-item';

export class TotalPaymentChartData {
  total: number;
  data: TotalPaymentChartItem[];

  constructor(model?: Partial<TotalPaymentChartData>) {
    Object.assign(this, model);
  }
}
