import { PieChartDataItem } from './pie-chart-data-item';

export class FusionPieChart {

  chart;
  data: PieChartDataItem[];

  constructor(chartData: PieChartDataItem[], optionalChartProperties?) {
    this.data = chartData;
    this.chart = { ...optionalChartProperties }
  }
}