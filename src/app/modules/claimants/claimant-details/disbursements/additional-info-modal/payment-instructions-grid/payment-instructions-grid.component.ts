/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { ActionsSubject, Store } from '@ngrx/store';
import {
  CellRendererSelectorResult,
  CellValueChangedEvent,
  EditableCallbackParams,
  GridApi,
  GridOptions,
  ICellRendererParams,
  RowNode,
} from 'ag-grid-community';
import { filter, map, takeUntil } from 'rxjs/operators';

import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { AttyFirmFees, ClaimSettlementLedgerEntryStatus, EntityTypeEnum, LedgerAccountEnum, LedgerAccountGroup, PaymentMethodEnum, PaymentTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum, ValidationStatus } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { CheckboxEditorRendererComponent } from '@app/modules/shared/_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import { DropdownEditorRendererComponent, IDropdownEditorRendererParams } from '@app/modules/shared/_renderers/dropdown-editor-renderer/dropdown-editor-renderer.component';
import { ITextboxEditorRendererParams, TextboxEditorRendererComponent, TextboxEditorRendererDataType } from '@app/modules/shared/_renderers/textbox-editor-renderer/textbox-editor-renderer.component';

import * as commonActions from '@app/modules/projects/state/actions';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';

import { CommonHelper, IconHelper, StringHelper } from '@app/helpers';
import { CurrencyHelper } from '@app/helpers/currency.helper';
import { SelectHelper } from '@app/helpers/select.helper';
import { Address, BankAccount, Email, Org, TransferOrgs } from '@app/models';
import { LedgerEntryInfo } from '@app/models/closing-statement/ledger-entry-info';
import { ClaimSettlementLedgerPaymentInstructionStatus } from '@app/models/enums/ledger-settings/claim-settlement-ledger-payment-instruction-status';
import { ClaimSettlementLedgerPayee } from '@app/models/ledger-settings';
import { Dictionary } from '@app/models/utils';
import { Hidable } from '@app/modules/shared/_functions/hidable';
import { AddressPipe } from '@app/modules/shared/_pipes';
import { GridHeaderCheckboxComponent } from '@app/modules/shared/grid/grid-header-checkbox/grid-header-checkbox.component';
import { GridHeaderValidationStatusComponent, IGridHeaderValidationStatusParams } from '@app/modules/shared/grid/grid-header-validation-status/grid-header-validation-status.component';
import { AsyncOperationsAwaitService, PermissionService } from '@app/services';
import { LedgerEntryService } from '@app/services/ledger-entry.service';
import { ofType } from '@ngrx/effects';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { QSF_ORG_NO_TRANSFER_ID } from '@app/helpers/payment-instructions-validation.helper';
import { IdValue } from '../../../../../../models/idValue';
import { PaymentInstruction } from '../../../../../../models/payment-instruction';
import * as actions from '../../../state/actions';
import { ClaimantDetailsState, IPaymentInstructionsState } from '../../../state/reducer';
import * as selectors from '../../../state/selectors';
import { PaymentInstructionsGridActionsRendererComponent } from './payment-instructions-grid-actions-renderer/payment-instructions-grid-actions-renderer.component';

const MAX_ROWS_NUMBER = 5;

@Component({
  selector: 'app-payment-instructions-grid',
  templateUrl: './payment-instructions-grid.component.html',
  styleUrls: ['./payment-instructions-grid.component.scss'],
})
export class PaymentInstructionsGridComponent extends ListView implements OnInit, OnChanges, OnDestroy {
  @Output()
  readonly validate = new EventEmitter<string[]>();

  @Output()
  readonly isTransferMethod = new EventEmitter<boolean>();

  @Input()
    paymentType: PaymentTypeEnum;

  @Input()
    ledgerEntry: LedgerEntryInfo;

  @Input()
    readonly: boolean;

  @Input()
    enableTransfer: boolean;

  @Input() public paymentServices: any[];

  @Input() public set defaultPayeeId(id: number) {
    if (this.ledgerEntry.accountNumber === LedgerAccountEnum.NetDistribution) {
      this._defaultPayeeId = id;
    }
  }

  public get defaultPayeeId(): number {
    return this._defaultPayeeId;
  }

  private _defaultPayeeId: number;

  public isTransferPayment: boolean = false;

  readonly paymentTypes = PaymentTypeEnum;
  readonly gridId = GridId.ClaimantPaymentInstructions;
  readonly claimantId$ = this.store.select(selectors.id);

  private readonly allPaymentMethods = [new IdValue(PaymentMethodEnum.Check, 'Check'), new IdValue(PaymentMethodEnum.Wire, 'Wire'), new IdValue(PaymentMethodEnum.DigitalPayment, 'Digital Payment')];
  private readonly selectablePaymentMethods = [new IdValue(PaymentMethodEnum.Check, 'Check'), new IdValue(PaymentMethodEnum.Wire, 'Wire')];
  private readonly paymentInstructions$ = this.store.select(selectors.paymentInstructions);
  private readonly payees$ = this.store.select(selectors.paymentInstructionPayees);

  readonly valid$ = this.paymentInstructions$.pipe(
    filter((paymentInstructions: IPaymentInstructionsState) => !!paymentInstructions),
    map((paymentInstructions: IPaymentInstructionsState) => paymentInstructions.amountIsValid
      && paymentInstructions.percentageIsValid
      && paymentInstructions.isFilled
      && paymentInstructions.defaultPaymentInstructionIsValid),
  );

  private readonly accountsWithGlobalTranferInstructions = ["51020"];

  private payees: SelectOption[] = [];
  private payeesInternal = new Dictionary<number, ClaimSettlementLedgerPayee>();
  private payeesInitialized = false;
  private targetAmount: number;
  private paymentInstructions: PaymentInstruction[];
  private paymentMethods: IdValue[];
  private claimantId: number;
  private tranferOrgs: TransferOrgs;

