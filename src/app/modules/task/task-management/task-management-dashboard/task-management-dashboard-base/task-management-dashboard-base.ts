import { TeamStats } from '@app/models';
import { TaskWidgetColors } from '@app/helpers/task-widget-constants';

export class TaskManagementDashboardBase {
  protected prepareStr(input:string): string {
    if (!input) {
      return '';
    }
    return input.toLowerCase().replace(/\s/g, '');
  }

  protected getColorPalette(barChart:TeamStats[]) {
    return barChart.map(fbc => fbc.color);
  }

  protected getColor(allTsSet:TeamStats[], entityName:string) {
    const defaultColors = { barColor: TaskWidgetColors.Gray, valueColor: TaskWidgetColors.White };
    const found = allTsSet.find(a => this.prepareStr(a.label) === this.prepareStr(entityName));
    return { barColor: found.color, valueColor: found.valueColor } || defaultColors;
  }

  protected getMinWidth(taskNumber:number, maxTaskNumber: number, isTotal:boolean) {
    if (!taskNumber || !maxTaskNumber) {
      return undefined;
    }
    const numOfDigits = Math.floor(Math.log10(taskNumber)) + 1;
    const percentPerDigit = 0.07;
    const retVal = percentPerDigit * numOfDigits * maxTaskNumber;
    return isTotal || taskNumber < retVal ? retVal : taskNumber;
  }

  protected getBarChart(caption:string, subCaption: string, colors: string[], categories:Array<any>, dataset:Array<any>, other) {
    const chart = {
      chart: {
        caption,
        subCaption,
        theme: 'fusion',
        animation: true,
        drawcrossline: false,
        crossLineAlpha: 0,
        toolTipBgAlpha: 90,
        canvasPadding: 10,
        labelFontSize: 11,
        labelFontColor: TaskWidgetColors.Gray,
        maxLabelHeight: 25,
        palettecolors: colors,
        showLegend: false,
        showTooltip: false,
        showValues: true,
        valueFontColor: TaskWidgetColors.Gray,
        yAxisMinValue: 0,
        yAxisValueFontSize: 11,
        showYAxisValues: false,
        numVisiblePlot: 8,
        valueFontSize: 11,
        ...other,
      },
      categories,
      dataset,
    };
    return chart;
  }

  protected getPieChart(caption:string, subCaption: string, colors: string[], dataset:Array<any>, other) {
    const chart = {
      chart: {
        caption,
        subCaption,
        theme: 'fusion',
        animation: true,
        palettecolors: colors,
        enableMultiSlicing: false,
        labelDistance: 0,
        pieRadius: 80,
        showLegend: false,
        showTooltip: true,
        startingAngle: 90,
        toolTipBgAlpha: 90,
        canvasPadding: 10,
        labelFontSize: 11,
        labelFontColor: TaskWidgetColors.Gray,
        maxLabelHeight: 25,
        plotToolText: '$percentValue ($value)',
        ...other,
      },
      data: dataset,
    };

    return chart;
  }
}
