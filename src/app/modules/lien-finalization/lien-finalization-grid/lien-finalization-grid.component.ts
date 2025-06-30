/* eslint-disable no-restricted-globals */
import { Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store, ActionsSubject } from '@ngrx/store';
import { GridOptions, RowDoubleClickedEvent } from 'ag-grid-community';
import { MessageService, ModalService, PermissionService } from '@app/services';
import { LienFinalizationEnabledCollectorIds, EntityTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum, JobNameEnum, LienFinalizationTool } from '@app/models/enums';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { AppState } from '@app/state';
import { filter, takeUntil } from 'rxjs/operators';
import { ofType } from '@ngrx/effects';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import * as rootSelectors from '@app/state/index';
import * as rootActions from '@app/state/root.actions';
import { ConfirmationModalComponent } from '@app/modules/shared/confirmation-modal/confirmation-modal.component';
import { CommonHelper, StringHelper } from '@app/helpers';
import { PusherService } from '@app/services/pusher.service';
import { CreatePager } from '@app/modules/shared/state/common.actions';
import { RelatedPage } from '@app/modules/shared/grid-pager';
import { LPMHelper } from '@app/helpers/lpm.helper';
import * as commonActions from '../state/actions';
import * as actions from './state/actions';
import * as lienProcessingModalActions from './lien-processing-modal/state/actions';
import { collectorOptions } from './state/selectors';
import { LienProcessingModalComponent } from './lien-processing-modal/lien-processing-modal.component';
import { LienFinalizationGridActionsRendererComponent } from './lien-finalization-grid-actions-renderer/lien-finalization-grid-actions-renderer.component';
import { DownloadDocument } from '../../shared/state/upload-bulk-document/actions';
import { CancelRun } from './state/actions';

@Component({
  selector: 'app-lien-finalization-grid',
  templateUrl: './lien-finalization-grid.component.html',
  styleUrls: ['./lien-finalization-grid.component.scss'],
})

export class LienFinalizationGridComponent extends ListView implements OnInit {
  readonly gridId: GridId = GridId.LienFinalization;

  readonly actionBar: ActionHandlersMap = {
    new: {
      callback: () => this.openLienProcessingModal(),
      permissions: PermissionService.create(PermissionTypeEnum.LienFinalizationTool, PermissionActionTypeEnum.Create),
    },
    clearFilter: this.clearFilterAction(),
  };

  private collectorOpts: SelectOption[] = null;
  private statusOpts: SelectOption[] = [];
  private currentFinalizationId: number;

  gridOptions: GridOptions;

  private readonly statusOpts$ = this.store.select(rootSelectors.statusesByEntityType({ entityType: EntityTypeEnum.LienFinalizationRun }));
  private readonly collectorOpts$ = this.store.select(collectorOptions);

