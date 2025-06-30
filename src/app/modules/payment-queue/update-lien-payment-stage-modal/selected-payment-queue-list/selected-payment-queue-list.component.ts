import { Component, ElementRef, Input } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ActionsSubject, Store } from '@ngrx/store';

import { first, takeUntil } from 'rxjs/operators';
import * as rootSelectors from '@app/state/index';
import * as rootActions from '@app/state/root.actions';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { ActivatedRoute, Router } from '@angular/router';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { GridOptions } from 'ag-grid-community';
import { GridId } from '@app/models/enums/grid-id.enum';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { CurrencyHelper, SearchOptionsHelper } from '@app/helpers';
import { PusherService } from '@app/services/pusher.service';
import { IGridLocalData } from '@app/state/root.state';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes/enum-to-array.pipe';
import { MessageService, ModalService, PermissionService, ProductCategoriesService, StagesService } from '@app/services';
import { SplitCamelCasePipe, YesNoPipe } from '@app/modules/shared/_pipes';
import { LogService } from '@app/services/log-service';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { BankruptcyStatusRendererComponent } from '../../../projects/project-disbursement-payment-queue/renderers/bk-status-renderer/bk-status-renderer.component';
import { PaymentQueueRendererComponent } from '../../../projects/project-disbursement-payment-queue/renderers/payment-queue-buttons-renderer';
import { AccountRendererComponent } from '../../../projects/project-disbursement-payment-queue/renderers/account-renderer/account-renderer-component';
import { ProjectsCommonState } from '../../../projects/state/reducer';
import * as paymentQueueActions from '../../../projects/project-disbursement-payment-queue/state/actions';
import { lienPaymentStages, lienStatuses, bankruptcyStages } from '../../../projects/project-disbursement-payment-queue/state/selectors';

@Component({
  selector: 'app-selected-payment-queue-list',
  templateUrl: './selected-payment-queue-list.component.html',
})
export class SelectedPaymentQueueListComponent extends ListView {
  public readonly gridId: GridId = GridId.SelectedPaymentQueue;
  private lienPaymentStages: SelectOption[] = [];
  private bankruptcyStages: SelectOption[] = [];
  private lienStatuses: SelectOption[] = [];
  @Input() public parentGridId: GridId;
  @Input() public paymentQueueGridParams: IServerSideGetRowsParamsExtended;
  @Input() public projectId: number;
  @Input() public entityLabel: string;

  private readonly lienPaymentStages$ = this.store.select(lienPaymentStages);
  private readonly bankruptcyStages$ = this.store.select(bankruptcyStages);
  public lienStatuses$ = this.store.select(lienStatuses);

