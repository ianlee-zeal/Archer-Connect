import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { GridId } from '@app/models/enums/grid-id.enum';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { ModalService } from '@app/services';
import { ActionsSubject, Store } from '@ngrx/store';
import { GridOptions, ICellRendererParams } from 'ag-grid-community';
import { Subject } from 'rxjs';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import * as fromShared from '@shared/state';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { filter, takeUntil } from 'rxjs/operators';
import * as disbursementGroupSelectors from '@app/modules/disbursement-groups/state/selectors';
import { DisbursementGroupButtonsRendererComponent } from '@app/modules/disbursement-groups/renderers/disbursement-group-buttons-renderer';
import { NavigateToProjectDisbursementGroupsTab } from '@app/state/navigational.actions';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { CheckboxEditorRendererComponent } from '@app/modules/shared/_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import * as exportsActions from '@shared/state/exports/actions';
import { Channel } from 'pusher-js';
import { PusherService } from '@app/services/pusher.service';
import { DisbursementGroupTypeEnum, EntityTypeEnum, ExportLoadingStatus, JobNameEnum } from '@app/models/enums';
import { CurrencyHelper } from '@app/helpers/currency.helper';
import { StringHelper } from '@app/helpers';
import { ValueWithTooltipRendererComponent } from '@app/modules/shared/_renderers/value-with-tooltip-renderer/value-with-tooltip-renderer.component';
import * as claimantActions from '../../../state/actions';
import { DownloadClientDisbursementGroupsDocument, ExportClientDisbursementGroupsRequest, GetClaimantDisbursementGroupListRequest } from '../state/actions';

@Component({
  selector: 'app-claimant-disbursements-list',
  templateUrl: './claimant-disbursements-list.component.html',
  styleUrls: ['./claimant-disbursements-list.component.scss'],
})
export class ClaimantDisbursementGroupList implements OnInit, OnDestroy {
  @Input() public claimantId: number;

  public readonly gridId: GridId = GridId.ClaimantDisbursementGroupList;

  public readonly exportOrderColumns: string[] = [
    'ID',
    'Name',
    'Type',
    'Stage',
    'SSN',
    'Amount',
    'Defense Approved Date',
    'Settlement Approved Date',
    'ARCHER Approved Date',
    'Follow Up Date',
    'Created Date',
  ];

  public types$ = this.store.select(disbursementGroupSelectors.disbursementGroupTypes);
  public stages$ = this.store.select(disbursementGroupSelectors.disbursementGroupStages);

  public types: SelectOption[] = [];
  public stages: SelectOption[] = [];

  private channel: Channel;
  private actionBar: ActionHandlersMap;

