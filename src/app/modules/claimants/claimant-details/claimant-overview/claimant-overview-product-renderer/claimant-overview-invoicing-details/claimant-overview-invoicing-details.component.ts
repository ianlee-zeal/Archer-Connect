import { Component, Input } from '@angular/core';

import { CellClassParams, GridApi, GridOptions } from 'ag-grid-community';

import { GridId } from '@app/models/enums/grid-id.enum';
import { AGGridHelper, CurrencyHelper } from '@app/helpers';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { Observable } from 'rxjs';
import { ClaimantOverviewInvoicingDetailsItem } from '@app/models/claimant-overview/claimant-overview-invoicing-details-item';
import { ClaimantOverviewInvoicingDetails } from '@app/models/claimant-overview/claimant-overview-invoicing-details';
import { TextWithIconRendererComponent } from '@app/modules/shared/_renderers/text-with-icon-renderer/text-with-icon-renderer.component';

@Component({
  selector: 'app-claimant-overview-invoicing-details',
  templateUrl: './claimant-overview-invoicing-details.component.html',
  styleUrls: ['../claimant-overview-product-renderer.component.scss'],
})
export class ClaimantOverviewInvoicingDetailsComponent {
  @Input('items') public items$: Observable<ClaimantOverviewInvoicingDetailsItem[]>;
  @Input('invoicingDetails') public invoicingDetails$: Observable<ClaimantOverviewInvoicingDetails>;

  public readonly gridId: GridId = GridId.ClaimantOverviewInvoicingDetails;

  private gridApi: GridApi;

  public readonly gridOptions: GridOptions = {
    animateRows: false,
    defaultColDef: {
      resizable: true,
      floatingFilter: false,
      sortable: false,
    },
    columnDefs: [
      {
        headerName: 'Services',
        field: 'serviceName',
        colId: 'serviceName',
        suppressSizeToFit: true,
        cellClass: (params: CellClassParams) => !(params.data as ClaimantOverviewInvoicingDetailsItem).isTotalRow && 'ms-3',
      },
      {
        headerName: 'GL Account',
        field: 'accountNo',
        maxWidth: 200,
      },
      {
        headerName: 'Total Fees',
        field: 'totalFees',
        cellRenderer: params => {
          if (params.data.showTotalFeesPending) {
            return 'Pending';
          }
          return CurrencyHelper.toUsdIfNumber(params);
        },
        ...AGGridHelper.rightAlignedParams,
      },
      {
        headerName: 'Total Fees Invoiced',
        field: 'totalFeesInvoiced',
        cellRenderer: data => CurrencyHelper.toUsdIfNumber(data),
        ...AGGridHelper.rightAlignedParams,
      },
      {
        headerName: 'Total Fees Paid',
        field: 'totalFeesPaid',
        cellRenderer: data => CurrencyHelper.toUsdIfNumber(data),
        ...AGGridHelper.rightAlignedParams,
      },
      {
        headerName: 'Invoice #',
        field: 'invoiceNumber',
      },
      {
        headerName: 'Invoice Date',
        field: 'invoiceDate',
        cellRenderer: data => this.datePipe.transform(data.value, false),

      },
      {
        headerName: 'Fee Written to Ledger',
        field: 'feeWrittenToLedger',
        cellRendererSelector: params => (
          AGGridHelper.getTextBoxWithIconRenderer({
            text: CurrencyHelper.toUsdIfNumber(params),
            textFirst: true,
            faIconClass: params.value && params.data.isLedgerFeeExceedsTotalFees ? 'fa-exclamation-triangle red-color' : null,
          })
        ),
        ...AGGridHelper.rightAlignedParams,
      },

    ],
    onGridSizeChanged: this.onGridSizeChanged.bind(this),
    components: {
      textWithIconRenderer: TextWithIconRendererComponent,
    },
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    rowClassRules: {
      'fw-bold': params => params.data.isTotalRow,
      'double-underline-text': params => params.data.isTotalRow,
    },
  };

  constructor(private datePipe: DateFormatPipe) {

  }

  onGridReady(gridApi: GridApi) {
    this.gridApi = gridApi;
  }

  onGridSizeChanged() {
    if (this.gridApi) {
      this.gridApi.autoSizeColumns(['serviceName']);
      this.gridApi.sizeColumnsToFit();
    }
  }
}
