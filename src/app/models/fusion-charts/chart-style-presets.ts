import { ChartPresetColors } from "../enums/chart-preset-colors-enum";

export interface ChartStylePreset {
    chart?: {
        pieRadius?: string;
        doughnutRadius?: string;
        slicingDistance?: string;
        useDataPlotColorForLabels?: string;
        showLabels?: string;
        showValues?: string;
        showCenterLabel?: string;
        centerLabelBold?: string;
        centerLabelFontSize?: string;
        showToolTipShadow?: string;
        [key: string]: string | undefined;
    };
    trendlines?: any[];
    annotations?: any;
}

export const chartStylePresets: Record<'default' | 'compact' | 'stackedbar2dDashboard' | 'stackedcolumn2dDashboard' | 'orangeDash', ChartStylePreset> = {
    default: {},
    compact: {
        chart: {
            slicingDistance: '0',
            enableSlicing: '0',
        }
    },
    stackedbar2dDashboard: {
        chart: {
            showSum: '0',
            canvasPadding: '0',
            labelFontSize: '14',
            labelFontColor: ChartPresetColors.Gray,
            canvasTopPadding: '20',
            plotSpacePercent: '10',
            divLineColor: ChartPresetColors.LightPeach,
            divLineThickness: '2',
            outcnvbaseFontColor: ChartPresetColors.LightGray,
            showYAxisLine: '1',
            yAxisLineThickness: '1',
            yAxisLineColor: ChartPresetColors.Orange,
            yAxisLineAlpha: '90',
        }
    },
    stackedcolumn2dDashboard: {
        chart: {
            showSum: '0',
            canvasPadding: '0',
            labelFontSize: '14',
            labelFontColor: ChartPresetColors.Gray,
            plotSpacePercent: '10',
            numDivLines: '2',
            divLineDashed: '1',
            divLineDashLen: '5',
            divLineDashGap: '6',
            divLineColor: ChartPresetColors.Orange,
            divLineThickness: '1',
            divLineAlpha: '100',
            outcnvbaseFontColor: ChartPresetColors.LightGray,
            numVDivLines: '8',
            vDivLineDashed: '0',
            vDivLineColor: ChartPresetColors.LightPeach,
            vDivLineThickness: '1',
            vDivLineAlpha: '100',
            showYAxisLine: '1',
            yAxisLineThickness: '1',
            yAxisLineColor: ChartPresetColors.LightPeach,
            yAxisLineAlpha: '100',
            showXAxisLine: '1',
            xAxisLineThickness: '1',
            xAxisLineColor: ChartPresetColors.Orange,
            xAxisLineAlpha: '100',
        },
        trendlines: [
            {
                line: [{
                    startvalue: '0',
                    color: ChartPresetColors.LightPeach,
                    displayvalue: '',
                    thickness: '1',
                    alpha: '100',
                    showOnTop: '1'
                }]
            }
        ],
        annotations: {
            groups: [{
                id: "border-group",
                items: [
                    {
                        type: "line",
                        x: "$canvasStartX",
                        y: "$canvasStartY",
                        toX: "$canvasStartX",
                        toY: "$canvasEndY",
                        color: ChartPresetColors.LightPeach,
                        thickness: "1"
                    },
                    {
                        type: "line",
                        x: "$canvasEndX",
                        y: "$canvasStartY",
                        toX: "$canvasEndX",
                        toY: "$canvasEndY",
                        color: ChartPresetColors.LightPeach,
                        thickness: "1"
                    }
                ]
            }]
        }
    },
    orangeDash: {
        chart: {
            outcnvbaseFontColor: ChartPresetColors.LightGray,
            showYAxisLine: '1',
            yAxisLineThickness: '1',
            yAxisLineColor: ChartPresetColors.LightPeach,
            yAxisLineAlpha: '90',
            divLineColor: ChartPresetColors.Orange,
            divLineThickness: '1',
            divLineDashed: '1',
            divLineDashLen: '4',
            divLineDashGap: '3',
        },
        trendlines: [
            {
                line: [{
                    startvalue: '0',
                    color: ChartPresetColors.LightPeach,
                    displayvalue: '',
                    thickness: '1',
                    alpha: '100',
                    showOnTop: '1'
                }]
            }
        ],
        annotations: {
            groups: [{
                id: "border-group",
                items: [
                    {
                        type: "line",
                        x: "$canvasStartX",
                        y: "$canvasStartY",
                        toX: "$canvasStartX",
                        toY: "$canvasEndY",
                        color: ChartPresetColors.LightPeach,
                        thickness: "1"
                    },
                    {
                        type: "line",
                        x: "$canvasEndX",
                        y: "$canvasStartY",
                        toX: "$canvasEndX",
                        toY: "$canvasEndY",
                        color: ChartPresetColors.LightPeach,
                        thickness: "1"
                    }
                ]
            }]
        }
    }
}