  constructor(
    private readonly store: Store<AppState>,
    private messageService: MessageService,
    private readonly datePipe: DateFormatPipe,
    private actionsSubj: ActionsSubject,
    private pusher: PusherService,
    private readonly modalService: ModalService,
    router: Router,
    elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.store.dispatch(commonActions.UpdateActionBar({ actionBar: this.actionBar }));

    this.statusOpts$.pipe(
      filter(s => s.length && !this.statusOpts.length),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(opts => {
      this.statusOpts.push(...opts.map(o => ({ id: o.id, name: o.name })));
      if (this.collectorOpts) {
        this.setGrid();
      }
    });

    this.collectorOpts$.pipe(
      filter(s => s && !this.collectorOpts),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(opts => {
      this.collectorOpts = [];
      this.collectorOpts.push(...opts.map(o => ({ id: o.id, name: o.name })));
      if (this.statusOpts.length) {
        this.setGrid();
      }
    });

    if (!this.statusOpts.length) {
      this.store.dispatch(rootActions.GetStatuses({ entityType: EntityTypeEnum.LienFinalizationRun }));
    }

    if (!this.collectorOpts) {
      const firmIds = LienFinalizationEnabledCollectorIds;

      this.store.dispatch(actions.GetCollectors({ firmIds }));
    }

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(
        lienProcessingModalActions.RefreshLienFinalizationGrid,
        actions.CancelRunSuccess,
        actions.CompleteRunSuccess,
      ),
    ).subscribe(() => this.gridApi.refreshServerSide({ purge: true }));
  }

  private setGrid() {
    this.gridOptions = {
      animateRows: false,
      columnDefs: [
        {
          headerName: 'ID',
          field: 'id',
          width: 50,
          sortable: true,
          suppressSizeToFit: true,
          ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
        },
        {
          headerName: 'Status',
          field: 'runStatus.name',
          colId: 'runStatusId',
          autoHeight: true,
          wrapText: true,
          sortable: true,
          ...AGGridHelper.getMultiselectDropdownColumnFilter({ options: this.statusOpts }),
          maxWidth: 175,
        },
        {
          headerName: 'Collector',
          field: 'collectorOrg.name',
          colId: 'collectorOrg.id',
          autoHeight: true,
          wrapText: true,
          sortable: true,
          ...AGGridHelper.getMultiselectDropdownColumnFilter({ options: this.collectorOpts }),
        },
        {
          headerName: 'Created By',
          field: 'createdBy.displayName',
          sortable: true,
          ...AGGridHelper.getCustomTextColumnFilter(),
          ...AGGridHelper.nameColumnDefaultParams,
          width: 200,
        },
        {
          headerName: 'Created Date',
          field: 'createdDate',
          sortable: true,
          sort: 'desc',
          cellRenderer: data => this.datePipe.transform(data.value, true),
          ...AGGridHelper.dateTimeColumnDefaultParams,
          ...AGGridHelper.dateColumnFilter(),
        },
        {
          headerName: 'Number of Liens',
          field: 'selectedLienCount',
          sortable: true,
          ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
          ...AGGridHelper.numberColumnDefaultParams,
          width: 140,
        },

        AGGridHelper.getActionsColumn({ downloadHandler: this.onDownloadFile.bind(this),
          startFinalization: this.onStartFinalization.bind(this),
          cancelBatch: this.onCancelBatch.bind(this),
          openInLPM: this.onOpenInLPM.bind(this) }, 130, true),
      ],
      defaultColDef: {
        ...AGGridHelper.defaultGridOptions.defaultColDef,
        floatingFilter: true,
      },
      onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
      components: { buttonRenderer: LienFinalizationGridActionsRendererComponent },
    };
  }

  private onRowDoubleClicked(event: RowDoubleClickedEvent): void {
    const finalization = event.data as any;

    if (finalization) {
      const navSettings = AGGridHelper.getNavSettings(this.gridApi);
      this.store.dispatch(CreatePager({ relatedPage: RelatedPage.FinalizationSearch, settings: navSettings }));
      this.router.navigate(
        ['lien-finalization', 'tabs', 'lien-finalization', finalization.id, 'tabs', 'finalization-details'],
        { state: { navSettings } },
      );
    }
  }

  private openLienProcessingModal(): void {
    this.modalService.show(LienProcessingModalComponent, { class: 'modal-lg' });
  }

  private onStartFinalization(id: number): void {
    const initialState = {
      title: 'Confirm Run',
      message: 'Are you sure you want to start the run?',
      buttonOkText: 'Yes',
      showConfirmMsgClass: false,
      onRespond: (confirmed: boolean) => this.lienFinalizationRun(confirmed),
    };

    this.currentFinalizationId = id;

    this.modalService.show(ConfirmationModalComponent, { initialState });
  }

  private lienFinalizationRun(confirmed: boolean): void {
    if (confirmed) {
      this.startRun();
    }

    this.modalService.hide();
  }

  private startRun() {
    const id = CommonHelper.createEntityUniqueId();

    const channelName = StringHelper.generateChannelName(
      JobNameEnum.LienFinalizationRun,
      id,
      EntityTypeEnum.LienFinalizationRun,
    );

    this.subscribeToRunIntegrationPusher(channelName, () => {
      this.store.dispatch(lienProcessingModalActions.RunLienFinalization({ batchId: this.currentFinalizationId, lienFinalizationRunCreation: { batchId: this.currentFinalizationId, pusherChannelName: channelName } }));
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
      this.store.dispatch(lienProcessingModalActions.RefreshLienFinalizationGrid());
    }

    if (eventValue === LienFinalizationTool.Failed) {
      this.unsubscribeFromChannel();
      this.displayError(data.error);
    }

    if ([LienFinalizationTool.Completed, LienFinalizationTool.Failed].includes(eventValue)) {
      this.store.dispatch(lienProcessingModalActions.RefreshLienFinalizationGrid());
    }

    if (eventValue === LienFinalizationTool.Completed) {
      this.unsubscribeFromChannel();
    }
  }

  private displayError(message?: string) {
    this.store.dispatch(lienProcessingModalActions.ResetOnErrorState());
    this.store.dispatch(lienProcessingModalActions.Error({ error: message ?? 'Something went wrong. Try again' }));
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;

    [{ id: 'runStatusId', name: 'runStatus.name' }, { id: 'collectorOrg.id', name: 'collectorOrg.name' }].forEach(key => {
      const keyIndex = this.gridParams.request.filterModel.findIndex(i => i.key === key.id);
      if (keyIndex !== -1) {
        this.gridParams.request.filterModel[keyIndex].filterType = 'number';
      }

      const colIndex = this.gridParams.request.sortModel.findIndex(i => i.colId === key.id);
      if (colIndex !== -1) {
        this.gridParams.request.sortModel[colIndex].colId = key.name;
      }
    });

    this.store.dispatch(actions.GetList({ agGridParams: this.gridParams }));
  }

  private onDownloadFile(id: number): void {
    this.store.dispatch(DownloadDocument({ id }));
  }

  private onCancelBatch(id: number): void {
    this.messageService
      .showConfirmationDialog('Cancel Run', 'Are you sure you want to cancel the run?', 'Yes')
      .subscribe(answer => {
        if (!answer) {
          return;
        }
        this.store.dispatch(CancelRun({ id }));
      });
  }

  private onOpenInLPM(id: number): void {
    LPMHelper.viewInLPM('/#upload-details');
    this.store.dispatch(actions.CompleteRun({ id }));
  }

  public ngOnDestroy(): void {
    this.store.dispatch(commonActions.UpdateActionBar({ actionBar: null }));

    super.ngOnDestroy();
  }
}