  public gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'Payee Org Id',
        field: 'payeeOrgId',
        hide: true,
        suppressColumnsToolPanel: true,
      },
      {
        headerName: 'Ledger Entry ID',
        field: 'ledgerEntryId',
        colId: 'id',
        width: 100,
        sortable: true,
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'ARCHER ID',
        field: 'archerId',
        width: 100,
        maxWidth: 100,
        sortable: true,
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Attorney Ref ID',
        field: 'attorneyReferenceId',
        width: 140,
        sortable: true,
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Client ID',
        field: 'clientId',
        width: 80,
        maxWidth: 80,
        sortable: true,
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'First Name',
        field: 'claimantFirstName',
        sortable: true,
      },
      {
        headerName: 'Last Name',
        field: 'claimantLastName',
        sortable: true,
      },
      {
        headerName: 'Account Group',
        field: 'accountGroupNameWithNumber',
        colId: 'accountGroupName',
        sortable: true,
        width: 190,
        minWidth: 190,
      },
      {
        headerName: 'Account',
        field: 'accountName',
        sortable: true,
        width: 250,
        minWidth: 250,
        cellRenderer: 'AccountRenderer',
      },
      {
        headerName: 'Primary Firm',
        field: 'clientPrimaryFirmName',
        width: 190,
        minWidth: 190,
        sortable: true,
      },
      {
        headerName: 'Payee',
        field: 'payeeName',
        width: 190,
        minWidth: 190,
        sortable: true,
        cellRenderer: 'PayeeRenderer',
      },
      {
        headerName: 'AssignedOrg',
        field: 'assignedOrgName',
        width: 190,
        minWidth: 190,
        sortable: true,
      },
      {
        headerName: 'AssignedOrg Relationship',
        field: 'assignedOrgRelation',
        width: 190,
        minWidth: 190,
        sortable: true,
      },
      {
        headerName: 'Status',
        field: 'status',
        colId: 'statusName',
        width: 190,
        minWidth: 190,
        sortable: true,
      },
      {
        headerName: 'Amount',
        sortable: true,
        field: 'amount',
        cellRenderer: (data: any): string => CurrencyHelper.toUsdFormat(data),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Disbursement Group',
        field: 'disbursementGroupName',
        sortable: true,
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Ledger Stage',
        field: 'stage.name',
        width: 240,
        minWidth: 240,
        colId: 'stage.id',
        sortable: true,
      },
      {
        headerName: 'Lien Payment Stage',
        field: 'lienPaymentStageId',
        sortable: true,
        width: 240,
        minWidth: 240,
        cellRenderer: (data: any): string => (data?.value ? this.lienPaymentStages.find((type: SelectOption) => type.id === data.value)?.name : ''),
      },
      {
        headerName: 'Lien Status',
        field: 'lienStatusId',
        width: 240,
        minWidth: 240,
        sortable: true,
        cellRenderer: (data: any): string => (data?.value ? this.lienStatuses.find((type: SelectOption) => type.id === data.value)?.name : ''),
      },
      {
        headerName: 'Claimant Net Disbursed',
        field: 'claimantNetDisbursed',
        sortable: true,
        cellRenderer: (data: any): string => this.yesNoPipe.transform(!!data.value),
        ...AGGridHelper.nameColumnDefaultParams,
        headerTooltip: 'Claimant Net Disbursed',
      },
      {
        headerName: 'BK',
        field: 'bankruptcyStatusId',
        sortable: true,
        cellRenderer: 'bkStatusRenderer',
        ...AGGridHelper.tagColumnDefaultParams,
        width: 150,
        minWidth: 150,
      },
      {
        headerName: 'BK Stage',
        field: 'bankruptcyStageId',
        sortable: true,
        cellRenderer: (data: any): string => (data?.value ? this.bankruptcyStages.find((type: SelectOption) => type.id === data.value)?.name : ''),
        width: 240,
        minWidth: 240,
      },
      {
        headerName: 'BK Abandoned',
        field: 'abandoned',
        sortable: true,
        suppressSizeToFit: true,
        cellRenderer: (data: any): string => this.yesNoPipe.transform(data.value),
      },
      {
        headerName: 'BK Trustee Amount',
        field: 'amountToTrustee',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: (data: any): string => CurrencyHelper.toUsdFormat(data, true),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'BK Attorney Amount',
        field: 'amountToAttorney',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: (data: any): string => CurrencyHelper.toUsdFormat(data, true),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'BK Claimant Amount',
        field: 'amountToClaimant',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: (data: any): string => CurrencyHelper.toUsdFormat(data, true),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Lien ID',
        field: 'lienId',
        sortable: true,
        width: 240,
        minWidth: 240,
      },
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    components: {
      bkStatusRenderer: BankruptcyStatusRendererComponent,
      PayeeRenderer: PaymentQueueRendererComponent,
      AccountRenderer: AccountRendererComponent,
    },
  };

  private paymentQueueGridLocalData: IGridLocalData;

  constructor(
    public modal: BsModalRef,
    public store: Store<ProjectsCommonState>,
    public router: Router,
    public elRef: ElementRef<any>,
    public actionsSubj: ActionsSubject,
    public pusher: PusherService,
    protected enumToArray: EnumToArrayPipe,
    public modalService: ModalService,
    public messageService: MessageService,
    public route: ActivatedRoute,
    protected elementRef: ElementRef,
    protected splitCamelCase: SplitCamelCasePipe,
    public permissionService: PermissionService,
    protected logger: LogService,
    protected readonly yesNoPipe: YesNoPipe,
    protected stagesService: StagesService,
    protected productCategoriesService: ProductCategoriesService,
  ) {
    super(router, elRef);
  }

  public ngOnInit(): void {
    this.subscribeToPaymentQueueGridLocalData();
    this.subscribeToDropdownsOptions();

    this.store.dispatch(paymentQueueActions.GetLienPaymentStages());
    this.store.dispatch(paymentQueueActions.GetLienStatuses());
    this.store.dispatch(paymentQueueActions.GetBankruptcyStages());
  }

  protected fetchData(gridParams: IServerSideGetRowsParamsExtended): void {
    const searchOpts = SearchOptionsHelper.createSearchOptions(this.paymentQueueGridLocalData, this.paymentQueueGridParams);
    searchOpts.startRow = gridParams.request.startRow;
    searchOpts.endRow = gridParams.request.endRow;
    searchOpts.sortModel = gridParams.request.sortModel;

    this.store.dispatch(paymentQueueActions.GetSelectedPaymentQueueGrid({ searchOpts, agGridParams: gridParams, projectId: this.projectId }));
  }

  private subscribeToPaymentQueueGridLocalData(): void {
    this.store.select(rootSelectors.gridLocalDataByGridId({ gridId: this.parentGridId }))
      .pipe(first())
      .subscribe((data: IGridLocalData) => {
        this.paymentQueueGridLocalData = data;
      });
  }

  private subscribeToDropdownsOptions(): void {
    this.lienPaymentStages$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((items: SelectOption[]) => {
      this.lienPaymentStages = items;
    });

    this.lienStatuses$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((items: SelectOption[]) => {
      this.lienStatuses = items;
    });

    this.bankruptcyStages$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((items: SelectOption[]) => {
      this.bankruptcyStages = items;
    });
  }

  public ngOnDestroy(): void {
    this.store.dispatch(rootActions.ClearGridLocalData({ gridId: this.gridId }));
    super.clearFilters();
    super.ngOnDestroy();
  }
}
