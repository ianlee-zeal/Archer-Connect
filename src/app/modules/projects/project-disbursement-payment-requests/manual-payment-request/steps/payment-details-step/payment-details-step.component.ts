import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AGGridHelper, CurrencyHelper, SearchOptionsHelper } from '@app/helpers';
import { GridId, SearchTypeEnum } from '@app/models/enums';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { CheckboxEditorRendererComponent, DropdownEditorRendererComponent, TextboxEditorRendererComponent } from '@app/modules/shared/_renderers';
import { ActionsSubject, Store } from '@ngrx/store';
import { CellRendererSelectorResult, CellValueChangedEvent, EditableCallbackParams, GridApi, GridOptions, ICellRendererParams, RowNode, ValueGetterParams } from 'ag-grid-community';
import * as projectActions from '../../../../../projects/state/actions';
import * as importAction from '@app/modules/shared/state/upload-bulk-document/actions';
import { ofType } from '@ngrx/effects';
import { takeUntil } from 'rxjs';
import { BankAccount } from '@app/models';
import { Dictionary } from '@app/models/utils/dictionary';
import { ManualPaymentDetailItem } from '@app/models/file-imports/manual-payment-detail-item';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { YesNoPipe } from '@app/modules/shared/_pipes';
import { SelectHelper } from '@app/helpers/select.helper';
import { Hidable } from '@app/modules/shared/_functions/hidable';

const MAX_ROWS_NUMBER = 10;

@Component({
  selector: 'app-payment-details-step',
  templateUrl: './payment-details-step.component.html',
  styleUrl: './payment-details-step.component.scss',
})
export class PaymentDetailsStepComponent extends ListView implements OnInit {
  readonly gridId = GridId.PaymentDetails;
  public bankAccountsByOrgId: Dictionary<number, BankAccount[]> = null;

  @Input() importId: number;

  @Input() orgId: number;

  get isMaxRowsNumber(): boolean {
    return this?.gridApi?.getDisplayedRowCount() > MAX_ROWS_NUMBER;
  }

  get isLoading(): boolean {
    return false;
  }

  get rowHeight(): string {
    const headerHeight = 45;
    return `${MAX_ROWS_NUMBER * AGGridHelper.defaultGridOptions.rowHeight + headerHeight}px`;
  }

  get gridClass(): string {
    return `${!this.isMaxRowsNumber ? 'ag-grid-custom-height-auto ag-grid-left-aligned' : ''}${this.isLoading ? ' grid-hidden' : ''}`;
  }

  constructor(
    private store: Store<any>,
    protected router: Router,
    protected elementRef: ElementRef,
    private actionsSubj: ActionsSubject,
    private yesNoPipe: YesNoPipe,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.subscribeToBankAccountsList();
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    const searchOptions: IServerSideGetRowsRequestExtended = SearchOptionsHelper.getFilterRequest([
      SearchOptionsHelper.getContainsFilter('documentImportId', FilterTypes.Number, SearchTypeEnum.Equals, this.importId.toString()),
    ]);
    searchOptions.endRow = -1;
    this.store.dispatch(projectActions.GetManualPaymentRequestImportsRowsRequest({
      params: searchOptions,
      agGridParams: params,
    }));
  }