  private readonly colPayeeId = 'payeeEntityId';
  private readonly colPaymentMethodId = 'paymentMethodId';
  private readonly colPayeeAddressId = 'payeeAddressId';
  private readonly colCheckMemo = 'memoText';
  private readonly colPayeeBankAccountId = 'payeeBankAccountId';
  private readonly colPercentage = 'percentage';
  private readonly colAmount = 'amount';
  private readonly colPaymentTrackingStatus = 'paymentTrackingStatus';
  private readonly colReferenceNumber = 'referenceNumber';
  private readonly colTracking = 'tracking';
  private readonly colDateCreated = 'dateCreated';
  private readonly colDateSent = 'dateSent';
  private readonly colStatusName = 'statusName';
  private readonly colFurtherCreditAccount = 'furtherCreditAccount';
  private readonly colPayeeEmailId = 'payeeEmailId';
  private readonly decimalsCount = 10;
  private readonly colTransferQSFOrg = 'qsfOrgId';
  private readonly colTransferQSFBankAccount = 'qsfBankAccountId';
  private readonly colTransferFFC = 'transferFFC';
  private readonly colTransferMethod = 'transferMethod';
  private readonly colDefaultBankAccount = 'primaryBankAccountId';

  private readonly tranferColDef = [this.colTransferQSFOrg, this.colTransferQSFBankAccount, this.colTransferMethod, this.colTransferFFC];

  editEnabled = false;
  defaultPaymentInstructionIsValid: boolean;

  get isMaxRowsNumber(): boolean {
    return this?.gridApi?.getDisplayedRowCount() > MAX_ROWS_NUMBER;
  }

  get rowHeight(): string {
    const headerHeight = 45;
    return `${MAX_ROWS_NUMBER * AGGridHelper.defaultGridOptions.rowHeight + headerHeight}px`;
  }

  get gridClass(): string {
    return `${!this.isMaxRowsNumber ? 'ag-grid-custom-height-auto ag-grid-left-aligned' : ''}${this.isLoading ? ' grid-hidden' : ''}`;
  }

  get isLoading(): boolean {
    return !this.ledgerEntry || !this.payeesInitialized || this.asyncOperationsProcessing.inProcess;
  }

  get canSeeTransfer(): boolean {
    return this.permissionService.has(PermissionService.create(PermissionTypeEnum.FeatureFlag, PermissionActionTypeEnum.TransferToSubAccount));
  }

  get showTransferColums(): boolean {
    return (this.paymentType === PaymentTypeEnum.Default
      || this.paymentType === PaymentTypeEnum.Individual
      || this.paymentType === PaymentTypeEnum.Split
    )
    && this.canSeeTransfer
    && this.isTransferPayment;
  }

