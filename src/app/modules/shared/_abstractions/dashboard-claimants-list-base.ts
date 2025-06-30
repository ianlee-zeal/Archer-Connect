import { EventEmitter, Output, ElementRef, Directive } from '@angular/core';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { ColDef } from 'ag-grid-community';
import { ColumnExport } from '@app/models';
import { ExportLoadingStatus } from '@app/models/enums';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { Channel } from 'pusher-js';
import { PusherService } from '@app/services/pusher.service';
import { exportsSelectors } from '@app/modules/shared/state/exports/selectors';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import * as exportsActions from '@shared/state/exports/actions';
import { Store } from '@ngrx/store';
import { LienState } from '@app/modules/liens-dashboards/state/reducer';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

/**
 * Base class for claimants lists related to dashboards
 *
 * @export
 * @abstract
 * @class DashboardClaimantsListBase
 * @extends {ListView}
 * @template TDetailsPayload
 */
@Directive()
export abstract class DashboardClaimantsListBase<TDetailsPayload> extends ListView {
  /**
   * Event fired when user should open claimant details page
   *
   * @memberof DashboardClaimantsListBase
   */
  @Output()
  readonly goToDetails = new EventEmitter<TDetailsPayload>();

  /**
   * Event fired when claimants grid filter was changed
   *
   * @memberof DashboardClaimantsListBase
   */
  @Output()
  readonly gridFiltersChanged = new EventEmitter();

  /**
   * Checks grid filter, and if filter exists, fires related event.
   *
   * @protected
   * @param {IServerSideGetRowsParamsExtended} params - grid params
   * @memberof DashboardClaimantsListBase
   */

  protected channel: Channel;
  protected isExporting = false;

  public actionBar: ActionHandlersMap = {
    download: {
      disabled: () => this.isExporting,
      options: [
        { name: 'Standard', callback: () => this.exportClientsList(this.gridOptions.columnDefs) },
      ],
    },
    exporting: { hidden: () => !this.isExporting },
  };

  constructor(
    protected store$: Store<LienState>,
    protected router: Router,
    protected elementRef : ElementRef,
    protected pusher: PusherService,
  ) {
    super(router, elementRef);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.store$.select(exportsSelectors.isExporting).pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(result => { this.isExporting = result; });
  }

  protected raiseFilterChangedEvent(params: IServerSideGetRowsParamsExtended) {
    if (params.request && params.request.filterModel?.length) {
      this.gridFiltersChanged.emit();
    }
    this.gridParams = params;
  }

  protected export(channel: string, onSubscribedCallback: () => void) {
    this.store$.dispatch(exportsActions.SetExportStatus({ isExporting: true }));

    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    this.channel = this.pusher.subscribeChannel(
      channel,
      // eslint-disable-next-line no-restricted-globals
      Object.keys(ExportLoadingStatus).filter(key => !isNaN(Number(ExportLoadingStatus[key.toString()]))),
      this.exportClientsListCallback.bind(this),
      onSubscribedCallback.bind(this),
    );
  }

  protected exportClientsList(columns: ColDef[]): void {
    const params = this.getExportParams();

    const columnsParam = columns.map(item => {
      const container: ColumnExport = {
        name: item.headerName,
        field: item.field,
      };
      return container;
    });

    this.downloadClaimants(params, columnsParam);
  }

  private exportClientsListCallback(data, event): void {
    this.store$.dispatch(exportsActions.SetExportStatus({ isExporting: false }));

    switch ((<any>ExportLoadingStatus[event])) {
      case ExportLoadingStatus.Complete:
        this.downloadClaimantsDocument(data.docId);
        break;
      case ExportLoadingStatus.Error:
        this.onError(data.message);
        break;
      default:
        break;
    }
  }

  public refreshGrid(): void {
    if (this.gridApi) {
      this.gridApi.onFilterChanged();
      this.gridApi.refreshHeader();
    }
  }

  abstract downloadClaimants(params: IServerSideGetRowsParamsExtended, columnsParam: ColumnExport[]);

  abstract downloadClaimantsDocument(id: number);

  abstract onError(error: string);
}
