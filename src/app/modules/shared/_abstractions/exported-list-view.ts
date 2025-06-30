import { ActionCreator, ActionsSubject, Store } from '@ngrx/store';
/* eslint-disable no-restricted-globals */
import { ElementRef, Directive } from '@angular/core';
import { Router } from '@angular/router';
import { ExportLoadingStatus, JobNameEnum } from '@app/models/enums';
import { AppState } from '@app/state';

import { ColDef } from 'ag-grid-community';

import { sharedActions } from '@app/modules/shared/state';
import * as exportsActions from '@app/modules/shared/state/exports/actions';
import { PusherService } from '@app/services/pusher.service';
import { StringHelper } from '@app/helpers';
import { ColumnExport } from '@app/models';
import { Observable } from 'rxjs';
import { exportsSelectors } from '@app/modules/shared/state/exports/selectors';
import { takeUntil } from 'rxjs/operators';
import { ofType } from '@ngrx/effects';
import { ListView } from './list-view';
import { EnumToArrayPipe } from '../_pipes/enum-to-array.pipe';
import { ActionHandlersMap } from '../action-bar/action-handlers-map';
import { IServerSideGetRowsParamsExtended } from '../_interfaces/ag-grid/ss-get-rows-params';

@Directive()
export abstract class ExportedListView extends ListView {
  abstract actionBar: ActionHandlersMap;
  abstract readonly actionBar$: Observable<ActionHandlersMap>;
  abstract readonly downloadCompleteAction: ActionCreator;

  protected abstract jobName: JobNameEnum;
  protected abstract exportOrder: string[];
  protected abstract advancedExportColumns: ColumnExport[];

  protected isExporting = false;
  protected exportedFileName: string = null;

  constructor(
    router: Router,
    elementRef: ElementRef,
    protected readonly store: Store<AppState>,
    protected readonly pusher: PusherService,
    protected readonly enumToArray: EnumToArrayPipe,
    private readonly actionsSubj: ActionsSubject,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    super.ngOnInit();
    this.dispatchUpdateActionBarAction();

    this.store.select(exportsSelectors.isExporting).pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(result => { this.isExporting = result; });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(this.downloadCompleteAction),
    ).subscribe(() => {
      this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
      this.dispatchUpdateActionBarAction();
    });
  }

  protected exportStandard(columns: ColDef[]): void {
    const columnsParam = columns.map(item => {
      const container: ColumnExport = {
        name: item.headerName,
        field: item.colId || item.field,
      };
      return container;
    });
    columnsParam.sort((a, b) => this.exportOrder.indexOf(a.name) - this.exportOrder.indexOf(b.name));

    this.export(columnsParam);
  }

  protected exportAdvanced() {
    this.export(this.advancedExportColumns);
  }

  protected abstract dispatchError(message: string);
  protected abstract dispatchExportAction(params: IServerSideGetRowsParamsExtended, exportColumns: ColumnExport[], channelName: string);
  protected abstract dispatchUpdateActionBarAction();

  private export(exportColumns: ColumnExport[]): void {
    const params = this.getExportParams();

    const channelName = StringHelper.generateChannelName(JobNameEnum.ProbatesExport);

    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    this.channel = this.pusher.subscribeChannel(
      channelName,
      Object.keys(ExportLoadingStatus).filter(key => !isNaN(Number(ExportLoadingStatus[key.toString()]))),
      this.exportCallback.bind(this),
      () => {
        this.dispatchExportAction(params, exportColumns, channelName);
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
        this.dispatchUpdateActionBarAction();
      },
    );
  }

  protected getExportColumns(): ColDef[] {
    return this.gridOptions.columnDefs.filter(col => this.exportOrder.includes(col.headerName));
  }

  private exportCallback(data, event): void {
    switch ((<any>ExportLoadingStatus[event])) {
      case ExportLoadingStatus.Complete:
        this.store.dispatch(sharedActions.documentsListActions.DownloadDocument({ id: data.docId, fileName: this.exportedFileName }));
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
        break;
      case ExportLoadingStatus.Error:
        this.dispatchError(data.message);
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
        break;
      default:
        break;
    }
  }
}
