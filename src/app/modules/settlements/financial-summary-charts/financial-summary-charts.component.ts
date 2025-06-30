/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Component, OnDestroy, Input, OnChanges } from '@angular/core';
import { Subject } from 'rxjs';

import { SettlementFinancialSummary } from '@app/models/settlement/settlement-financial-summary';
import { SettlementFinancialSummaryRow } from '@app/models/settlement/settlement-financial-summary-row';
import { ProjectTabWidgetColors } from '@app/models/enums';
import { ExtendedCurrencyPipe } from '@app/modules/shared/_pipes';
import { CurrencyHelper, StringHelper } from '@app/helpers';
import { ChartedSettlementFinancialHeadersEnum } from '@app/models/enums/settlement-financial-headers.enum';

@Component({
  selector: 'app-financial-summary-charts',
  templateUrl: './financial-summary-charts.component.html',
  styleUrls: ['./financial-summary-charts.component.scss'],
})
export class FinancialSummaryCharts implements OnChanges, OnDestroy {
  @Input() public financialSummary: SettlementFinancialSummary;

  private ngUnsubscribe$ = new Subject<void>();

  public paidUnpaidSettlementsChart;
  public paidChart;

  constructor(
    private currencyPipe: ExtendedCurrencyPipe,
  ) {}

  ngOnChanges(): void {
    if (this.financialSummary) {
      this.getCharts();
    }
  }

  private getCharts() {
    this.paidUnpaidSettlementsChart = this.getSettlementChart();
    this.paidChart = this.getPaidChart();
  }

  private getSettlementChartData() {
    const data = [];
    if (this.financialSummary?.totalRow) {
      if (this.financialSummary.totalRow.paymentIssuedInNS && this.financialSummary.totalRow.paymentIssuedInNS !== 0) {
        data.push({
          seriesname: 'Paid',
          data: [
            {
              value: this.financialSummary.totalRow.paymentIssuedInNS,
              color: '#050041',
              valueFontColor: '#fff',
              displayValue: `Paid,<br/> ${this.currencyPipe.transform(this.financialSummary?.totalRow?.paymentIssuedInNS)}`,
            },
          ],
        });
      }
      if (this.financialSummary.totalRow.toBePaid && this.financialSummary.totalRow.toBePaid !== 0) {
        data.push({
          seriesname: 'Unpaid',
          data: [
            {
              value: this.financialSummary.totalRow.toBePaid,
              color: '#FDBA12',
              displayValue: `Unpaid,<br/> ${CurrencyHelper.renderAmount({ value: this.financialSummary?.totalRow?.toBePaid })}`,
            },
          ],
        });
      }
    }
    return data;
  }

  private getSettlementChart() {
    const dataset = this.getSettlementChartData();
    return {
      chart: {
        theme: 'fusion',
        animation: true,
        enableMultiSlicing: false,
        labelDistance: 0,
        pieRadius: 80,
        showLegend: false,
        showTooltip: true,
        showLabels: true,
        showValues: true,
        minPlotHeightForValue: 15,
        startingAngle: 90,
        toolTipBgAlpha: 90,
        canvasPadding: 10,
        labelFontSize: 11,
        centerLabelFontSize: 11,
        valueFontSize: 11,
        centerLabelBold: true,
        decimals: 0,
        labelFontColor: ProjectTabWidgetColors.Label,
        maxLabelHeight: 25,
        plottooltext: '$seriesName <b>$dataValue</b>',
        slicingDistance: 15,
        numberPrefix: '$',
        yAxisValueDecimals: '2',
        forceYAxisValueDecimals: '1',
        formatNumberScale: '12',
        maxColWidth: 150,
      },
      categories: [{
        category: [
          {
            label: '',
          }],
      }],
      dataset,
    };
  }

  private getPaidChart() {
    const data = this.getPaidData();
    return {
      chart: {
        plottooltext: '$label: <b>$dataValue</b>',
        centerLabelFontSize: '9',
        showLabels: '1',
        bgColor: '#ffffff',
        startingAngle: '90',
        showLegend: '0',
        enableMultiSlicing: '0',
        pieRadius: '100',
        centerLabelBold: '1',
        showTooltip: '1',
        decimals: '2',
        theme: 'fusion',
        labelDistance: '0',
        valueFontSize: '10',
        defaultCenterLabel: `$${StringHelper.truncateNumber(this.financialSummary?.totalRow.paymentIssuedInNS, 14)}`,
        centerLabelToolText: CurrencyHelper.renderAmount({ value: this.financialSummary?.totalRow.paymentIssuedInNS }),
        showValues: 1,
        numberPrefix: '$',
        showPercentValues: '0',
        formatNumberScale: '12',
        rotateLabels: '0',
        manageLabelOverflow: '1',
        enableSmartLabels: '1',
        showPlotBorder: '1',
        plotBorderThickness: '1',
        plotBorderColor: '#d4d4d4',
      },
      data,
    };
  }

  getPaidData() {
    const defaultColors = {
      'Lien Refunds': '#8A2BE2',
      'Claimant Payments': '#F1B300',
      'Other Fees': '#FF5733',
      'ARCHER Fees': '#1774DE',
      '3rd Party Expenses': '#550101',
      'Medical Liens': '#30B74F',
      'Attorney Expenses': '#BBBCBC',
      'Attorney Fees': '#050041',
      'MDL / CBF Payment': '#008080',
      'Lien Holdbacks': '#FF4500',
      'Fee Holdbacks': '#006400',
      'Special Master': '#8B0000',
      'Taxes': '#FFD700',
      'Other Holdbacks': '#483D8B',
      'Other Refunds': '#2E8B57',
    };

    const data = [];
    const dataNegative = [];

    Object.values(ChartedSettlementFinancialHeadersEnum).forEach((label: string) => {
      const row = this.financialSummary?.rows.find((r: SettlementFinancialSummaryRow) => r.label === label);
      if (row && row.paymentIssuedInNS && row.paymentIssuedInNS !== 0) {
        const value = row.paymentIssuedInNS;
        const renderedAmount = CurrencyHelper.renderAmount({ value });
        const isNegative = value < 0;
        const color = isNegative ? '#FFFFFF' : defaultColors[label];
        const formattedValue = `${label}, ${renderedAmount}`;
        const item = {
          label: `${label}`,
          value: Math.abs(value).toString(),
          displayValue: formattedValue,
          color,
        };
        if (isNegative) {
          dataNegative.push(item);
        } else {
          data.push(item);
        }
      }
    });

    // Concatenate data first, then the negative data so negative data is shown last
    const result = data.concat(dataNegative);
    return result;
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
