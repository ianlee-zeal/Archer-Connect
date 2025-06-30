import { formatCurrency } from "@angular/common";
import { IdValue, LienPhase, LienPhaseSummary, LienTypeSummary } from "@app/models";
import { ChartPresetColors } from "@app/models/enums/chart-preset-colors-enum";
import { StatusChartColors } from "@app/models/enums/status-chart-colors.enum";
import { ChartStylePreset, chartStylePresets } from "@app/models/fusion-charts/chart-style-presets";
import { FusionPieChart } from "@app/models/fusion-charts/fusion-pie-chart";
import { TotalPaymentChartData } from "@app/models/liens/total-payment-chart-data";
import { ReleaseStage } from '@app/models/enums/release-stage.enum';
import { QsfAdminStage } from '@app/models/enums/qsf-admin-stage.enum';
import { ProbateStage } from '@app/models/enums/probate-stage.enum';
import { BankruptcyStage } from '@app/models/enums/bankruptcy-stage.enum';

export abstract class ChartUtilsBase {

  getPhaseColorPalette(allPhases: LienPhase[]): string {
    let colorPalette: string = '';
    for (let p = 0; p < allPhases.length; p++) {
      colorPalette += `${(allPhases[p].hexColor)},`;
    }
    return colorPalette;
  }

  isSelectedType(typeId: number, selectedTypes: number[]): boolean {
    return ((selectedTypes.length == 0) || selectedTypes.includes(typeId));
  }

  isSelectedTypePhase(typeId: number, phaseId: number, selectedPhases: number[], selectedTypes: number[]): boolean {
    return ((selectedPhases == null
      || selectedPhases.length == 0)
      || (selectedPhases.includes(phaseId)) && selectedTypes.includes(typeId)
      || (selectedPhases.length != 0 && selectedTypes.length == 0)
    );
  }

  getSeriesPhase(phase: LienPhase, typeId: number, selectedPhases: number[], selectedTypes: number[]) {
    let seriesDataItem;

    if (phase) {
      seriesDataItem = {
        value: phase.lienCount,
        color: phase.hexColor,
      };

      if (!!selectedTypes && !(this.isSelectedType(typeId, selectedTypes) && this.isSelectedTypePhase(typeId, phase.id, selectedPhases, selectedTypes))) {
        seriesDataItem.alpha = '20';
      }
    } else {
      seriesDataItem = null;
    }

    return seriesDataItem;
  }

  getPhasesChartDefinition(item: LienPhaseSummary, chartProps, selectedPhases: number[], chartStylePreset?: ChartStylePreset ): FusionPieChart {
    return {
      chart: this.getPieChartDefinition({ totalCount: item.lienCount} , chartProps, chartStylePreset),
      data: item.phases.map(phase => ({
        label: phase.shortName,
        tooltext: `${phase.name}: <b>${this.formatNumberWithCommas(phase.lienCount)}</b> (${((phase.lienCount / item.lienCount) * 100).toFixed(1)}%)`,
        value: phase.lienCount,
        isSliced: item.phases.length > 1 && selectedPhases && selectedPhases.includes(phase.id),
        color: phase.hexColor,
      })),
    };
  }

  getPieChartDefinition(item: { totalCount: number}, chartProps, chartStylePreset?: ChartStylePreset) {
    return {
      plottooltext: `$label: <b>$dataValue</b> ($percentValue)`,
      formatNumberScale: '0',
      showCenterLabel: '1',
      centerLabelFontSize: '16',
      showLabels: '0',
      showValues: '0',
      bgColor: '#ffffff',
      startingAngle: '90',
      showLegend: '0',
      enableMultiSlicing: '0',
      pieRadius: '135',
      doughnutRadius: '121',
      centerLabelBold: '1',
      showTooltip: '1',
      percentValues: '1',
      decimals: '2',
      theme: 'fusion',
      labelDistance: '0',
      valueFontSize: '12',
      useDataPlotColorForLabels: '0',
      showToolTipShadow: '1',
      slicingDistance: '10',
      ...this.createDefaultCenterLabel(item.totalCount, 'Claimants'),
      ...chartStylePreset?.chart,
      ...chartProps,
    };
  }