  public bsModalRef: BsModalRef;
  protected ngUnsubscribe$ = new Subject<void>();
  public readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'ID',
        field: 'disbursementGroup.sequence',
        width: 60,
        minWidth: 60,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
      },
      {
        headerName: 'Name',
        field: 'disbursementGroup.name',
        sortable: true,
        suppressSizeToFit: true,
        minWidth: 220,
        width: 220,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Type',
        field: 'disbursementGroup.typeName',
        sortable: true,
        width: 160,
        colId: 'disbursementGroup.disbursementGroupTypeId',
        ...AGGridHelper.getDropdownColumnFilter({ options: this.types }),
      },
      {
        headerName: 'Payment Enabled',
        headerTooltip: 'Payment Enabled',
        field: 'disbursementGroup.paymentEnabled',
        colId: 'disbursementGroup.paymentEnabled',
        sortable: true,
        minWidth: 120,
        cellRenderer: 'activeRenderer',
        cellClass: 'ag-cell-before-edit ag-cell-before-edit-centered',
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        ...AGGridHelper.tagColumnDefaultParams,
      },
      {
        headerName: 'Stage',
        cellRenderer: 'valueWithTooltip',
        field: 'disbursementGroup.stageName',
        sortable: true,
        width: 60,
        colId: 'disbursementGroup.stageId',
        ...AGGridHelper.getDropdownColumnFilter({ options: this.stages }),
      },
      {
        headerName: 'Amount',
        sortable: true,
        field: 'totalSettlementAmount',
        cellRenderer: (data: ICellRendererParams): string => CurrencyHelper.toUsdFormat(data),
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Defense Approved Date',
        field: 'disbursementGroup.defenseApprovedDate',
        resizable: true,
        sortable: true,
        cellRenderer: (data: ICellRendererParams): string => this.datePipe.transform(data.value),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Settlement Approved Date',
        headerTooltip: 'Settlement Approved Date',
        field: 'disbursementGroup.settlementApprovedDate',
        sortable: true,
        cellRenderer: (data: ICellRendererParams): string => this.datePipe.transform(data.value),
        resizable: false,
        suppressSizeToFit: true,
        width: 170,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'ARCHER Approved Date',
        field: 'disbursementGroup.archerApprovedDate',
        resizable: true,
        sortable: true,
        cellRenderer: (data: ICellRendererParams): string => this.datePipe.transform(data.value),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Follow Up Date',
        field: 'disbursementGroup.followUpDate',
        sortable: true,
        cellRenderer: (data: ICellRendererParams): string => this.datePipe.transform(data.value),
        resizable: false,
        suppressSizeToFit: true,
        width: 60,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Created Date',
        field: 'disbursementGroup.createdDate',
        sortable: true,
        cellRenderer: (data: ICellRendererParams): string => this.datePipe.transform(data.value),
        resizable: false,
        suppressSizeToFit: true,
        width: 70,
        ...AGGridHelper.dateColumnFilter(),
      },
      AGGridHelper.getActionsColumn({
        goToButton: {
          handler: this.goToProjectDisbursementGroupHandler.bind(this),
          title: 'View Disbursement Group',
        },
      }, 80),
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    components: {
      buttonRenderer: DisbursementGroupButtonsRendererComponent,
      activeRenderer: CheckboxEditorRendererComponent,
      valueWithTooltip: ValueWithTooltipRendererComponent,
    },
  };

  constructor(
    private readonly store: Store<fromShared.AppState>,
    protected readonly router: Router,
    public readonly modalService: ModalService,
    protected readonly elementRef : ElementRef,
    private readonly datePipe: DateFormatPipe,
    private actionsSubj: ActionsSubject,
    private pusher: PusherService,
  ) {
  }

  public ngOnInit(): void {
    this.types$
      .pipe(filter((item: SelectOption[]) => item && !!item.length), takeUntil(this.ngUnsubscribe$))
      .subscribe((types: SelectOption[]) => {
        this.types.splice(0);
        this.types.push({ id: DisbursementGroupTypeEnum.Provisional, name: 'Provisional' }, ...types);
      });

    this.stages$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((stages: SelectOption[]) => {
        this.stages.push(...stages);
      });
  }

  private exportClientsListCallback(data, event): void {
    this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
    this.store.dispatch(claimantActions.UpdateClaimantsActionBar({ actionBar: this.actionBar }));

    switch ((<any>ExportLoadingStatus[event])) {
      case ExportLoadingStatus.Complete:
        this.store.dispatch(DownloadClientDisbursementGroupsDocument({ id: data.docId }));
        break;
      case ExportLoadingStatus.Error:
        this.store.dispatch(claimantActions.Error({ error: `Error exporting: ${data.message}` }));
        break;
      default:
        break;
    }
  }

  onActionBarUpdated(actionBar): void {
    this.actionBar = actionBar;
    this.store.dispatch(claimantActions.UpdateClaimantsActionBar({ actionBar: { ...actionBar } }));
  }

  public onExportHandler(event): void {
    const channelName = StringHelper.generateChannelName(JobNameEnum.ExportClaimantDisbursementsList, this.claimantId, EntityTypeEnum.DisbursementGroupClaimant);
    this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
    this.store.dispatch(claimantActions.UpdateClaimantsActionBar({ actionBar: this.actionBar }));

    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    this.channel = this.pusher.subscribeChannel(
      channelName,
      // eslint-disable-next-line no-restricted-globals
      Object.keys(ExportLoadingStatus).filter((key: string) => !isNaN(Number(ExportLoadingStatus[key.toString()]))),
      this.exportClientsListCallback.bind(this),
      () => {
        this.store.dispatch(ExportClientDisbursementGroupsRequest({ clientId: this.claimantId, agGridParams: event.agGridParams, columns: event.columns, channelName }));
      },
    );
  }

  public fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.store.dispatch(GetClaimantDisbursementGroupListRequest({ clientId: this.claimantId, agGridParams }));
  }

  public goToProjectDisbursementGroupHandler(row): void {
    const { node: { data } } = row;

    this.store.dispatch(NavigateToProjectDisbursementGroupsTab({ projectId: data.disbursementGroup.projectId }));
  }

  public ngOnDestroy(): void {
    this.store.dispatch(claimantActions.UpdateClaimantsActionBar({ actionBar: null }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