  readonly gridOptions: GridOptions = {
    getRowId: (data: any): string => `${data?.data?.id?.toString()}`,
    animateRows: false,
    columnDefs: [
      {
        width: 40,
        maxWidth: 40,
        checkboxSelection: true,
        headerComponent: GridHeaderCheckboxComponent,
        headerComponentParams: { gridId: this.gridId, floatingFilter: false, pinned: true },
        pinned: 'left',
        floatingFilter: false,
      },
      {
        headerName: 'Transfer to Sub-Account QSF',
        field: this.colTransferQSFOrg,
        minWidth: 250,
        ...AGGridHelper.nameColumnDefaultParams,
        editable: (): boolean => this.editEnabled && this.showTransferColums,
        cellRendererSelector: this.onQSFOrgCellRendererSelect.bind(this),
        hide: true,
      },
      {
        headerName: 'Method',
        field: this.colTransferMethod,
        minWidth: 100,
        ...AGGridHelper.nameColumnDefaultParams,
        editable: false,
        hide: true,
        cellRenderer: data => (data.data.qsfOrgId == QSF_ORG_NO_TRANSFER_ID ? '' : 'Transfer'),
      },
      {
        headerName: 'Transfer Bank Account',
        field: this.colTransferQSFBankAccount,
        minWidth: 140,
        ...AGGridHelper.nameColumnDefaultParams,
        editable: (params: EditableCallbackParams): boolean => {
          const instruction = params.data as PaymentInstruction;
          return this.editEnabled && this.showTransferColums && (instruction.qsfOrgId !== QSF_ORG_NO_TRANSFER_ID);
        },
        hide: true,
        cellRendererSelector: this.onTransferBankAccountCellRendererSelect.bind(this),
      },
      {
        headerName: 'Transfer Further Credit Account',
        field: this.colTransferFFC,
        ...AGGridHelper.nameColumnDefaultParams,
        editable: false,
        hide: true,
        cellRenderer: this.onTransferFFCAccountRender.bind(this),
      },
      {
        headerName: 'Final Payee',
        field: this.colPayeeId,
        minWidth: 250,
        cellRendererSelector: (params: ICellRendererParams): CellRendererSelectorResult => AGGridHelper.getDropdownRenderer({
          values: this.getUnselectedPayees(params.value),
          value: params.value,
          placeholder: 'Select Payee',
          disabledPlaceholder: true,
          defaultOption: params.data.payeeDto && this.ledgerEntryService.isPaid(this.ledgerEntry)
            ? { id: params.data.payeeDto.id, name: this.formatPayeeName(params.data.payeeDto) }
            : null,
        }),
        editable: (): boolean => this.editEnabled,
        cellClass: (): string => this.getEditableClass(),
      },
      {
        headerName: 'Name on Payment',
        field: 'nameOnPayment',
        cellRenderer: this.formatNameOnPayment.bind(this),
        ...AGGridHelper.nameColumnDefaultParams,
        editable: false,
      },
      {
        headerName: 'Method',
        field: this.colPaymentMethodId,
        minWidth: 150,
        cellRendererSelector: (params: ICellRendererParams): CellRendererSelectorResult => AGGridHelper.getDropdownRenderer({
          values: this.paymentMethods,
          value: params.value,
          placeholder: 'Select Method',
          disabledPlaceholder: true,
        }),
        editable: (): boolean => this.editEnabled,
        cellClass: (): string => this.getEditableClass(),
      },
      {
        headerName: 'Bank Account',
        field: this.colPayeeBankAccountId,
        minWidth: 140,
        cellRendererSelector: this.onBankAccountCellRendererSelect.bind(this),
        editable: (params: EditableCallbackParams): boolean => {
          const instruction = params.data as PaymentInstruction;
          const payee = this.payeesInternal.getValue(instruction.payeeEntityId);
          return this.editEnabled && instruction.paymentMethodId === PaymentMethodEnum.Wire && (!payee || payee.entityType === EntityTypeEnum.Organizations);
        },
        cellClass: (): string => this.getEditableClass(),
      },
      {
        headerName: 'Address',
        field: this.colPayeeAddressId,
        minWidth: 140,
        cellRendererSelector: this.onAddressCellRendererSelect.bind(this),
        editable: (params: EditableCallbackParams): boolean => this.editEnabled && (params.data as PaymentInstruction).paymentMethodId === PaymentMethodEnum.Check,
        cellClass: (): string => this.getEditableClass(),
        autoHeight: true,
        wrapText: true,
      },
      {
        headerName: 'Email',
        field: this.colPayeeEmailId,
        minWidth: 140,
        cellRendererSelector: this.onEmailCellRendererSelect.bind(this),
        editable: (params: EditableCallbackParams): boolean => this.editEnabled && (params.data as PaymentInstruction).paymentMethodId === PaymentMethodEnum.DigitalPayment,
        cellClass: (): string => this.getEditableClass(),
        headerComponent: GridHeaderValidationStatusComponent,
        headerComponentParams: this.getValidationStatusParams(this.colPayeeEmailId),
        autoHeight: true,
        wrapText: true,
      },
      {
        headerName: 'Percent',
        field: this.colPercentage,
        cellRendererSelector: (params: ICellRendererParams): CellRendererSelectorResult => AGGridHelper.getTextBoxRenderer({
          value: params.value,
          type: TextboxEditorRendererDataType.Percentage,
          decimalsCount: this.decimalsCount,
        }),
        editable: (): boolean => this.editEnabled && this.paymentType === PaymentTypeEnum.Split,
        cellClass: (): string => this.getEditableOrHiddenClass((this.paymentType === PaymentTypeEnum.Split || this.paymentType === PaymentTypeEnum.Default)),
        headerComponent: GridHeaderValidationStatusComponent,
        headerComponentParams: this.getValidationStatusParams(this.colPercentage),
        width: 80,
      },
      {
        headerName: 'Amount',
        field: this.colAmount,
        cellRendererSelector: (params: ICellRendererParams): CellRendererSelectorResult => AGGridHelper.getTextBoxRenderer({
          value: params.value,
          type: TextboxEditorRendererDataType.Decimal,
        }),
        editable: (): boolean => this.editEnabled && this.paymentType === PaymentTypeEnum.Split,
        cellClass: (): string => this.getEditableClass((this.paymentType === PaymentTypeEnum.Split || this.paymentType === PaymentTypeEnum.Default)),
        headerComponent: GridHeaderValidationStatusComponent,
        headerComponentParams: this.getValidationStatusParams(this.colAmount),
        ...AGGridHelper.amountColumnDefaultParams,
        ...{ cellStyle: { 'text-align': 'right' } },
      },
      {
        headerName: 'Further Credit Acct',
        field: this.colFurtherCreditAccount,
        ...AGGridHelper.nameColumnDefaultParams,
        editable: false,
        cellRenderer: this.onFFCAccountRender.bind(this),
      },
      {
        headerName: 'Check Memo',
        field: this.colCheckMemo,
        width: 170,
        cellRendererSelector: this.onCheckMemoCellRenderer.bind(this),
        editable: (): boolean => this.editEnabled,
        cellClass: (): string => this.getEditableClass(),
      },
      {
        headerName: 'Note',
        field: 'description',
        cellRenderer: 'textBoxRenderer',
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        editable: (): boolean => this.editEnabled,
        cellClass: (): string => (this.getEditableClass()),
      },
      {
        headerName: 'Status',
        field: this.colStatusName,
        ...AGGridHelper.nameColumnDefaultParams,
        editable: false,
      },
      AGGridHelper.getActionsColumn({
        deleteHandler: this.onDelete.bind(this),
        hidden: this.isDeleteButtonHidden.bind(this),
      }, 70),
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
      buttonRenderer: PaymentInstructionsGridActionsRendererComponent,
    },
    onCellValueChanged: this.onCellValueChanged.bind(this),
    suppressClickEdit: true,
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    pagination: false,
    suppressRowClickSelection: true,
  };