  getTypesChartDefinition(item: LienTypeSummary,
    allTypes: IdValue[],
    allPhases: LienPhase[],
    selectedPhases: number[],
    selectedTypes: number[],
    specificChartProps,
    chartStylePreset?: ChartStylePreset
    ) {
    let dataset = [];
    let categories = [];

    if (item.lienCount > 0) {
      categories = [{
        category: allTypes.map(i => ({
          label: i.name,
        }))
      }];

      // O(n^2) to transform type-phases collections to the chart data structure
      for (let p = 0; p < allPhases?.length; p++) {
        let seriesData = {
          seriesname: allPhases[p].name,
          data: []
        };

        for (let t = 0; t < allTypes.length; t++) {
          let phase: LienPhase;
          let typeId: number;

          const type = item.types.find(i => i.id === allTypes[t].id);

          if (type) {
            phase = type.phases.find(i => i.id === allPhases[p].id);
            typeId = type.id;
          }

          seriesData?.data.push(this.getSeriesPhase(phase, typeId, selectedPhases, selectedTypes));
        }

        dataset.push(seriesData);
      }
    }

      return {
        chart: {
          showLegend: '0',
          theme: 'fusion',
          plottooltext: '$seriesName <b>$dataValue</b> ($percentValue)',
          formatNumberScale: '0',
          showSum: '0',
          drawcrossline: '1',
          toolTipBgAlpha: '90',
          canvasPadding: '10',
          labelFontSize: '11',
          labelFontColor: '#585858',
          maxLabelHeight: '25',
          palettecolors: this.getPhaseColorPalette(allPhases),
          canvasTopPadding: 20,
          ...chartStylePreset,
          ...specificChartProps,
          ...chartStylePreset?.chart,
        },
        categories,
        dataset,
        ...(chartStylePreset?.trendlines ? { trendlines: chartStylePreset.trendlines } : {}),
        ...(chartStylePreset?.annotations ? { annotations: chartStylePreset.annotations } : {}),
      };
  }

  getTotalPaymentChartDefinition(summary: TotalPaymentChartData, chartProps?, chartStylePreset?: ChartStylePreset) {
    chartStylePreset = chartStylePreset || chartStylePresets.orangeDash;
    return {
      chart: {
        showLegend: '0',
        subCaption: 'Last Three Months',
        theme: 'fusion',
        plottooltext: '$seriesName <b>$dataValue</b>',
        showSum: '1',
        drawcrossline: '1',
        toolTipBgAlpha: '90',
        canvasPadding: '10',
        labelFontSize: '14',
        labelFontColor: ChartPresetColors.Gray,
        maxLabelHeight: '25',
        canvasTopPadding: 20,
        numberPrefix: '$',
        anchorBorderColor: '#115d80',
        anchorBgColor: '#115d80',
        numVDivLines: '1',
        vDivLineDashed: '0',
        vDivLineColor: ChartPresetColors.LightGray,
        vDivLineThickness: '1',
        ...chartProps,
        ...chartStylePreset?.chart,
      },
      data: summary.data.map(item => ({
        label: item.name,
        value: item.paidValue,
        tooltext: formatCurrency(item.paidValue, 'en-US', '$'),
      })),
      ...(chartStylePreset?.trendlines ? { trendlines: chartStylePreset.trendlines } : {}),
      ...(chartStylePreset?.annotations ? { annotations: chartStylePreset.annotations } : {}),
    };
  }

  formatNumberWithCommas(number: number): string {
    return number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }

  createDefaultCenterLabel(value: number, name: string, isOneLine: boolean = true): Object {
    return { defaultCenterLabel: `${this.formatNumberWithCommas(value)}${isOneLine ? ' ' : '\n'}${name}` };
  }

  public getStageColor(stageId: number): StatusChartColors {
    switch (stageId) {
      case ReleaseStage.Pending:
      case QsfAdminStage.Pending:
      case ProbateStage.pending:
      case BankruptcyStage.Pending:
        return StatusChartColors.Pending;

      case ReleaseStage.Finalized:
      case QsfAdminStage.Finalized:
      case ProbateStage.finalized:
      case BankruptcyStage.Finalized:
        return StatusChartColors.Finalized;

      default:
        return StatusChartColors.Default;
    }
  }
}
