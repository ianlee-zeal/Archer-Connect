import { Component, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
  CellClassParams,
  CellRendererSelectorResult,
  CellValueChangedEvent,
  EditableCallbackParams,
  GridApi,
  GridOptions,
  ICellRendererParams,
  ITooltipParams,
  RedrawRowsParams,
  TabToNextCellParams,
  ValueFormatterParams,
  ValueGetterParams,
} from 'ag-grid-community';
import { Store } from '@ngrx/store';
import { filter, takeUntil } from 'rxjs/operators';

import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { CheckboxEditorRendererComponent } from '@app/modules/shared/_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import { TextboxEditorRendererComponent, TextboxEditorRendererDataType } from '@app/modules/shared/_renderers/textbox-editor-renderer/textbox-editor-renderer.component';
import { DropdownEditorRendererComponent, IDropdownEditorRendererParams } from '@app/modules/shared/_renderers/dropdown-editor-renderer/dropdown-editor-renderer.component';
import { PermissionService, ToastService } from '@app/services';
import { LedgerAccountEnum, LedgerAccountGroup, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';

import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import * as commonActions from '@app/modules/projects/state/actions';
import { ChartOfAccountProjectConfig, ChartOfAccountMode, Project } from '@app/models';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { CommonHelper } from '@app/helpers';
import { SelectHelper } from '@app/helpers/select.helper';
import { ModalEditorRendererComponent } from '@app/modules/shared/_renderers/modal-editor-renderer/modal-editor-renderer.component';
import * as sharedActions from '@app/modules/shared/state/entity-selection-modal/actions';
import { OrganizationSelectionModalComponent } from '@app/modules/shared/entity-selection-modal/organization-selection-modal.component';
import { DisbursementMode } from '@app/models/enums/disbursement-mode.enum';
import { ChartOfAccountName } from '@app/models/enums/chart-of-account-name.enum';
import { ChartOfAccountId } from '@app/models/enums/chart-of-account-id.enum';
import { ChartOfAccountMode as ChartOfAccountModeEnum } from '@app/models/enums/chart-of-account-mode.enum';
import { StringHelper } from '../../../helpers/string.helper';
import { Dictionary, IDictionary } from '../../../models/utils/dictionary';
import { ProjectsCommonState } from '../state/reducer';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import { ChartOfAccountSettingsService } from './chart-of-account-settings.service';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { CustomInnerHeaderComponent } from '@app/modules/shared/custome-header-icon/custom-inner-header.component';

@Component({
  selector: 'app-project-chart-of-accounts',
  templateUrl: './project-chart-of-accounts.component.html',
  styleUrls: ['./project-chart-of-accounts.component.scss']
})
export class ProjectChartOfAccountsComponent extends ListView implements OnInit, OnDestroy {
  readonly gridId = GridId.ProjectChartOfAccounts;

  readonly project$ = this.store.select(selectors.item);
  private readonly chartOfAccountModes$ = this.store.select(selectors.chartOfAccountModes);
  private readonly usedChartOfAccountsNOs$ = this.store.select(selectors.usedChartOfAccountsNOs);
  private readonly chartOfAccountDisbursementModes$ = this.store.select(selectors.chartOfAccountDisbursementModes);
  private readonly chartOfAccountsSavedSuccessfully$ = this.store.select(selectors.chartOfAccountsSavedSuccessfully);
  private readonly chartOfAccounts$ = this.store.select(selectors.chartOfAccounts);
  public chartOfAccounts: ChartOfAccountProjectConfig[];
  private isMdlTotalShareValid = new Set<string>();

  private projectId: number;
  private updatedData = new Dictionary<number, ChartOfAccountProjectConfig>();
  private chartOfAccountModes = [];
  private chartOfAccountModesOptions: SelectOption[] = [];
  private usedChartOfAccountsNOSet: Set<string>;
  private chartOfAccountModesById: IDictionary<number, ChartOfAccountMode[]>;
  private disbursementModes: SelectOption[] = [];
  private readonly editableColumnIds: string[] = [
    'displayName',
    'includeInCostFirst',
    'defaultModeId',
    'defaultPCT',
    'defaultAmount',
    'paymentEnabled',
    'disbursementModeId',
    'defaultPayeeOrgId',
    'isFeeAutomationEnabled'
  ];
 private readonly actionableAccountIds: string[] = [
    LedgerAccountEnum.LienFeeHoldback,
    LedgerAccountEnum.LienResolution,
    LedgerAccountEnum.MedicareMedicaidVOE,
    LedgerAccountEnum.PLRPVOE,
    LedgerAccountEnum.Probate,
    LedgerAccountEnum.LienFeeCreditfromHoldback,
    LedgerAccountEnum.ProbateOtherFees,
    LedgerAccountEnum.OtherFees
  ];

  private readonly defaultModePlaceholder = 'Select Mode';
  private readonly defaultPayeePlaceholder = 'Select Organization';
  private readonly amountModeName = 'Amount';
  private readonly colEnabled = 'active';
  private readonly colRequired = 'required';
  private readonly includedInCostColumn = 'includeInCostFirst';
  private readonly paymentEnabledColumn = 'paymentEnabled';
  private readonly defaultPayeeOrgId = 'defaultPayeeOrgId';
  private readonly disbursementModeColumn = 'disbursementModeId';
  private readonly defaultModeIdColumn = 'defaultModeId';
  private readonly defaultPayeeOrgNameColumn = 'defaultPayeeOrgName';
  private readonly feePaymentSweep = 'feePaymentSweep';
  private readonly isFeeAutomationEnabled = 'isFeeAutomationEnabled'
   private readonly feeImportAutomationNotAvailable = 'Fee Import Automation is not available for this account'

public readonly hasLienFeeAutomation = this.permissionService.has(PermissionService.create(PermissionTypeEnum.FeatureFlag, PermissionActionTypeEnum.LienFeeAutomation));
public readonly hasProbateFeeAutomation = this.permissionService.has(PermissionService.create(PermissionTypeEnum.FeatureFlag, PermissionActionTypeEnum.ProbateFeeAutomation));
public readonly hasProbateLocalCounselFeeAutomation = this.permissionService.has(PermissionService.create(PermissionTypeEnum.FeatureFlag, PermissionActionTypeEnum.ProbateLocalCounselFeeAutomation));
  private readonly actionBar: ActionHandlersMap = {
    edit: {
      callback: () => this.startEditing(),
      hidden: () => this.editEnabled,
      permissions: PermissionService.create(PermissionTypeEnum.ChartOfAccounts, PermissionActionTypeEnum.Edit),
    },
    save: {
      callback: () => this.onSave(),
      hidden: () => !this.editEnabled,
      awaitedActionTypes: [
        actions.SaveChartOfAccountsSuccess.type,
        actions.Error.type,
      ],
      disabled: () => !this.isValidDefaultMode || this.isMdlTotalShareValid?.size > 0,
    },
    cancel: {
      callback: () => this.stopEditing(true),
      hidden: () => !this.editEnabled,
    },
    clearFilter: this.clearFilterAction(),
  };

  readonly gridOptions: GridOptions = {
    animateRows: false,
    getRowId: (props: any): string => props.data.chartOfAccountId.toString(),
    columnDefs: [
      {
        headerName: 'Enabled?',
        field: this.colEnabled,
        cellRenderer: 'checkBoxRenderer',
        maxWidth: 90,
        tooltipValueGetter: (params: ITooltipParams): string => (this.hasDisabledAccInUse(params.data) ? 'There are ledger entries for this account' : null),
        editable: (): boolean => this.editEnabled,
        cellClass: (params: CellClassParams): string[] => [
          this.getDisabledAccInUseClass(params.data),
          this.getEditableClass(true),
        ],
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        ...AGGridHelper.tagColumnDefaultParams,
      },
      {
        headerName: 'Required',
        field: this.colRequired,
        cellRenderer: 'checkBoxRenderer',
        maxWidth: 90,
        editable: (): boolean => this.editEnabled,
        cellClass: (): string => (this.getEditableClass(true)),
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        ...AGGridHelper.tagColumnDefaultParams,
      },
      {
        headerName: 'Account Type',
        field: 'chartOfAccountAccountType',
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Account Group',
        field: 'chartOfAccountAccountGroupNo',
        valueFormatter: (params: ValueFormatterParams): string => {
          const coa = params.node.data as ChartOfAccountProjectConfig;
          return coa.chartOfAccountIsAccountGroup
            ? coa.chartOfAccountAccountGroupNo
            : '';
        },
        maxWidth: 120,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Account',
        field: 'chartOfAccountAccountNo',
        maxWidth: 90,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Name',
        field: 'chartOfAccountName',
        minWidth: 300,
        suppressSizeToFit: true,
        cellClass: (params: CellClassParams): string => {
          if (!(params.data as ChartOfAccountProjectConfig).chartOfAccountIsAccountGroup) {
            return 'ag-cell-indented';
          }
          return null;
        },
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Custom Display Name',
        field: 'displayName',
        cellRenderer: 'textBoxRenderer',
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        editable: (): boolean => this.editEnabled,
        cellClass: (): string => (this.getEditableClass()),
      },
      {
        headerName: 'Included in Cost?',
        field: this.includedInCostColumn,
        cellRenderer: 'checkBoxRenderer',
        editable: (params: EditableCallbackParams): boolean => this.editEnabled && this.coaService.isIncludeInCostEnabled(params.data, this.chartOfAccounts),
        cellClass: (params: CellClassParams): string => this.getEditableOrHiddenClass(this.coaService.isIncludeInCostEnabled(params.data, this.chartOfAccounts), true),
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        ...AGGridHelper.tagColumnDefaultParams,
        width: 130,
      },
      {
        headerName: 'Mode',
        field: this.defaultModeIdColumn,
        maxWidth: 140,
        filterValueGetter: (params: ValueGetterParams): string => params.data.chartOfAccountModeName,
        cellRendererSelector: this.onAccountModeCellRendererSelect.bind(this),
        editable: (params: EditableCallbackParams): boolean => (params.data as ChartOfAccountProjectConfig).chartOfAccountAccountModeVisible && this.editEnabled,
        cellClass: (params: CellClassParams): string => this.getEditableOrHiddenClass((params.data as ChartOfAccountProjectConfig).chartOfAccountAccountModeVisible),
        ...AGGridHelper.getDropdownColumnFilter({ options: this.chartOfAccountModesOptions, filterByName: true }, 'agTextColumnFilter'),
      },
      {
        headerName: 'Percentage',
        field: 'defaultPCT',
        minWidth: 150,
        cellRendererSelector: (params: ICellRendererParams): CellRendererSelectorResult => AGGridHelper.getTextBoxRenderer({
          value: params.value,
          type: TextboxEditorRendererDataType.Percentage,
        }),
        editable: (params: EditableCallbackParams): boolean => this.editEnabled && this.isDisplayPercentage(params.data as ChartOfAccountProjectConfig),
        cellClass: (params: CellClassParams): string => this.getEditableOrHiddenClass(this.isDisplayPercentage(params.data as ChartOfAccountProjectConfig)),
        ...AGGridHelper.getPercentageFilter(),
      },

      {
        headerName: 'Amount',
        field: 'defaultAmount',
        cellRendererSelector: (params: ICellRendererParams): CellRendererSelectorResult => {
          const data = params.data as ChartOfAccountProjectConfig;
          const isAmount = this.isDisplayAmount(data);
          data.isAmountModeSelected = isAmount;

          let type: TextboxEditorRendererDataType;
          if (isAmount) {
            type = TextboxEditorRendererDataType.Decimal;
          } else if (CommonHelper.isNullOrUndefined(params.value)) {
            type = TextboxEditorRendererDataType.Text;
          } else {
            type = TextboxEditorRendererDataType.Percentage;
          }

          let mdlTotalShareError;
          if (this.isClaimantShare(params.data)) {
            mdlTotalShareError = this.validateTotalShare(params.data);
          }

          return AGGridHelper.getTextBoxRenderer({
            value: params.value || mdlTotalShareError,
            type,
          });
        },

        editable: (params: EditableCallbackParams): boolean => this.editEnabled && this.isDisplayAmount(params.data as ChartOfAccountProjectConfig),
        cellClass: (params: CellClassParams): string[] => [
          this.getEditableOrHiddenClass(this.isDisplayAmount(params.data as ChartOfAccountProjectConfig)),
          this.totalShareClass((params.data as ChartOfAccountProjectConfig)),
        ],
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
      },
      {
        headerName: 'Payment Enabled?',
        field: this.paymentEnabledColumn,
        cellRenderer: 'checkBoxRenderer',
        editable: (params: EditableCallbackParams): boolean => (params.data as ChartOfAccountProjectConfig).chartOfAccountPaymentEnabledVisible
          && this.editEnabled
          && !this.isPaymentEnabledRequired(params.data as ChartOfAccountProjectConfig),
        cellClass: (params: CellClassParams): string => this.getEditableOrHiddenClass((params.data as ChartOfAccountProjectConfig).chartOfAccountPaymentEnabledVisible, true),
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        ...AGGridHelper.tagColumnDefaultParams,
        width: 130,
      },
      {
        headerName: 'Fee Payment Sweep',
        field: this.feePaymentSweep,
        cellRenderer: 'checkBoxRenderer',
        editable: (params: EditableCallbackParams): boolean => (params.data as ChartOfAccountProjectConfig).chartOfAccountFeePaymentSweepVisible
          && this.editEnabled,
        cellClass: (params: CellClassParams): string => this.getEditableOrHiddenClass((params.data as ChartOfAccountProjectConfig).chartOfAccountFeePaymentSweepVisible, true),
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        ...AGGridHelper.tagColumnDefaultParams,
        width: 180,
      },
      {
        headerName: 'Fee Import Automation',
        field: this.isFeeAutomationEnabled,
        cellRenderer: 'checkBoxRenderer',
        tooltipValueGetter: (params: ITooltipParams): string => this.hasFeeImportAutomationActionable(params.data),
        editable: (params: EditableCallbackParams): boolean => (params.data as ChartOfAccountProjectConfig).chartOfAccountFeeImportAutomationVisible
          && this.editEnabled && this.isFeeImportAutomatioEditable(params.data as ChartOfAccountProjectConfig),
        cellClass: (params: CellClassParams): string => this.getEditableOrHiddenClass((params.data as ChartOfAccountProjectConfig).chartOfAccountFeeImportAutomationVisible, true),
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        ...AGGridHelper.tagColumnDefaultParams,
        width: 180,
        headerComponent: CustomInnerHeaderComponent,
        headerComponentParams: {
         icon: "fa-info-circle"
       },
      },
      {
        headerName: 'Disbursement Mode',
        field: this.disbursementModeColumn,
        minWidth: 180,
        cellRendererSelector: (params: ICellRendererParams): CellRendererSelectorResult => AGGridHelper.getDropdownRenderer({
          values: this.disbursementModes,
          value: params.value,
          placeholder: this.defaultModePlaceholder,
          disabledPlaceholder: true,
        }),
        editable: (params: EditableCallbackParams): boolean => (params.data as ChartOfAccountProjectConfig).chartOfAccountPaymentModeVisible && this.editEnabled,
        cellClass: (params: CellClassParams): string => this.getEditableOrHiddenClass((params.data as ChartOfAccountProjectConfig).chartOfAccountPaymentModeVisible),
        ...AGGridHelper.getDropdownColumnFilter({ options: this.disbursementModes }),
      },
      {
        headerName: 'Default Payee',
        field: this.defaultPayeeOrgId,
        minWidth: 180,
        editable: (params: EditableCallbackParams): boolean => {
          const data = params.data as ChartOfAccountProjectConfig;
          return data.disbursementModeId === DisbursementMode.SendToRelatedEntity
          && data.chartOfAccountPaymentModeVisible
          && data.paymentEnabled
          && data.defaultPayeeOrgEnabled
          && this.editEnabled;
        },
        cellRendererSelector: (params: ICellRendererParams): CellRendererSelectorResult => {
          const modalComponent = OrganizationSelectionModalComponent;
          return AGGridHelper.getModalRenderer({
            modalComponent,
            modalConfig: {
              initialState: {
                isActiveDisplayed: true,
                gridDataFetcher: (parameters: IServerSideGetRowsParamsExtended) => this.store.dispatch(sharedActions.SearchOrganizations({ params: parameters })),
              },
              class: 'entity-selection-modal',
            },
            selectedId: params.value,
            displayedField: this.defaultPayeeOrgNameColumn,
            placeholder: this.defaultPayeePlaceholder,
          });
        },
        cellClass: (params: CellClassParams): string => this.getEditableOrHiddenClass((params.data as ChartOfAccountProjectConfig).chartOfAccountPaymentModeVisible),

      },
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
      suppressKeyboardEvent: this.suppressDefaultKeyboardKeys.bind(this),
    },
    components: {
      checkBoxRenderer: CheckboxEditorRendererComponent,
      textBoxRenderer: TextboxEditorRendererComponent,
      dropdownRenderer: DropdownEditorRendererComponent,
      modalRenderer: ModalEditorRendererComponent,
    },
    onCellValueChanged: this.onCellValueChanged.bind(this),
    suppressClickEdit: true,
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    pagination: false,
    suppressScrollOnNewData: true,
    getRowClass: (params: any) => {
      if ((params.data as ChartOfAccountProjectConfig).chartOfAccountIsAccountGroup) {
        return 'ag-row-odd-dark ag-row-border-bottom-dark';
      }
      return 'ag-row-white';
    },
    tabToNextCell: ((param: TabToNextCellParams) => AGGridHelper.tabToNextEditableCell(
      param,
      this.gridApi,
      this.editableColumnIds,
    )),
  };
  constructor(
    private readonly store: Store<ProjectsCommonState>,
    private readonly toaster: ToastService,
    router: Router,
    elementRef: ElementRef,
    private readonly coaService: ChartOfAccountSettingsService,
    private readonly permissionService: PermissionService,
  ) {
    super(router, elementRef);
  }

  public get isValidDefaultMode(): boolean {
    const coaItems = this.chartOfAccounts.filter((item: ChartOfAccountProjectConfig) => this.canValidateDefaultMode(item));
    const isValid = coaItems.every((item: ChartOfAccountProjectConfig) => {
      const node = this.gridApi.getRowNode(item.chartOfAccountId.toString());
      return (node.data.defaultModeId && node.data.active) || !node.data.active;
    });
    return isValid;
  }

  private getDisabledAccInUseClass(data: ChartOfAccountProjectConfig): string {
    let cssClass = null;

    if (this.hasDisabledAccInUse(data)) {
      cssClass = 'fas fa-exclamation-triangle disabled-acc-in-use';
    }

    return cssClass;
  }

  private hasDisabledAccInUse(data: ChartOfAccountProjectConfig): boolean {
    return !data.active && this.usedChartOfAccountsNOSet?.has(data?.chartOfAccountAccountNo);
  }

  private hasFeeImportAutomationActionable(data: ChartOfAccountProjectConfig): string{
    let checkIfAccountIdExist = this.actionableAccountIds.filter(x => x == data.chartOfAccountAccountNo);
    if(data.chartOfAccountAccountGroupNo == LedgerAccountGroup.ARCHERFees){
      return this.feeImportAutomationTooltipForArcherFees(data,checkIfAccountIdExist);
    }
    else if(data.chartOfAccountAccountGroupNo == LedgerAccountGroup.OtherFees){
      return this.feeImportAutomationTooltipForOtherFees(data,checkIfAccountIdExist);
    }
  }

  private feeImportAutomationTooltipForArcherFees(data: ChartOfAccountProjectConfig, checkIfAccountIdExist:string[]): string{
    if(!this.hasLienFeeAutomation
        && data.chartOfAccountAccountNo != LedgerAccountEnum.Probate
        && checkIfAccountIdExist.length > 0){
        return 'Lien Fee Automation Feature Flag must be set to action this field';
      }
      else if(!this.hasProbateFeeAutomation && data.chartOfAccountAccountNo == LedgerAccountEnum.Probate){
        return 'Probate Fee Automation Feature Flag must be set to action this field';
      }
      else if ((data.chartOfAccountAccountGroupNo == LedgerAccountGroup.ARCHERFees
        && checkIfAccountIdExist.length == 0
        && data.chartOfAccountAccountNo != LedgerAccountEnum.QSFAdmin
        && data.chartOfAccountAccountNo != LedgerAccountGroup.ARCHERFees)) {
        return this.feeImportAutomationNotAvailable;
      }
  }

  private feeImportAutomationTooltipForOtherFees(data: ChartOfAccountProjectConfig, checkIfAccountIdExist:string[]): string
  {
    if(!this.hasProbateLocalCounselFeeAutomation && (data.chartOfAccountAccountNo == LedgerAccountEnum.ProbateOtherFees
    || data.chartOfAccountAccountNo == LedgerAccountGroup.OtherFees))
    {
      return 'Probate Local Counsel Fee Automation Feature Flag must be set to action this field';
    }
    else if ((data.chartOfAccountAccountGroupNo == LedgerAccountGroup.OtherFees
      && checkIfAccountIdExist.length == 0)) {
      return this.feeImportAutomationNotAvailable;
    }
  }

  ngOnInit(): void {
    this.store.dispatch(commonActions.UpdateActionBar({ actionBar: this.actionBar }));
    this.project$.pipe(
      filter((item: Project) => !!item),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(({ id }: { id: number }) => {
      this.projectId = id;
      this.updatedData.clear();
      this.store.dispatch(actions.GetChartOfAccountsList({ projectId: this.projectId }));
      this.store.dispatch(actions.GetUsedChartOfAccountsNOs({ projectId: this.projectId }));
      this.store.dispatch(actions.GetChartOfAccountModes({}));
      this.store.dispatch(actions.GetChartOfAccountDisbursementModes());
    });
    this.chartOfAccountModes$.pipe(
      filter((modes: ChartOfAccountMode[]) => !!modes),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((modes: ChartOfAccountMode[]) => {
      this.chartOfAccountModes.splice(0);
      this.chartOfAccountModesById = new Dictionary<number, ChartOfAccountMode[]>();
      modes.forEach((chartOfAccountMode: ChartOfAccountMode) => {
        const addedChartOfAccountMode = { ...chartOfAccountMode };
        this.chartOfAccountModes.push(addedChartOfAccountMode);
        const chartOfAccountId = chartOfAccountMode.chartOfAccountId as number;
        if (!this.chartOfAccountModesOptions?.some((mode: SelectOption) => mode.name === addedChartOfAccountMode.name)) {
          this.chartOfAccountModesOptions.push({ id: addedChartOfAccountMode.id, name: addedChartOfAccountMode.name });
        }
        const chartOfAccountModesById = this.chartOfAccountModesById.getItem(chartOfAccountId);
        if (!chartOfAccountModesById) {
          this.chartOfAccountModesById.setValue(chartOfAccountId, [addedChartOfAccountMode]);
        } else {
          chartOfAccountModesById.value.push(addedChartOfAccountMode);
        }
      });
    });

    this.chartOfAccounts$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((items: ChartOfAccountProjectConfig[]) => {
      this.chartOfAccounts = items;
    });

    this.usedChartOfAccountsNOs$.pipe(
      filter((items: string[]) => !!items),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((items: string[]) => {
      this.usedChartOfAccountsNOSet = new Set<string>(items);
    });

    this.chartOfAccountDisbursementModes$.pipe(
      filter((modes: SelectOption[]) => !!modes),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((modes: SelectOption[]) => {
      this.disbursementModes.splice(0);
      this.disbursementModes.push(...modes);
    });

    this.chartOfAccountsSavedSuccessfully$.pipe(
      filter((chartOfAccountsSavedSuccessfully: boolean) => !!chartOfAccountsSavedSuccessfully),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => this.stopEditing());
  }

  ngOnDestroy(): void {
    this.store.dispatch(commonActions.UpdateActionBar({ actionBar: null }));
    super.ngOnDestroy();
  }

  onGridReady(gridApi: GridApi): void {
    super.gridReady(gridApi);
    this.chartOfAccounts$.pipe(
      filter((items: ChartOfAccountProjectConfig[]) => !!items),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((items: ChartOfAccountProjectConfig[]) => {
      this.gridApi.setGridOption('rowData', items);
      this.applySavedGridSettings();
    });
  }

  onAccountModeCellRendererSelect(params: ICellRendererParams): CellRendererSelectorResult {
    const coa = params.data as ChartOfAccountProjectConfig;
    const chartOfAccountId = coa.chartOfAccountId;
    const chartOfAccountModesById = this.chartOfAccountModesById.getValue(chartOfAccountId);
    const comboBox = {
      component: 'dropdownRenderer',
      params: {
        values: SelectHelper.toOptions(chartOfAccountModesById),
        value: params.value,
        placeholder: this.defaultModePlaceholder,
        // When an account is enabled make the Mode field required
        isValid: (data: any) => (data && coa.active) || !coa.active,
        isRequired: () => true,
      } as IDropdownEditorRendererParams,
    };
    return comboBox;
  }

  private onCellValueChanged(event: CellValueChangedEvent): void {
    const rowData = event.data as ChartOfAccountProjectConfig;
    const colId = event.column.getColId();
    const isCheckbox = typeof rowData[colId] === 'boolean';
    let hasUsedButDisabledCOA: boolean;

    if (isCheckbox) {
      if (rowData.chartOfAccountIsAccountGroup) {
        this.chartOfAccounts.forEach((item: ChartOfAccountProjectConfig) => {
          if (StringHelper.equal(item.chartOfAccountAccountGroupNo, rowData.chartOfAccountAccountGroupNo)) {
            if ((colId === this.includedInCostColumn && !item.chartOfAccountIncludeInCostVisible) ||
                (colId === this.paymentEnabledColumn && !item.chartOfAccountPaymentEnabledVisible) ||
                (colId === this.feePaymentSweep && !item.chartOfAccountFeePaymentSweepVisible) ||
                (colId === this.isFeeAutomationEnabled && !item.chartOfAccountFeeImportAutomationVisible)) {
              return;
            }

            const node = this.gridApi.getRowNode(item.chartOfAccountId.toString());
            const newItem = { ...node.data, [colId]: rowData[colId] };

            if (colId === this.paymentEnabledColumn
              && this.updatebleGroups.includes(node.data.chartOfAccountAccountGroupNo)
              && node.data.isPaymentEnabledRequired
            ) {
              newItem.paymentEnabled = node.data.paymentEnabled;
            }

            /**
             * https://archersystems.atlassian.net/browse/AC-19094
             * When the user enables/disables an account then we should automatically make the account(s) payment enabled/disabled
             */
            if (colId === this.colEnabled && node.data.chartOfAccountPaymentEnabledVisible && this.canAutoUpdatePaymentEnabled(node.data)) {
              newItem.paymentEnabled = newItem.active;
              rowData.paymentEnabled = rowData.active;
            }

            if (node.data.chartOfAccountFeePaymentSweepVisible && colId === this.colEnabled) {
              newItem.feePaymentSweep = newItem.active;
              rowData.feePaymentSweep = rowData.active;
            }
            if (node.data.chartOfAccountFeeImportAutomationVisible && colId === this.colEnabled) {
              newItem.isFeeAutomationEnabled = newItem.active;
              rowData.isFeeAutomationEnabled = rowData.active;
            }

            node.setData(newItem);
            this.updatedData.setValue(item.chartOfAccountId, newItem);

            this.setVisibleToDefaultPayee(newItem, item.paymentEnabled);

            if (colId === this.colEnabled) {
              if (!hasUsedButDisabledCOA && this.hasDisabledAccInUse(item)) {
                hasUsedButDisabledCOA = true;
              }

              this.gridApi.redrawRows(<RedrawRowsParams>{ rowNodes: [node] });
            }
          }
        });
      } else if (this.hasDisabledAccInUse(rowData)) {
        hasUsedButDisabledCOA = true;
      }

      if (colId === this.feePaymentSweep && !rowData.chartOfAccountIsAccountGroup)
      {
        const groupAccount = this.chartOfAccounts.find((i: ChartOfAccountProjectConfig) => i.chartOfAccountIsAccountGroup && i.chartOfAccountAccountGroupNo === rowData.chartOfAccountAccountGroupNo);
        if (groupAccount) {
          const node = this.gridApi.getRowNode(groupAccount.chartOfAccountId.toString());
          const newItem = { ...node.data, [this.colEnabled]: rowData.active };
          newItem.feePaymentSweep = rowData.active;
          node.setData(newItem);
          this.gridApi.redrawRows();
          this.updatedData.setValue(newItem.chartOfAccountId, newItem);
        }
      }

      if (colId === this.colEnabled) {
        /**
         * https://archersystems.atlassian.net/browse/AC-19094
         * When the user enables a child account then we should automatically enable the parent account
         */
        if (!rowData.chartOfAccountIsAccountGroup && rowData.active) {
          const groupAccount = this.chartOfAccounts.find((i: ChartOfAccountProjectConfig) => i.chartOfAccountIsAccountGroup && i.chartOfAccountAccountGroupNo === rowData.chartOfAccountAccountGroupNo);
          if (groupAccount) {
            const node = this.gridApi.getRowNode(groupAccount.chartOfAccountId.toString());
            const newItem = { ...node.data, [this.colEnabled]: rowData.active };
            if (rowData.chartOfAccountPaymentEnabledVisible && this.canAutoUpdatePaymentEnabled(rowData)) {
              newItem.paymentEnabled = rowData.active;
            }
            if (node.data.chartOfAccountFeePaymentSweepVisible) {
              newItem.feePaymentSweep = newItem.active;
            }
            if (node.data.chartOfAccountFeeImportAutomationVisible) {
              newItem.isFeeAutomationEnabled = newItem.active;
            }
            node.setData(newItem);
            this.gridApi.redrawRows();
            this.updatedData.setValue(newItem.chartOfAccountId, newItem);
          }
        }

        /**
        * https://archersystems.atlassian.net/browse/AC-19094
        * When the user enables/disables an account then we should automatically make the account(s) payment enabled/disabled
        */
        if (rowData.chartOfAccountPaymentEnabledVisible && this.canAutoUpdatePaymentEnabled(rowData)) {
          const newItem = { ...rowData, paymentEnabled: rowData.active };
          const node = this.gridApi.getRowNode(rowData.chartOfAccountId.toString());
          rowData.paymentEnabled = rowData.active;
          this.updatedData.setValue(rowData.chartOfAccountId, newItem);
          node.setData(newItem);
          this.gridApi.redrawRows(<RedrawRowsParams>{ rowNodes: [node] });
        }

        if (rowData.chartOfAccountFeePaymentSweepVisible) {
          const newItem = { ...rowData, feePaymentSweep: rowData.active };
          const node = this.gridApi.getRowNode(rowData.chartOfAccountId.toString());
          rowData.feePaymentSweep = rowData.active;
          this.updatedData.setValue(rowData.chartOfAccountId, newItem);
          node.setData(newItem);
          this.gridApi.redrawRows(<RedrawRowsParams>{ rowNodes: [node] });
        }

        if (rowData.chartOfAccountFeeImportAutomationVisible) {
          const newItem = { ...rowData, isFeeAutomationEnabled: rowData.active };
          const node = this.gridApi.getRowNode(rowData.chartOfAccountId.toString());
          rowData.isFeeAutomationEnabled = rowData.active;
          this.updatedData.setValue(rowData.chartOfAccountId, newItem);
          node.setData(newItem);
          this.gridApi.redrawRows(<RedrawRowsParams>{ rowNodes: [node] });
        }

        if (hasUsedButDisabledCOA) {
          this.toaster.showWarning(`There are ledger entries for this account: ${rowData.chartOfAccountAccountNo}. This change will impact ledgers.`);
        }

        if (this.canValidateDefaultMode(rowData) && rowData.chartOfAccountIsAccountGroup && rowData.active && !rowData.defaultModeId) {
          this.gridApi.redrawRows();
        }
      }

      if (colId === this.paymentEnabledColumn) {
        this.setVisibleToDefaultPayee(rowData, rowData.paymentEnabled);
      }
    }

    if (colId === this.defaultPayeeOrgId && rowData.chartOfAccountIsAccountGroup) {
      this.chartOfAccounts.forEach((item: ChartOfAccountProjectConfig) => {
        if (StringHelper.equal(item.chartOfAccountAccountGroupNo, rowData.chartOfAccountAccountGroupNo)) {
          if (item.disbursementModeId !== DisbursementMode.SendToRelatedEntity
            || !item.chartOfAccountPaymentModeVisible
            || !item.paymentEnabled
            || !item.defaultPayeeOrgEnabled
            || !this.editEnabled) {
            return;
          }

          const { chartOfAccountId } = item;
          const newItem = { ...item, defaultPayeeOrgId: rowData.defaultPayeeOrgId, defaultPayeeOrgName: rowData.defaultPayeeOrgName };

          this.updatedData.setValue(chartOfAccountId, newItem);
          const node = this.gridApi.getRowNode(chartOfAccountId.toString());
          node.setData(newItem);

          this.gridApi.redrawRows(<RedrawRowsParams>{ rowNodes: [node] });
        }
      });
    }

     if (colId === this.isFeeAutomationEnabled
        && (rowData.chartOfAccountAccountNo == LedgerAccountEnum.LienFeeHoldback
          || rowData.chartOfAccountAccountNo == LedgerAccountEnum.LienFeeCreditfromHoldback))
      {
        const chartOfAccountsFilteredList = this.chartOfAccounts.filter((i: ChartOfAccountProjectConfig) => i.chartOfAccountAccountNo == LedgerAccountEnum.LienFeeHoldback
          || i.chartOfAccountAccountNo == LedgerAccountEnum.LienFeeCreditfromHoldback);
        if (chartOfAccountsFilteredList.length > 0) {
           chartOfAccountsFilteredList.forEach((item: ChartOfAccountProjectConfig) => {
          const newItem = { ...item, isFeeAutomationEnabled: event.newValue };
          newItem.isFeeAutomationEnabled = event.newValue;
          const { chartOfAccountId } = item;
          const node = this.gridApi.getRowNode(chartOfAccountId.toString());
           node.setData(newItem);
            this.updatedData.setValue(newItem.chartOfAccountId, newItem);
           this.gridApi.redrawRows(<RedrawRowsParams>{ rowNodes: [node] });
           })
        }
      }

    if (colId === this.disbursementModeColumn) {
      const { disbursementModeId } = rowData;
      const isVisible = disbursementModeId === DisbursementMode.SendToRelatedEntity;
      this.setVisibleToDefaultPayee(rowData, isVisible);
    }

    if (colId === 'defaultPCT') {
      if (this.isValidatedGroup(rowData)) {
        const isAttorneyShare = rowData.chartOfAccountName === ChartOfAccountName.MdlAttorneyShare
          || rowData.chartOfAccountName === ChartOfAccountName.CbfAttorneyShare;
        const claimantShareChartOfAccountId = isAttorneyShare
          ? rowData.chartOfAccountId + 1
          : rowData.chartOfAccountId;

        const claimantShareNode = this.gridApi.getRowNode(claimantShareChartOfAccountId.toString());
        this.gridApi.redrawRows(<RedrawRowsParams>{ rowNodes: [claimantShareNode] });
      }
    }

    if (colId === this.defaultModeIdColumn) {
      this.updateOnChangedMode();

      if (rowData.chartOfAccountAccountNo == LedgerAccountGroup.CommonBenefit
        && (event.newValue == ChartOfAccountModeEnum.CBFOTTAmount || event.newValue == ChartOfAccountModeEnum.CBFOTTPercent)) {
        this.updateRowDefaultPCT(LedgerAccountEnum.CBFAttorneyShare, 0);
        this.updateRowDefaultPCT(LedgerAccountEnum.CBFClaimantShare, 1);
      }

      this.gridApi.redrawRows();
    }

    if (Number(rowData.defaultPCT) === 0) {
      rowData.defaultPCT = null;
    }

    this.updatedData.setValue(rowData.chartOfAccountId, rowData);
  }

  private updateRowDefaultPCT(
    chartOfAccountAccountNo: LedgerAccountEnum,
    defaultPCT: number,
  ): void {
    const chartOfAccount = this.chartOfAccounts
      .find((coa: ChartOfAccountProjectConfig) => <LedgerAccountEnum>coa.chartOfAccountAccountNo == chartOfAccountAccountNo);
    if (chartOfAccount) {
      const { chartOfAccountId } = chartOfAccount;
      let updatedItem = this.updatedData.getValue(chartOfAccountId);
      if (!updatedItem) { updatedItem = chartOfAccount; }

      const newItem = { ...updatedItem, defaultPCT };
      this.updatedData.setValue(chartOfAccountId, newItem);
      const node = this.gridApi.getRowNode(chartOfAccountId.toString());
      node.setData(newItem);
    }
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;
  }

  protected startEditing(): void {
    super.startEditing();
  }

  protected stopEditing(withReload = false): void {
    super.stopEditing();
    this.updatedData.clear();
    if (withReload) {
      this.store.dispatch(actions.GetChartOfAccountsList({ projectId: this.projectId }));
    }
  }

  private isPaymentEnabledRequired(data: ChartOfAccountProjectConfig): boolean {
    return data.isPaymentEnabledRequired;
  }
private isFeeImportAutomatioEditable(data: ChartOfAccountProjectConfig): boolean {
  if(data.chartOfAccountAccountGroupNo == LedgerAccountGroup.ARCHERFees
    || data.chartOfAccountAccountGroupNo == LedgerAccountGroup.OtherFees){
      let isEditable = false;
      let checkIfAccountIdExist = this.actionableAccountIds.filter(x => x == data.chartOfAccountAccountNo);
      if ((this.hasProbateFeeAutomation && data.chartOfAccountAccountNo == LedgerAccountEnum.Probate)
        || (this.hasProbateLocalCounselFeeAutomation
        && (data.chartOfAccountAccountGroupNo == LedgerAccountGroup.OtherFees
        || data.chartOfAccountAccountNo == LedgerAccountEnum.ProbateOtherFees))
        && checkIfAccountIdExist.length > 0){
          isEditable = true;
      }
      if(this.hasLienFeeAutomation
        && checkIfAccountIdExist.length > 0 && data.chartOfAccountAccountNo != LedgerAccountEnum.Probate
        && data.chartOfAccountAccountGroupNo == LedgerAccountGroup.ARCHERFees
        || data.chartOfAccountAccountNo == LedgerAccountEnum.QSFAdmin
        || data.chartOfAccountAccountNo == LedgerAccountGroup.ARCHERFees){
        isEditable = true;
      }
      return isEditable;
    }
  }
  private onSave(): void {
    if (this.updatedData.count() > 0) {
      this.store.dispatch(actions.SaveChartOfAccounts({ projectId: this.projectId, data: this.updatedData.values() }));
    } else {
      this.stopEditing();
    }
  }

  private setVisibleToDefaultPayee(data: ChartOfAccountProjectConfig, isVisible: boolean): void {
    const node = this.gridApi.getRowNode(data.chartOfAccountId.toString());
    const column = this.gridApi.getColumnDef(this.defaultPayeeOrgId);

    if (!isVisible) {
      const item = { ...data, [this.defaultPayeeOrgId]: null, [this.defaultPayeeOrgNameColumn]: null };
      this.updatedData.setValue(data.chartOfAccountId, item);
      node.setData(item);
    }

    column.lockVisible = isVisible;
    this.gridApi.redrawRows(<RedrawRowsParams>{ rowNodes: [node] });
  }

  private isDisplayPercentage(data: ChartOfAccountProjectConfig): boolean {
    return data.chartOfAccountDefaultPCTVisible && !this.isDisplayAmount(data);
  }

  private isDisplayAmount(data: ChartOfAccountProjectConfig): boolean {
    if (data.chartOfAccountDefaultAmountVisible) {
      const modes = this.chartOfAccountModesById.getValue(data.chartOfAccountId);
      if (modes && modes.length > 0 && data.defaultModeId !== null) {
        const amountModes = modes.filter((mode: ChartOfAccountMode) => mode.name.includes(this.amountModeName));
        return !amountModes || amountModes.some((mode: ChartOfAccountMode) => mode.id === data.defaultModeId);
      }
    }
    return false;
  }

  private validateTotalShare(data: ChartOfAccountProjectConfig): string {
    const { chartOfAccountName, chartOfAccountId, defaultPCT } = data;
    if (this.isValidatedGroup(data)) {
      let secondMdlFieldId: number;

      switch (chartOfAccountId) {
        case ChartOfAccountId.MdlAttorneyShare:
          secondMdlFieldId = ChartOfAccountId.MdlClaimantShare;
          break;
        case ChartOfAccountId.CbfAttorneyShare:
          secondMdlFieldId = ChartOfAccountId.CbfClaimantShare;
          break;
        case ChartOfAccountId.MdlClaimantShare:
          secondMdlFieldId = ChartOfAccountId.MdlAttorneyShare;
          break;
        case ChartOfAccountId.CbfClaimantShare:
          secondMdlFieldId = ChartOfAccountId.CbfAttorneyShare;
          break;
      }

      const secondMdlDefaultPCT = this.gridApi.getRowNode(secondMdlFieldId.toString())?.data?.defaultPCT;

      const currentDefaultPctNumber = defaultPCT * 100;
      const secondDefaultPctNumber = secondMdlDefaultPCT * 100;
      const sum = currentDefaultPctNumber + secondDefaultPctNumber;
      if (sum > 0 && sum !== 100) {
        this.isMdlTotalShareValid.add(chartOfAccountName);
        const error = sum.toFixed(2);
        return `${error}%`;
      }
      this.isMdlTotalShareValid.delete(chartOfAccountName);
    }
    return null;
  }

  private updateOnChangedMode(): void {
    const chartOfAccountNosToUpdate = [LedgerAccountEnum.CBFClaimantShare, LedgerAccountEnum.CBFClaimantShareRefundCredit];

    this.chartOfAccounts
      .filter(item => chartOfAccountNosToUpdate.includes(<LedgerAccountEnum>item.chartOfAccountAccountNo))
      .forEach((item: ChartOfAccountProjectConfig) => {
        const { chartOfAccountId } = item;
        const newItem = { ...item, includeInCostFirst: false };

        this.updatedData.setValue(chartOfAccountId, newItem);
        const node = this.gridApi.getRowNode(chartOfAccountId.toString());
        node.setData(newItem);
      });
  }

  public isValidatedGroup(data: ChartOfAccountProjectConfig): boolean {
    return data.chartOfAccountName === ChartOfAccountName.MdlAttorneyShare
      || data.chartOfAccountName === ChartOfAccountName.MdlClaimantShare
      || data.chartOfAccountName === ChartOfAccountName.CbfAttorneyShare
      || data.chartOfAccountName === ChartOfAccountName.CbfClaimantShare;
  }

  public totalShareClass(data: ChartOfAccountProjectConfig): string {
    return this.isClaimantShare(data) && this.validateTotalShare(data)
      ? 'fas fa-exclamation-triangle disabled-acc-in-use error-message'
      : null;
  }

  private isClaimantShare(data: ChartOfAccountProjectConfig): boolean {
    return data.chartOfAccountName === ChartOfAccountName.MdlClaimantShare
      || data.chartOfAccountName === ChartOfAccountName.CbfClaimantShare;
  }

  private updatebleGroups: string[] = [
    LedgerAccountGroup.AttyFees,
    LedgerAccountGroup.AttyExpenses,
    LedgerAccountGroup.Liens,
    LedgerAccountGroup.ARCHERFees,
    LedgerAccountGroup.OtherFees,
    LedgerAccountGroup.ThirdPartyPMTS,
    LedgerAccountGroup.ClaimantDisbursements,
  ];

  private canAutoUpdatePaymentEnabled(data: ChartOfAccountProjectConfig): boolean {
    return this.updatebleGroups.includes(data.chartOfAccountAccountGroupNo) && !data.isPaymentEnabledRequired;
  }

  private canValidateDefaultMode(data: ChartOfAccountProjectConfig): boolean {
    const updatebleGroups: string[] = [
      LedgerAccountGroup.MDL,
      LedgerAccountGroup.CommonBenefit,
      LedgerAccountGroup.AttyFees,
    ];
    return updatebleGroups.includes(data.chartOfAccountAccountNo);
  }
}
