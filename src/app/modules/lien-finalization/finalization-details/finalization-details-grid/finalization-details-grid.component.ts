import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { takeUntil, filter } from 'rxjs/operators';
import { ActionsSubject, Store } from '@ngrx/store';
import { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { Router } from '@angular/router';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { GotoParentView } from '@app/modules/shared/state/common.actions';

import { AppState, sharedActions, sharedSelectors } from '@app/modules/shared/state';

import * as finalizationActions from '@app/modules/lien-finalization/state/actions';

import { LienFinalizationRun } from '@app/models/lien-finalization/lien-finalization-run';
import { ofType } from '@ngrx/effects';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { EntityTypeEnum, JobNameEnum, LienFinalizationTool, SearchTypeEnum } from '@app/models/enums';
import { SelectHelper } from '@app/helpers/select.helper';
import { ArrayHelper, CommonHelper, CurrencyHelper, SearchOptionsHelper, StringHelper } from '@app/helpers';
import { MessageService } from '@app/services';
import { PusherService } from '@app/services/pusher.service';
import { LPMHelper } from '@app/helpers/lpm.helper';
import { YesNoPipe } from '@app/modules/shared/_pipes/yes-no.pipe';
import { DownloadDocument } from '@app/modules/shared/state/upload-bulk-document/actions';
import { IdValue } from '@app/models/idValue';
import { FinalizationDetailsActionsRendererComponent } from './finalization-details-actions-renderer/finalization-details-actions-renderer.component';
import * as selectors from '../state/selectors';
import * as finalizationDetailsActions from '../state/actions';
import { CancelRun, CancelRunSuccess, CompleteRun, CompleteRunSuccess } from '../../lien-finalization-grid/state/actions';
import { RunAcceptance, RunLienFinalization } from '../../lien-finalization-grid/lien-processing-modal/state/actions';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { FilterModel } from '@app/models/advanced-search/filter-model';

@Component({
  selector: 'app-finalization-details-grid',
  styleUrls: ['./finalization-details-grid.component.scss'],
  templateUrl: './finalization-details-grid.component.html',
})
export class FinalizationDetailsGridComponent extends ListView implements OnInit, OnDestroy {
  public finalization: LienFinalizationRun;
  private stages: SelectOption[] = [];
  private lienTypes: SelectOption[] = [];
  private planTypes: SelectOption[] = [];
  private readonly stages$ = this.store.select(sharedSelectors.dropDownsValuesSelectors.stages);
  private readonly lienTypes$ = this.store.select(sharedSelectors.dropDownsValuesSelectors.lienTypes);
  private readonly planTypes$ = this.store.select(sharedSelectors.dropDownsValuesSelectors.planTypes);
  public readonly gridId: GridId = GridId.FinalizationDetails;

  public readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'Client ID',
        field: 'clientId',
        colId: 'lien.clientId',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'Lien ID',
        field: 'lienId',
        colId: 'lienId',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
      },
      {
        headerName: 'Client Name',
        field: 'clientName',
        colId: 'lien.client.FullName',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Client SSN',
        field: 'clientSsn',
        colId: 'lien.client.Ssn',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Lien Type',
        field: 'lienType',
        colId: 'lien.lienType',
        minWidth: 100,
        sortable: true,
        ...AGGridHelper.getMultiselectDropdownColumnFilter({ options: this.lienTypes, filterByName: true }),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Stage',
        field: 'stage',
        colId: 'lien.stage',
        minWidth: 100,
        sortable: true,
        ...AGGridHelper.getMultiselectDropdownColumnFilter({ options: this.stages, filterByName: true }),
      },
      {
        headerName: 'Collector ID',
        field: 'collector.id',
        colId: 'lien.collector.id',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'Collector Name',
        field: 'collector.name',
        colId: 'lien.collector.name',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Tort ID',
        field: 'tort.id',
        colId: 'lien.client.case.settlement.tort.id',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'Tort',
        field: 'tort.name',
        colId: 'lien.client.case.settlement.tort.name',
        minWidth: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Lien Holder ID',
        field: 'lienHolder.id',
        colId: 'lien.lienHolder.lienHolderId',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'Lien Holder',
        field: 'lienHolder.name',
        colId: 'lien.lienHolder.name',
        minWidth: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'On Benefits',
        field: 'onBenefits',
        colId: 'lien.onBenefits',
        minWidth: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Injury Description',
        field: 'descriptionOfInjury',
        colId: 'lien.client.descriptionOfInjury',
        minWidth: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Case Number',
        field: 'lienCaseNumber',
        colId: 'lien.caseNumber',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'Case ID',
        field: 'case.id',
        colId: 'lien.client.case.id',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'Case',
        field: 'case.name',
        colId: 'lien.client.case.name',
        minWidth: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Third Party Id',
        field: 'thirdPartyId',
        colId: 'lien.client.thirdPartyId',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'Identification Number',
        field: 'identificationNumber',
        colId: 'lien.identificationNumber',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Additional Information',
        field: 'additionalInformation',
        colId: 'lien.client.additionalInformation',
        minWidth: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Client State',
        field: 'clientState',
        colId: 'lien.client.state',
        minWidth: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Client Settlement Amount',
        field: 'clientSettlementAmount1',
        colId: 'lien.client.settlementAmount',
        minWidth: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.amountColumnDefaultParams,
        cellRenderer: data => this.toUsdFormat(data.value),
      },
      {
        headerName: 'Client Settlement Amount 2',
        field: 'clientSettlementAmount2',
        colId: 'lien.client.settlementAmount2',
        minWidth: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.amountColumnDefaultParams,
        cellRenderer: data => this.toUsdFormat(data.value),
      },
      {
        headerName: 'Client Settlement Amount 3',
        field: 'clientSettlementAmount3',
        colId: 'lien.client.settlementAmount3',
        minWidth: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.amountColumnDefaultParams,
        cellRenderer: data => this.toUsdFormat(data.value),
      },
      {
        headerName: 'Client Settlement Amount 4',
        field: 'clientSettlementAmount4',
        colId: 'lien.client.settlementAmount4',
        minWidth: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.amountColumnDefaultParams,
        cellRenderer: data => this.toUsdFormat(data.value),
      },
      {
        headerName: 'Client Settlement Amount 5',
        field: 'clientSettlementAmount5',
        colId: 'lien.client.settlementAmount5',
        minWidth: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.amountColumnDefaultParams,
        cellRenderer: data => this.toUsdFormat(data.value),
      },
      {
        headerName: 'Final Demand Amount',
        field: 'finalDemandAmount',
        colId: 'lien.FinalDemandAmount',
        minWidth: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.amountColumnDefaultParams,
        cellRenderer: CurrencyHelper.toUsdFormat,
      },
      {
        headerName: 'GRG Lien Id',
        field: 'grgLienId',
        colId: 'lien.grglienId',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Is MCO',
        field: 'isMco',
        colId: 'lien.isMco',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        cellRenderer: data => this.yesNoPipe.transform(data.value),
      },
      {
        headerName: 'Related Amount',
        field: 'relatedAmount',
        colId: 'lien.relatedAmount',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.amountColumnDefaultParams,
        cellRenderer: CurrencyHelper.toUsdFormat,
      },
      {
        headerName: 'Lien Amount',
        field: 'lienAmount1',
        colId: 'lien.lienAmount1',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.amountColumnDefaultParams,
        cellRenderer: data => this.toUsdFormat(data.value),
      },
      {
        headerName: 'Lien Amount 2',
        field: 'lienAmount2',
        colId: 'lien.lienAmount2',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.amountColumnDefaultParams,
        cellRenderer: data => this.toUsdFormat(data.value),
      },
      {
        headerName: 'Lien Amount 3',
        field: 'lienAmount3',
        colId: 'lien.lienAmount3',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.amountColumnDefaultParams,
        cellRenderer: data => this.toUsdFormat(data.value),
      },
      {
        headerName: 'Lien Amount 4',
        field: 'lienAmount4',
        colId: 'lien.lienAmount4',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.amountColumnDefaultParams,
        cellRenderer: data => this.toUsdFormat(data.value),
      },
      {
        headerName: 'Audited Amount',
        field: 'auditedAmount1',
        colId: 'lien.auditedAmount1',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.amountColumnDefaultParams,
        cellRenderer: CurrencyHelper.toUsdFormat,
      },
      {
        headerName: 'Audited Amount 2',
        field: 'auditedAmount2',
        colId: 'lien.auditedAmount2',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.amountColumnDefaultParams,
        cellRenderer: CurrencyHelper.toUsdFormat,
      },
      {
        headerName: 'Audited Amount 3',
        field: 'auditedAmount3',
        colId: 'lien.auditedAmount3',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.amountColumnDefaultParams,
        cellRenderer: CurrencyHelper.toUsdFormat,
      },
      {
        headerName: 'Audited Amount 4',
        field: 'auditedAmount4',
        colId: 'lien.auditedAmount4',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.amountColumnDefaultParams,
        cellRenderer: CurrencyHelper.toUsdFormat,
      },
      {
        headerName: 'Plan Type(s)',
        field: 'planTypes',
        colId: 'lien.planTypes',
        minWidth: 100,
        autoHeight: true,
        wrapText: true,
        ...AGGridHelper.getMultiselectDropdownColumnFilter({ options: this.planTypes }),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Govt Lien Total',
        field: 'govtLienTotal',
        colId: 'lien.govtLienTotal',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.amountColumnDefaultParams,
        cellRenderer: CurrencyHelper.toUsdFormat,
      },
      {
        headerName: 'Offset %',
        field: 'offset',
        colId: 'output.offsetMultiplier',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'Cap %',
        field: 'cap',
        colId: 'output.capMultiplier',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'Offset Amount',
        field: 'offsetAmount',
        colId: 'output.offset',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.amountColumnDefaultParams,
        cellRenderer: CurrencyHelper.toUsdFormat,
      },
      {
        headerName: 'Cap Amount',
        field: 'capAmount',
        colId: 'output.cap',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.amountColumnDefaultParams,
        cellRenderer: CurrencyHelper.toUsdFormat,
      },
      {
        headerName: 'Decision',
        field: 'decision',
        colId: 'output.ruleApplied',
        minWidth: 100,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Selected',
        field: 'selected',
        sortable: true,
        cellRendererParams: { onChange: this.selectLien.bind(this) },
        cellRenderer: 'activeRenderer',
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        ...AGGridHelper.tagColumnDefaultParams,
        minWidth: 200,
      },
      {
        headerName: 'Accepted',
        field: 'accepted',
        colId: 'output.accepted',
        sortable: true,
        cellRendererParams: { onChange: this.acceptLien.bind(this) },
        cellRenderer: 'activeRenderer',
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        ...AGGridHelper.tagColumnDefaultParams,
        minWidth: 200,
      },
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    components: { activeRenderer: FinalizationDetailsActionsRendererComponent },
  };

  private readonly actionBar: ActionHandlersMap = {
    back: { callback: () => this.cancel() },
    actions: {
      options: [
        {
          name: 'Accept',
          disabled: (): boolean => this.finalization?.runStatus?.id !== LienFinalizationTool.Review,
          callback: (): void => this.acceptRun(),
        },
        {
          name: 'Process',
          disabled: (): boolean => this.finalization?.runStatus?.id !== LienFinalizationTool.Pending,
          callback: (): void => this.finalizationRun(),
        },
        {
          name: 'Cancel',
          disabled: (): boolean => !([LienFinalizationTool.Pending, LienFinalizationTool.Review, LienFinalizationTool.Accepted]
            .includes(this.finalization?.runStatus?.id)),
          callback: (): void => this.cancelProcess(),
        },
        {
          name: 'Open In LPM',
          disabled: (): boolean => !([LienFinalizationTool.Accepted]
            .includes(this.finalization?.runStatus?.id)) || !this.finalization.resultDocumentId,
          callback: (): void => this.onOpenInLPM(),
        },
        {
          name: 'Download Mass Ops Result File',
          disabled: (): boolean => !([LienFinalizationTool.Accepted]
            .includes(this.finalization?.runStatus?.id)) || !this.finalization?.resultDocumentId,
          callback: (): void => this.onDownloadFile(this.finalization?.resultDocumentId),
        },
      ],
    },
    clearFilter: this.clearFilterAction(),
  };

  public finalizationDetailsHeader$ = this.store.select(selectors.finalizationDetailsHeader);

  constructor(
    private readonly actionsSubj: ActionsSubject,
    public store: Store<AppState>,
    protected router: Router,
    protected elementRef: ElementRef,
    public messageService: MessageService,
    private pusher: PusherService,
    private readonly yesNoPipe: YesNoPipe,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.store.dispatch(sharedActions.dropDownsValuesActions.GetStages({ entityTypeId: EntityTypeEnum.LienProducts }));
    this.store.dispatch(sharedActions.dropDownsValuesActions.GetLienTypes());
    this.store.dispatch(sharedActions.dropDownsValuesActions.GetPlanTypes());
    this.store.dispatch(finalizationActions.UpdateActionBar({ actionBar: this.actionBar }));

    this.subscribeToStages();
    this.subscribeToLienTypes();
    this.subscribeToFinalizationDetailsHeader();
    this.subscribeToPlanTypes();
    this.subscribeToSelectLienComplete();

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(CancelRunSuccess, CompleteRunSuccess),
    ).subscribe(() => {
      this.updateFinalizationDetails();
    });
  }

  public gridReady(gridApi: GridApi): void {
    super.gridReady(gridApi);
    if (this.gridApi) {
      this.gridApi.onFilterChanged();
      this.gridApi.refreshHeader();
    }
  }

  updateFinalizationDetails(): void {
    const searchOptions: IServerSideGetRowsRequestExtended = SearchOptionsHelper.getFilterRequest([
      SearchOptionsHelper.getContainsFilter('id', FilterTypes.Number, SearchTypeEnum.Equals, this.finalization.id.toString()),
    ]);
    searchOptions.endRow = 1;

    this.store.dispatch(finalizationDetailsActions.GetFinalizationDetails({ searchOptions }));
  }

  private onDownloadFile(id: number): void {
    this.store.dispatch(DownloadDocument({ id }));
  }

  cancelProcess(): void {
    this.messageService
      .showConfirmationDialog('Cancel Run', 'Are you sure you want to cancel the run?', 'Yes')
      .subscribe(answer => {
        if (!answer) {
          return;
        }
        this.store.dispatch(CancelRun({ id: this.finalization.id }));
      });
  }

  private acceptRun(): void {
    this.messageService.showConfirmationDialog('Confirm Accept operation', 'Are you sure you want to Accept?')
      .subscribe((answer: boolean) => {
        if (answer) {
          const id = CommonHelper.createEntityUniqueId();

          const channelName = StringHelper.generateChannelName(
            JobNameEnum.LienFinalizationRun,
            id,
            EntityTypeEnum.LienFinalizationRun,
          );

          this.subscribeToRunIntegrationPusher(channelName, () => {
            this.store.dispatch(RunAcceptance({ batchId: this.finalization.id, lienFinalizationRunCreation: { batchId: this.finalization.id, pusherChannelName: channelName } }));
          });
        }
      });
  }

  private finalizationRun(): void {
    const id = CommonHelper.createEntityUniqueId();

    const channelName = StringHelper.generateChannelName(
      JobNameEnum.LienFinalizationRun,
      id,
      EntityTypeEnum.LienFinalizationRun,
    );

    this.subscribeToRunIntegrationPusher(channelName, () => {
      this.store.dispatch(RunLienFinalization({ batchId: this.finalization.id, lienFinalizationRunCreation: { batchId: this.finalization.id, pusherChannelName: channelName } }));
    });
  }

  private unsubscribeFromChannel(): void {
    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
      this.channel = null;
    }
  }

  private subscribeToRunIntegrationPusher(channelName: string, onSubscribedCallback: () => void = null) {
    this.unsubscribeFromChannel();

    this.channel = this.pusher.subscribeChannel(
      channelName,
      ['LienFinalizationTool'],
      this.runIntegrationPusherCallback.bind(this),
      onSubscribedCallback,
    );
  }

  private runIntegrationPusherCallback(data: any): void {
    const eventValue = Number(data.Status);

    if ([LienFinalizationTool.Processing, LienFinalizationTool.Scheduled].includes(eventValue)) {
      this.updateFinalizationDetails();
    }

    if (eventValue === LienFinalizationTool.Failed) {
      this.unsubscribeFromChannel();
    }

    if ([LienFinalizationTool.Completed, LienFinalizationTool.Failed].includes(eventValue)) {
      this.updateFinalizationDetails();
    }

    if (eventValue === LienFinalizationTool.Completed) {
      this.unsubscribeFromChannel();
    }
  }

  selectLien(data): void {
    this.store.dispatch(finalizationDetailsActions.SelectLien({ id: data.id, status: !data.selected }));
  }

  acceptLien(data): void {
    this.store.dispatch(finalizationDetailsActions.AcceptLien({ id: data.id, status: !data.accepted }));
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;
    if (this.finalization?.id) {
      const key = 'batchId';
      const keyIndex = this.gridParams.request.filterModel.findIndex(i => i.key === key);
      if (keyIndex !== -1) {
        this.gridParams.request.filterModel[keyIndex].filter = this.finalization.id;
      } else {
        this.gridParams.request.filterModel.push(new FilterModel({
          filter: this.finalization?.id,
          filterType: FilterTypes.Number,
          key,
          type: 'equals',
        }));
      }

      this.store.dispatch(finalizationDetailsActions.GetFinalizationDetailsGrid({ agGridParams: this.gridParams }));
    }
  }

  private onOpenInLPM(): void {
    LPMHelper.viewInLPM('/#upload-details');
    this.store.dispatch(CompleteRun({ id: this.finalization.id }));
  }

  private subscribeToSelectLienComplete(): void {
    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(
        finalizationDetailsActions.SelectLienComplete,
        finalizationDetailsActions.AcceptLienComplete,
      ),
    ).subscribe(() => {
      if (this.gridParams) {
        this.fetchData(this.gridParams);
      }
    });
  }

  private subscribeToStages(): void {
    this.stages$.pipe(
      filter((stg: IdValue[]) => !!stg),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((items: IdValue[]) => {
      const opts = SelectHelper.toOptions(
        items,
        (opt: IdValue) => opt.id,
        (opt: IdValue) => opt.name,
      );
      if (this.stages.length) {
        ArrayHelper.empty(this.stages);
      }
      this.stages.push(...opts);
    });
  }

  private subscribeToLienTypes(): void {
    this.lienTypes$.pipe(
      filter((stg:IdValue[]) => !!stg),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((items: IdValue[]) => {
      const opts = SelectHelper.toOptions(
        items,
        (opt: IdValue) => opt.id,
        (opt: IdValue) => opt.name,
      );
      if (this.lienTypes.length) {
        ArrayHelper.empty(this.lienTypes);
      }
      this.lienTypes.push(...opts);
    });
  }

  private subscribeToPlanTypes(): void {
    this.planTypes$.pipe(
      filter((stg: IdValue[]) => !!stg),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((items: IdValue[]) => {
      const opts = SelectHelper.toOptions(
        items,
        (opt: IdValue) => opt.id,
        (opt: IdValue) => opt.name,
      );
      if (this.planTypes.length) {
        ArrayHelper.empty(this.planTypes);
      }
      this.planTypes.push(...opts);
      if (this.gridApi) {
        this.gridApi.onFilterChanged();
        this.gridApi.refreshHeader();
      }
    });
  }

  private subscribeToFinalizationDetailsHeader(): void {
    this.finalizationDetailsHeader$
      .pipe(
        filter((finalization: LienFinalizationRun) => !!finalization),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((finalization: LienFinalizationRun) => {
        this.finalization = finalization;
        const columns = this.gridApi.getColumnDefs();

        this.gridApi.setGridOption('columnDefs', columns.map((col: ColDef) => {
          if (col.headerName === 'Accepted') {
            return {
              ...col,
              hide: !([LienFinalizationTool.Accepted, LienFinalizationTool.Review, LienFinalizationTool.Completed]
                .includes(finalization?.runStatus?.id)),
              cellClassRules: { disabled: params => !params.data.selected
                || finalization?.runStatus?.id === LienFinalizationTool.Accepted
                || finalization?.runStatus?.id === LienFinalizationTool.Completed },
            };
          }

          if (col.headerName === 'Selected') {
            return {
              ...col,
              hide: !([LienFinalizationTool.Pending, LienFinalizationTool.Cancelled]
                .includes(finalization?.runStatus?.id)),
              cellClassRules: { disabled: () => finalization?.runStatus?.id === LienFinalizationTool.Cancelled },
            };
          }

          return col;
        }));

        if (this.gridParams) {
          this.fetchData(this.gridParams);
        }
      });
  }

  private toUsdFormat(data: any): string {
    return data ? CurrencyHelper.toUsdFormat({ value: data.toString().replace(/,/g, '').replace('$', '') }) : '';
  }

  public cancel(): void {
    this.store.dispatch(GotoParentView());
  }

  ngOnDestroy(): void {
    this.store.dispatch(finalizationActions.UpdateActionBar({ actionBar: null }));
    super.ngOnDestroy();
  }
}