  constructor(
    private readonly store: Store<ClaimantDetailsState>,
    private readonly addressPipe: AddressPipe,
    private readonly asyncOperationsProcessing: AsyncOperationsAwaitService,
    public readonly ledgerEntryService: LedgerEntryService,
    public readonly permissionService: PermissionService,
    public readonly actionsSubj: ActionsSubject,
    router: Router,
    elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  ngOnInit(): void {
    this.updatePaymentMethods();
    this.payees$.pipe(
      filter((items: ClaimSettlementLedgerPayee[]) => !!items),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((payees: ClaimSettlementLedgerPayee[]) => {
      this.payees.splice(0);
      this.payeesInternal.clear();
      payees.forEach((item: ClaimSettlementLedgerPayee) => this.payeesInternal.setValue(item.id, item));

      const payOnBehalfOfList = payees.filter((item: ClaimSettlementLedgerPayee) => item.entityType === EntityTypeEnum.ClientContactOnCheck)
        .sort((a, b) => a.displayName.localeCompare(b.displayName));

      const regularPayeesList = payees.filter((item: ClaimSettlementLedgerPayee) => item.entityType !== EntityTypeEnum.ClientContactOnCheck)
        .sort((a, b) => a.displayName.localeCompare(b.displayName));

      [...payOnBehalfOfList, ...regularPayeesList].forEach((item: ClaimSettlementLedgerPayee) => {
        this.payees.push({ id: item.id, name: this.formatPayeeName(item), disabled: item.deleted, active: item.active, icon: IconHelper.getPayOnBehalfCheckSymbol(item.entityType) });
      });
      this.payeesInitialized = true;
    });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(actions.GetDefaultPayeesForLedgerEntrySuccess),
    ).subscribe(data => {
      this.isTransferPayment = !!data.payees.transferToSubAccount;
      this.isTransferMethod.emit(this.isTransferPayment);
      this.onUpdateVisibilityTransferColumns();
    });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(actions.GetTransferOrgAndAccountsForClaimantSuccess),
    ).subscribe(data => {
      this.tranferOrgs = data.transferOrgs;
      if (this.accountsWithGlobalTranferInstructions.indexOf(this.ledgerEntry.accountNumber) > -1)
        this.store.dispatch(actions.GetGlobalTransferOrgAndAccounts());
    });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(actions.GetGlobalTransferOrgAndAccountsSuccess),
    ).subscribe(data => {
      this.tranferOrgs.qsfOrgs.push(...data.transferOrgs.qsfOrgs);
      this.tranferOrgs.qsfBankAccounts.push(...data.transferOrgs.qsfBankAccounts);
      // Force the redraw to pick new bank accounts and orgs
      this.gridApi?.redrawRows();
    });