  readonly gridOptions: GridOptions = {
    getRowId: (data: any): string => `${data?.data?.id?.toString()}`,
    animateRows: false,
    columnDefs: [
      { headerName: 'Id', field: 'id', hide: true },
      { headerName: 'Payee Type', field: 'payeeType', minWidth: 150, ...AGGridHelper.nameColumnDefaultParams },
      { headerName: 'Payee Organization', field: 'payeeOrganization', minWidth: 200, ...AGGridHelper.nameColumnDefaultParams },
      { headerName: 'Client ID', field: 'clientIdValue', minWidth: 120, ...AGGridHelper.nameColumnDefaultParams },
      { headerName: 'Override Payee Name',
        field: 'overridePayeeName',
        minWidth: 200,
        ...AGGridHelper.nameColumnDefaultParams,
        valueGetter: (params: ValueGetterParams): string => this.yesNoPipe.transform(params.data.overridePayeeName)
       },
      { headerName: 'Payee Name', field: 'payeeName', minWidth: 200, ...AGGridHelper.nameColumnDefaultParams },
      { headerName: 'Payment Type', field: 'paymentType', minWidth: 150, ...AGGridHelper.nameColumnDefaultParams },
      { headerName: 'Lien ID', field: 'lienId', minWidth: 120, ...AGGridHelper.nameColumnDefaultParams },
      {
        headerName: 'Amount',
        field: 'amount',
        minWidth: 150,
        ...AGGridHelper.nameColumnDefaultParams,
        cellRenderer: (data: ICellRendererParams): string => (data.value ? CurrencyHelper.toUsdFormat(data) : ''),
      },
      { headerName: 'Payment Method', field: 'paymentMethod', minWidth: 150, ...AGGridHelper.nameColumnDefaultParams },
      {
        headerName: 'Bank Account',
        field: 'bankAccount',
        minWidth: 200,
        editable: (params: EditableCallbackParams<any, any>) => this.isWireOrACH(params.data?.paymentMethod),
        cellRendererSelector: (params: ICellRendererParams): CellRendererSelectorResult => AGGridHelper.getDropdownRenderer({
          values: this.getBankAccounts(params.data.organizationId),
          value: params.value,
          placeholder: 'Select Bank Account',
          disabledPlaceholder: true,
          defaultOption: params.data.payeeDto,
          isRequired: () => this.isWireOrACH(params.data?.paymentMethod),
          isValid: (data: any) => {
            const wa = this.isWireOrACH(params.data?.paymentMethod);
            return (!wa || !!data);
          }
        }),
        hide: false,
        onCellValueChanged: (params: CellValueChangedEvent) => this.onBankAccountChange(params),
      },
      { headerName: 'For Further Credit', field: 'furtherCreditAccount', minWidth: 200, ...AGGridHelper.nameColumnDefaultParams },
      { headerName: 'Check Memo', field: 'checkMemo', minWidth: 200, ...AGGridHelper.nameColumnDefaultParams },
      { headerName: 'Email Address', field: 'email', minWidth: 200, ...AGGridHelper.nameColumnDefaultParams },
      { headerName: 'Address', field: 'address', minWidth: 200, ...AGGridHelper.nameColumnDefaultParams },
      { headerName: 'Attn', field: 'attn', minWidth: 150, ...AGGridHelper.nameColumnDefaultParams },
      { headerName: 'Address 1', field: 'address1', minWidth: 200, ...AGGridHelper.nameColumnDefaultParams },
      { headerName: 'Address 2', field: 'address2', minWidth: 200, ...AGGridHelper.nameColumnDefaultParams },
      { headerName: 'City', field: 'city', minWidth: 150, ...AGGridHelper.nameColumnDefaultParams },
      { headerName: 'State', field: 'state', minWidth: 100, ...AGGridHelper.nameColumnDefaultParams },
      { headerName: 'Zip Code', field: 'zip', minWidth: 120, ...AGGridHelper.nameColumnDefaultParams },
      { headerName: 'Country', field: 'country', minWidth: 150, ...AGGridHelper.nameColumnDefaultParams },
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: false,
      suppressKeyboardEvent: this.suppressDefaultKeyboardKeys.bind(this),
    },
    components: {
      checkBoxRenderer: CheckboxEditorRendererComponent,
      textBoxRenderer: TextboxEditorRendererComponent,
      dropdownRenderer: DropdownEditorRendererComponent,
    },
    onCellValueChanged: this.onCellValueChanged.bind(this),
    suppressClickEdit: true,
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_SERVER_SIDE,
    pagination: true,
    paginationPageSize: 25,
    suppressRowClickSelection: true,
  };

  onGridReady(gridApi: GridApi): void {
    super.gridReady(gridApi);
  }

  private subscribeToBankAccountsList(): void {
    this.actionsSubj.pipe(
      ofType(
        projectActions.GetManualPaymentResultBankAccountsSuccess,
      ),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(res => {
      let dict = new Dictionary<number, BankAccount[]>();
      res.manualPaymentBankAccounts.forEach(ba => {
        if (!dict[ba.orgId]) {
          dict[ba.orgId] = [];
        }
        dict[ba.orgId].push(ba);
      });
      this.bankAccountsByOrgId = dict;
    });
  }

  private isWireOrACH(paymentMethod: string): boolean {
    return ['Wire', 'ACH'].includes(paymentMethod);
  }

  private onBankAccountChange(params: CellValueChangedEvent): void {
    if (!params.data?.id) {
      return;
    }
    const updatedItem: ManualPaymentDetailItem = {
      bankAccountId: params.newValue // Assuming `params.newValue` is the selected bankAccountId
    };
    this.store.dispatch(importAction.UpdatePaymentDetail({
      documentImportId: this.importId,
      paymentRequestItemId: params.data.id,
      item: updatedItem
    }));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getBankAccounts(orgId: number): SelectOption[] {
    return  SelectHelper.toOptions(
      this.bankAccountsByOrgId[orgId],
      (option: BankAccount) => option.id,
      (option: BankAccount) => this.formatBankAccountName(option.name, option.accountNumber)
    ) || [];
  }

  private onCellValueChanged(_event: CellValueChangedEvent): void {
  }

  private formatBankAccountName(name: string, accountNumber: string): string {
    return !name ? '' : `${name} ${Hidable.hideNumber(accountNumber?.toString(), 9)}`;
  }

  isValid(): boolean {
    let valid = true;
    let hasRows = false;
    this.gridApi?.forEachNode((rowNode: RowNode) => {
      hasRows = true;
      if (rowNode.data
          && this.isWireOrACH(rowNode.data.paymentMethod)
          && !rowNode.data.bankAccount) {
        valid = false;
      }
    });
    return hasRows && valid;
  }
}