    this.claimantId$
      .pipe(
        filter(claimantId => !!claimantId),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(claimantId => {
        this.claimantId = claimantId;
        if (this.canSeeTransfer) {
          this.store.dispatch(actions.GetTransferOrgAndAccountsForClaimant({ id: this.claimantId }));
        }
      });

    this.ledgerEntry.paymentInstructions?.forEach(pi => {
      if (this.enableTransfer && pi.qsfOrgId == null) {
        pi.qsfOrgId = QSF_ORG_NO_TRANSFER_ID;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.ledgerEntry && this.ledgerEntry) {
      this.paymentType = !CommonHelper.isNullOrUndefined(this.ledgerEntry.splitTypeId) ? this.ledgerEntry.splitTypeId : PaymentTypeEnum.Default;
      this.store.dispatch(actions.InitializePaymentInstructions({
        paymentType: this.paymentType,
        ledgerEntry: this.ledgerEntry,
        decimalsCount: this.decimalsCount,
      }));
      this.getPayees(this.paymentType);
    }
    if (changes.paymentType && !changes.paymentType.firstChange) {
      const initialPaymentType = !CommonHelper.isNullOrUndefined(this.ledgerEntry.splitTypeId) ? this.ledgerEntry.splitTypeId : PaymentTypeEnum.Default;
      this.store.dispatch(actions.UpdatePaymentType({ paymentType: this.paymentType }));

      if ((changes.paymentType.previousValue === PaymentTypeEnum.Default || changes.paymentType.currentValue === PaymentTypeEnum.Default)
        && (changes.paymentType.currentValue !== initialPaymentType)) {
        this.getPayees(this.paymentType);
        this.asyncOperationsProcessing.add([
          actions.GetDefaultPayeesForLedgerEntrySuccess.type,
          actions.GetPayeesForLedgerEntrySuccess.type,
          actions.GetTransferOrgAndAccountsForClaimantSuccess.type,
          actions.GetGlobalTransferOrgAndAccountsSuccess.type,
          actions.Error.type,
        ]);
      }

      if (changes.paymentType.currentValue === initialPaymentType && !!changes.paymentType.previousValue) {
        this.store.dispatch(actions.GetLedgerEntryInfo({ id: this.ledgerEntry.id }));
        this.asyncOperationsProcessing.add([
          actions.GetLedgerEntryInfoSuccess.type,
          actions.Error.type,
        ]);
      }
    }
    if (changes.enableTransfer && changes.enableTransfer.currentValue != null) {
      this.isTransferPayment = changes.enableTransfer.currentValue;
      if (!this.isTransferPayment) {
        this.paymentInstructions.forEach((pi: PaymentInstruction) => {
          pi.qsfBankAccountId = null;
          pi.qsfOrgId = null;
        });
      }
      this.paymentInstructions[0].transferToSubAccount = this.isTransferPayment;
    }
    this.editEnabled = this.paymentType !== PaymentTypeEnum.Default && !this.readonly;
    this.onUpdateVisibilityTransferColumns();
    this.updatePaymentMethods();
  }

  private updatePaymentMethods(): void {
    if (this.ledgerEntry.accountNumber === LedgerAccountEnum.NetDistribution) {
      this.paymentMethods = this.allPaymentMethods;
    } else {
      this.paymentMethods = this.selectablePaymentMethods;
    }
  }

  ngOnDestroy(): void {
    this.store.dispatch(commonActions.UpdateActionBar({ actionBar: null }));
    super.ngOnDestroy();
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;
  }

  onAdd(): void {
    this.store.dispatch(actions.AddPaymentInstruction({ id: CommonHelper.createEntityUniqueId() }));
  }

  onGridReady(gridApi: GridApi): void {
    super.gridReady(gridApi);
    this.paymentInstructions$.pipe(
      filter((state: IPaymentInstructionsState) => !!state && !!state.items),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((state: IPaymentInstructionsState) => {
      this.targetAmount = state.amount;
      this.paymentInstructions = state.items;
      if ((this.paymentType === PaymentTypeEnum.Individual || this.paymentType === PaymentTypeEnum.Split)
        && this.canSeeTransfer) {
        this.isTransferPayment = this.paymentInstructions.some((pi: PaymentInstruction) => pi.qsfOrgId != null);
        this.isTransferMethod.emit(this.isTransferPayment);
        this.onUpdateVisibilityTransferColumns();
      }

      if (this.isTransferPayment) {
        this.paymentInstructions.forEach((pi: PaymentInstruction) => {
          if (pi.id > 0 && !pi.qsfOrgId) {
            pi.qsfOrgId = QSF_ORG_NO_TRANSFER_ID;
          }
        });
      }

      this.gridApi.setGridOption('rowData', state.items);
      this.gridApi.refreshHeader();
      this.applySavedGridSettings();
      this.validatePaymentInstructions(state);
      this.hideCheckboxOrSetAllToChecked();
    });
  }

  private hideCheckboxOrSetAllToChecked(): void {
    this.gridApi.forEachNode((rowNode: RowNode) => {
      if (rowNode.data && rowNode.data.id) {
        if (rowNode.data.statusId === ClaimSettlementLedgerPaymentInstructionStatus.PaymentAuthorized
          || rowNode.data.statusId === ClaimSettlementLedgerPaymentInstructionStatus.PaymentProcessing
          || rowNode.data.statusId === ClaimSettlementLedgerPaymentInstructionStatus.Paid
          || rowNode.data.statusId === ClaimSettlementLedgerEntryStatus.PaymentAuthorized
          || !rowNode.data.statusId) {
          rowNode.setRowSelectable(false);
        }
        if (rowNode.data.statusId === ClaimSettlementLedgerPaymentInstructionStatus.Pending
          || rowNode.data.statusId === ClaimSettlementLedgerPaymentInstructionStatus.Void
          || rowNode.data.statusId === ClaimSettlementLedgerEntryStatus.Pending) {
          this.gridApi.setNodesSelected({ nodes: [rowNode], newValue: true });
        }
      }
    });
  }
  private onQSFOrgCellRendererSelect(params: ICellRendererParams): CellRendererSelectorResult {
    const payee = this.getPayee(params);
    const qsfOrgsById = this.tranferOrgs ? this.tranferOrgs.qsfOrgs : null;
    const options = qsfOrgsById
      ? SelectHelper.toOptions(
        qsfOrgsById,
        (option: Org) => option.id,
        (option: Org) => option.name,
      )
      : [];
    if (this.paymentType == PaymentTypeEnum.Split) {
      options.unshift({
        id: QSF_ORG_NO_TRANSFER_ID,
        name: 'No Transfer',
      });
    }
    const comboBox = {
      component: 'dropdownRenderer',
      params: {
        values: options,
        value: params.value,
        placeholder: 'Select QSF Sub-Account',
        defaultOption: this.defaultQSFOrgRenderer(params, payee),
      } as IDropdownEditorRendererParams,
    };
    return comboBox;
  }

  private defaultQSFOrgRenderer(params, payee): IdValue {
    if (!payee) return null;

    if (this.paymentType === PaymentTypeEnum.Default) {
      return new IdValue(payee.qsfOrgId, payee.qsfOrgName);
    }

    if (params.data.transferQSFOrg && this.tranferOrgs.qsfOrgs) {
      const org = this.tranferOrgs.qsfOrgs.find(x => x.id === params.data.transferQSFOrg);
      if (org) {
        return new IdValue(org.id, org.name);
      }
      return null;
    }

    return null;
  }

  private onFFCAccountRender(params: ICellRendererParams): string {
    if (this.paymentType === PaymentTypeEnum.Default) {
      return params.data.furtherCreditAccount;
    }
    if (params.data.payeeBankAccountId) {
      const payee = this.getPayee(params);
      if (payee != null) {
        const bankAccount = payee.bankAccounts.find(x => x.id === params.data.payeeBankAccountId);
        return bankAccount?.ffcAccount || '';
      }
      return '';
    }

    return '';
  }

  private onTransferFFCAccountRender(params: ICellRendererParams): string {
    if (this.paymentType === PaymentTypeEnum.Default) {
      return params.data.transferFFC;
    }

    if (params.data.qsfBankAccountId && this.tranferOrgs) {
      const bankAccount = this.tranferOrgs.qsfBankAccounts.find(x => x.id === params.data.qsfBankAccountId);
      if (bankAccount) {
        return bankAccount.ffcAccount;
      }
      return '';
    }
    return '';
  }

  private onTransferBankAccountCellRendererSelect(params: ICellRendererParams): CellRendererSelectorResult {
    const payee = this.getPayee(params);
    const bankAccountsById = this.tranferOrgs ? this.tranferOrgs.qsfBankAccounts.filter(x => x.orgId === params.data.qsfOrgId) : null;
    const comboBox = {
      component: 'dropdownRenderer',
      params: {
        values: bankAccountsById
          ? SelectHelper.toOptions(
            bankAccountsById,
            (option: BankAccount) => option.id,
            (option: BankAccount) => this.formatBankAccountName(option.name, option.accountNumber),
          )
          : [],
        value: params.value,
        placeholder: 'Select Bank Account',
        defaultOption: this.defaultTransferBankAccountRenderer(params, payee),
      } as IDropdownEditorRendererParams,
    };
    return comboBox;
  }

  private defaultTransferBankAccountRenderer(params, payee): IdValue {
    if (!payee) return null;

    if (this.paymentType === PaymentTypeEnum.Default) {
      return new IdValue(payee.qsfBankAccountId, this.formatBankAccountName(payee.qsfBankAccountName, payee.qsfBankAccountNumber));
    }
    if (params.data.qsfBankAccountId && this.tranferOrgs.qsfBankAccounts) {
      const bankAccount = this.tranferOrgs.qsfBankAccounts.find(x => x.id === params.data.qsfBankAccountId);
      if (bankAccount) {
        return new IdValue(bankAccount.id, this.formatBankAccountName(bankAccount.name, bankAccount.accountNumber));
      }
      return null;
    }

    return null;
  }

  private onBankAccountCellRendererSelect(params: ICellRendererParams): CellRendererSelectorResult {
    const payee = this.getPayee(params);
    const bankAccountsById = payee ? payee.bankAccounts : null;
    const comboBox = {
      component: 'dropdownRenderer',
      params: {
        values: bankAccountsById
          ? SelectHelper.toOptions(
            bankAccountsById,
            (option: BankAccount) => option.id,
            (option: BankAccount) => this.formatBankAccountName(option.name, option.accountNumber),
          )
          : [],
        value: params.value,
        placeholder: 'Select Bank Account',
        defaultOption: this.defaultBankAccountRenderer(params, payee),
      } as IDropdownEditorRendererParams,
    };
    return comboBox;
  }

  private defaultBankAccountRenderer(params, payee): IdValue {
    if (!payee) {
      return null;
    }

    if (this.paymentType === PaymentTypeEnum.Default) {
      return new IdValue(payee.primaryBankAccountId, this.formatBankAccountName(payee.bankAccountName, payee.bankAccountNumber));
    }

    if (params.data.bankAccount && this.ledgerEntryService.isPaid(this.ledgerEntry)) {
      return new IdValue(params.data.bankAccount.id, this.formatBankAccountName(params.data.bankAccount.name, params.data.bankAccount.accountNumber));
    }

    return null;
  }

  private onAddressCellRendererSelect(params: ICellRendererParams): CellRendererSelectorResult {
    const payee = this.getPayee(params);
    const addressesById = payee ? payee.addresses : null;
    const comboBox = {
      component: 'dropdownRenderer',
      params: {
        values: addressesById ? SelectHelper.toOptions(addressesById, (item: Address) => item.id, (item: Address) => this.addressPipe.transform(item)) : [],
        value: params.value,
        placeholder: 'Select Address',
        defaultOption: this.defaultAddressRenderer(params, payee),
      } as IDropdownEditorRendererParams,
    };
    return comboBox;
  }

  private defaultAddressRenderer(params, payee): IdValue {
    if (!payee) {
      return null;
    }

    if (this.paymentType === PaymentTypeEnum.Default) {
      return new IdValue(payee.primaryAddressId, this.addressPipe.transform(Address.toModel(payee)));
    }

    if (params.data.address && this.ledgerEntryService.isPaid(this.ledgerEntry)) {
      return new IdValue(params.data.address.id, this.addressPipe.transform(params.data.address));
    }

    return null;
  }

  private onEmailCellRendererSelect(params: ICellRendererParams): CellRendererSelectorResult {
    const payee = this.getPayee(params);
    const emails = payee ? payee.emails : null;
    const comboBox = {
      component: 'dropdownRenderer',
      params: {
        values: emails
          ? SelectHelper.toOptions(
            emails,
            (option: Email) => option.id,
            (option: Email) => option.email,
          )
          : [],
        value: params.value,
        placeholder: 'Select Email',
        defaultOption: this.defaultEmailRenderer(params, payee),
      } as IDropdownEditorRendererParams,
    };
    return comboBox;
  }

  private defaultEmailRenderer(params, payee): IdValue {
    if (!payee) {
      return null;
    }

    if (this.ledgerEntry.accountNumber === LedgerAccountEnum.NetDistribution) {
      if (this.paymentType === PaymentTypeEnum.Default
          && payee.defaultPaymentMethodId === PaymentMethodEnum.DigitalPayment) {
        return new IdValue(payee.primaryEmailId, payee.emails?.find((e: Email) => e.id === payee.primaryEmailId)?.email || '');
      }

      if (params.data.email && params.data.paymentMethodId === PaymentMethodEnum.DigitalPayment) {
        return new IdValue(params.data.primaryEmailId, payee.emails?.find((e: Email) => e.id === payee.primaryEmailId)?.email || '');
      }
    }

    return null;
  }

  private onCheckMemoCellRenderer(params: ICellRendererParams): CellRendererSelectorResult {
    const instructionMemo = params.data.memoText;
    const payee = this.getPayee(params);
    const defaultMemo = payee ? payee.memoText : null;
    const comboBox = {
      component: 'textBoxRenderer',
      params: { value: instructionMemo || defaultMemo } as ITextboxEditorRendererParams,
    };
    return comboBox;
  }

  private getPayees(paymentType: number): void {
    if (!this.ledgerEntry || !this.ledgerEntry.isPaymentEnabledVisible) {
      return;
    }
    if (paymentType !== PaymentTypeEnum.Default) {
      this.store.dispatch(actions.GetPayeesForLedgerEntry({ id: this.ledgerEntry.id }));
    } else {
      this.store.dispatch(actions.GetDefaultPayeesForLedgerEntry({ id: this.ledgerEntry.id }));
    }
  }

  private onDelete(data: PaymentInstruction): void {
    this.store.dispatch(actions.DeletePaymentInstruction({ id: data.id, paymentType: this.paymentType }));
  }

  private getPayee(params: ICellRendererParams): ClaimSettlementLedgerPayee {
    const paymentInstruction = params.data as PaymentInstruction;
    const payee = this.payeesInternal.getValue(paymentInstruction.payeeEntityId);
    return payee;
  }

  private getValidationStatusParams(column: string): IGridHeaderValidationStatusParams {
    return {
      getStatus: () => this.paymentInstructions$.pipe(
        map((state: IPaymentInstructionsState) => {
          if (!state) {
            return ValidationStatus.Ok;
          }
          let result: boolean;
          switch (column) {
            case this.colPercentage:
              result = state.percentageIsValid;
              break;
            case this.colAmount:
              result = state.amountIsValid;
              break;
            case this.colPayeeEmailId:
              result = this.ledgerEntry.accountNumber === LedgerAccountEnum.NetDistribution ? state.emailIsValid : true;
              break;
            default:
              break;
          }

          return result ? ValidationStatus.Ok : ValidationStatus.Error;
        }),
      ),
    };
  }

  private onCellValueChanged(event: CellValueChangedEvent): void {
    let updatedPaymentInstruction: PaymentInstruction;
    const rowData = event.data as PaymentInstruction;
    const colId = event.column.getColId();
    switch (colId) {
      case this.colPayeeId:
      {
        // Set default payment method if it is set for the provided payee
        const payee = this.payeesInternal.getValue(rowData.payeeEntityId);

        updatedPaymentInstruction = {
          ...rowData,
          payeeEntityTypeId: payee?.entityType,
          payeeAddressId: null,
          memoText: null,
          payeeBankAccountId: null,
          payeeEmailId: null,
          description: null,
          percentage: payee ? payee.percentage : null,
          amount: payee?.amount,
          furtherCreditAccount: payee?.furtherCreditAccount,
        };

        this.updateIfEntryIsClientContactInNetSplit(updatedPaymentInstruction);
        if (this.paymentType === PaymentTypeEnum.Individual) {
          updatedPaymentInstruction.percentage = 1;
          updatedPaymentInstruction.amount = this.ledgerEntry.amount;
        }

        // Set default payment method every time when a new payee is selected.
        if (payee?.defaultPaymentMethodId) {
          updatedPaymentInstruction.paymentMethodId = payee?.defaultPaymentMethodId;
        } else {
          updatedPaymentInstruction.paymentMethodId = null; // reset value in case if default value doesn't exist.
        }

        if (!CommonHelper.isNullOrUndefined(rowData.payeeEntityId)
            && !CommonHelper.isNullOrUndefined(updatedPaymentInstruction.paymentMethodId)) {
          this.setDefaultData(updatedPaymentInstruction, payee);
        }
        break;
      }
      case this.colPercentage:
      {
        const amount = Math.round(this.ledgerEntry.amount * rowData.percentage * 100) / 100;
        if (amount !== rowData.amount || this.ledgerEntry.amount === 0) {
          updatedPaymentInstruction = { ...rowData };
          updatedPaymentInstruction.amount = this.distributePenny(amount, +updatedPaymentInstruction.percentage, updatedPaymentInstruction.id);
        }
        break;
      }
      case this.colAmount:
      {
        if (this.ledgerEntry.amount === 0) {
          updatedPaymentInstruction = { ...rowData };
        } else {
          const percentage = Math.round((rowData.amount / this.ledgerEntry.amount) * 10000) / 10000;

          if (percentage !== rowData.percentage) {
            updatedPaymentInstruction = { ...rowData };
            updatedPaymentInstruction.percentage = percentage;
          }
        }
        break;
      }
      case this.colPaymentMethodId: {
        const payee = this.payeesInternal.getValue(rowData.payeeEntityId);
        updatedPaymentInstruction = { ...rowData };
        this.setDefaultData(updatedPaymentInstruction, payee);
        break;
      }
      case this.colFurtherCreditAccount:
      case this.colPayeeBankAccountId:
      case this.colPayeeAddressId:
      case this.colPayeeEmailId:
      case this.colCheckMemo:
      case this.colTransferQSFBankAccount: {
        updatedPaymentInstruction = { ...rowData };
        break;
      }
      case this.colTransferQSFOrg: {
        updatedPaymentInstruction = { ...rowData };
        updatedPaymentInstruction.qsfBankAccountId = null;
        break;
      }
      default:
        break;
    }
    if (updatedPaymentInstruction) {
      this.store.dispatch(actions.UpdatePaymentInstruction({ paymentInstruction: updatedPaymentInstruction }));
    }
  }

  private onUpdateVisibilityTransferColumns(): void {
    if (this.gridOptions?.columnDefs && this.gridApi) {
      this.gridApi.setColumnsVisible(this.tranferColDef, this.showTransferColums);
    }
  }

  private updateIfEntryIsClientContactInNetSplit(updatedPaymentInstruction: PaymentInstruction): void {
    const entryIsClientContactInNetSplit = this.paymentType === PaymentTypeEnum.Split
            && this.ledgerEntry.accountNumber === LedgerAccountEnum.NetDistribution
            && (
              updatedPaymentInstruction.payeeEntityTypeId === EntityTypeEnum.ClientContacts
              || updatedPaymentInstruction.payeeEntityTypeId === EntityTypeEnum.ClientContactOnCheck);

    if (entryIsClientContactInNetSplit
          && updatedPaymentInstruction.percentage != null
          && updatedPaymentInstruction.amount == null) {
      const amount = Math.round(this.ledgerEntry.amount * updatedPaymentInstruction.percentage * 100) / 100;
      updatedPaymentInstruction.amount = this.distributePenny(amount, +updatedPaymentInstruction.percentage, updatedPaymentInstruction.id);
    }

    if (entryIsClientContactInNetSplit
          && updatedPaymentInstruction.percentage == null
          && updatedPaymentInstruction.amount != null
          && this.ledgerEntry.amount !== 0) {
      const percentage = Math.round((updatedPaymentInstruction.amount / this.ledgerEntry.amount) * 10000) / 10000;
      updatedPaymentInstruction.percentage = percentage;
    }
  }

  private distributePenny(newAmount: number, newPercentage: number, id: number): number {
    if (this.paymentInstructions?.length <= 1) {
      return newAmount;
    }

    const otherInstructions = this.paymentInstructions.filter((i: PaymentInstruction) => i.id !== id);

    let totalPercent = otherInstructions
      .map((e: PaymentInstruction) => +e.percentage)
      .reduce((a: number, b: number) => a + b, 0);
    totalPercent += newPercentage;

    if (totalPercent !== 1) {
      return newAmount;
    }

    let sum = otherInstructions
      .map((e: PaymentInstruction) => +e.amount)
      .reduce((a: number, b: number) => a + b, 0);
    sum += newAmount;

    const penny = CurrencyHelper.round(this.targetAmount - sum);

    return newAmount + penny;
  }

  private setDefaultData(updatedPaymentInstruction: PaymentInstruction, payee: ClaimSettlementLedgerPayee): void {
    switch (updatedPaymentInstruction.paymentMethodId) {
      case PaymentMethodEnum.Check:
        updatedPaymentInstruction.payeeBankAccountId = null;
        updatedPaymentInstruction.payeeAddressId = payee?.primaryAddressId || null;
        updatedPaymentInstruction.payeeEmailId = null;
        updatedPaymentInstruction.furtherCreditAccount = null;
        break;
      case PaymentMethodEnum.Wire:
        updatedPaymentInstruction.payeeAddressId = null;
        updatedPaymentInstruction.payeeBankAccountId = payee?.primaryBankAccountId || null;
        updatedPaymentInstruction.payeeEmailId = null;
        updatedPaymentInstruction.furtherCreditAccount = payee?.furtherCreditAccount || null;
        break;
      case PaymentMethodEnum.DigitalPayment:
        updatedPaymentInstruction.payeeAddressId = null;
        updatedPaymentInstruction.payeeBankAccountId = null;
        updatedPaymentInstruction.payeeEmailId = payee?.primaryEmailId || null;
        updatedPaymentInstruction.furtherCreditAccount = null;
        break;
      default:
        break;
    }
  }

  private validatePaymentInstructions(state: IPaymentInstructionsState): void {
    if (!state) {
      return;
    }
    const errors = [];

    this.defaultPaymentInstructionIsValid = state.defaultPaymentInstructionIsValid;
    if (!state.defaultPaymentInstructionIsValid) {
      errors.push('The system could not find default payment information for this entry.');
    }
    if (!state.isFilled) {
      state.items.forEach((item: PaymentInstruction, index: number) => {
        let entity: string;
        switch (item.paymentMethodId) {
          case PaymentMethodEnum.Check:
            if (CommonHelper.isNullOrUndefined(item.payeeAddressId) || CommonHelper.isBlank(item.payeeAddressId.toString())) {
              entity = 'Address';
            }
            break;
          case PaymentMethodEnum.Wire:
            if (CommonHelper.isNullOrUndefined(item.payeeBankAccountId) || CommonHelper.isBlank(item.payeeBankAccountId.toString())) {
              entity = 'Bank Account';
            }
            break;
          case PaymentMethodEnum.DigitalPayment:
            if (CommonHelper.isNullOrUndefined(item.payeeEmailId) || CommonHelper.isBlank(item.payeeEmailId.toString())) {
              entity = 'Email';
            }
            break;
        }
        if (entity) {
          errors.push(`${entity} is required in row # ${index + 1}.`);
        }

        if ((item.transferToSubAccount ?? !!item.qsfOrgId)
          && item.qsfOrgId !== QSF_ORG_NO_TRANSFER_ID
          && CommonHelper.isNullOrUndefined(item.qsfBankAccountId)
        ) {
          errors.push(`Transfer Bank Account is required in row # ${index + 1}.`);
        }
      });
    }
    if (!state.percentageIsValid) {
      errors.push('Payee split percentages must equal 100%');
    }
    if (!state.amountIsValid) {
      errors.push(`Payee split amounts must equal ${CurrencyHelper.toUsdFormat({ value: state.amount })}`);
    }

    const deletedPayee = state.items.find((item: PaymentInstruction) => item.payeeNotExist);
    if (deletedPayee) {
      errors.push('Payment Instructions validation error: the Payee does not exist.');
    }

    this.validate.emit(errors);
  }

  private getUnselectedPayees(currentPayeeId: number): SelectOption[] {
    const payees = [];
    const allowMultiplePI = this.paymentType === PaymentTypeEnum.Split
        && (
          Object.values(AttyFirmFees).includes(this.ledgerEntry.accountNumber)
          || this.ledgerEntry.accountGroup === LedgerAccountGroup.AttyExpenses
          || this.ledgerEntry.accountGroup === LedgerAccountGroup.ARCHERFees
        );

    this.gridApi.forEachNode((node: RowNode) => {
      if (node.data[this.colPayeeId]) {
        if (allowMultiplePI) {
          if (node.data.payeeEntityTypeId !== EntityTypeEnum.Organizations) {
            payees.push(node.data[this.colPayeeId]);
          }
        } else {
          payees.push(node.data[this.colPayeeId]);
        }
      }
    });
    // returns an array of payees that can be selected and the current cell value
    return this.payees.filter((payee: SelectOption) => !payees.some((item: number | string) => item === payee.id) || currentPayeeId === payee.id);
  }

  private isDeleteButtonHidden(): boolean {
    return this.paymentType === PaymentTypeEnum.Default
      || this.ledgerEntryService.isPaid(this.ledgerEntry)
      || (this.paymentType === PaymentTypeEnum.Individual && this.gridApi.getDisplayedRowCount() === 1);
  }

  private formatNameOnPayment(data: ICellRendererParams): string {
    const payee = this.getPayee(data);
    // If payee to Org and nameOnCheck is not empty
    if (payee?.entityType === EntityTypeEnum.Organizations && !StringHelper.isEmpty(payee?.nameOnCheck)) {
      return payee.nameOnCheck;
    }
    if (payee?.displayName) {
      return this.formatDisplayName(payee);
    }
    return data.value ?? '-';
  }

  private formatPayeeName(payee: ClaimSettlementLedgerPayee): string {
    if (payee.entityType === EntityTypeEnum.ClientContactOnCheck) {
      const payeeOnCheck = this.payeesInternal.getValue(Math.abs(payee.id));
      return !payee ? '' : `${payee.displayName} (Payee of ${this.formatDisplayName(payeeOnCheck)})`;
    }
    return !payee ? '' : `${this.formatDisplayName(payee)}${payee.role ? ` - ${payee.role}` : ''}`;
  }

  private formatDisplayName(payee: ClaimSettlementLedgerPayee): string {
    return !payee ? '' : `${payee.displayName}${payee.suffix ? `, ${payee.suffix}` : ''}`;
  }

  private formatBankAccountName(name: string, accountNumber: string): string {
    return !name ? '' : `${name}, ${Hidable.hideNumber(accountNumber?.toString(), 9)}`;
  }
}
