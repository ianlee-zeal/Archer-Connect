/* eslint-disable no-restricted-globals */
import { Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store, ActionsSubject } from '@ngrx/store';
import { GridOptions, RowDoubleClickedEvent } from 'ag-grid-community';
import { ModalService, PermissionService } from '@app/services';
import { AuditEnabledCollectorIds, EntityTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';

import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { AppState } from '@app/state';
import { filter, takeUntil } from 'rxjs/operators';
import { ofType } from '@ngrx/effects';
import * as fromAuth from '@app/modules/auth/state';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { SearchTypeEnum } from '@app/models/enums/filter-type.enum';
import { SearchOptionsHelper } from '@app/helpers';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { RelatedPage } from '@app/modules/shared/grid-pager';
import { CreatePager } from '@app/modules/shared/state/common.actions';
import { AuditRun } from '@app/models/auditor/audit-run';
import * as rootSelectors from '@app/state/index';
import * as rootActions from '@app/state/root.actions';
import * as auditorCommonActions from '../state/actions';
import * as auditBatchesActions from './state/actions';
import * as auditBatchModalActions from './audit-batch-modal/state/actions';
import { collectorOptions } from './state/selectors';
import { AuditBatchModalComponent } from './audit-batch-modal/audit-batch-modal.component';
import { AuditBatchesActionsRendererComponent } from './audit-batches-actions-renderer/audit-batches-actions-renderer.component';
import { DownloadDocument } from '../../shared/state/upload-bulk-document/actions';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

@Component({
  selector: 'app-audit-batches',
  templateUrl: './audit-batches.component.html',
  styleUrls: ['./audit-batches.component.scss'],
})
export class AuditBatchesComponent extends ListView implements OnInit {
  readonly gridId: GridId = GridId.AuditBatches;

  private timezone: string;
  private readonly authStore$ = this.store.select(fromAuth.authSelectors.getUser);

  readonly actionBar: ActionHandlersMap = {
    new: {
      callback: () => this.openAuditBatchModal(),
      permissions: PermissionService.create(PermissionTypeEnum.DataProcessingAuditor, PermissionActionTypeEnum.Create),
    },
    clearFilter: this.clearFilterAction(),
  };

  private collectorOpts: SelectOption[] = [];
  private statusOpts: SelectOption[] = [];

  gridOptions: GridOptions;

  private readonly statusOpts$ = this.store.select(rootSelectors.statusesByEntityType({ entityType: EntityTypeEnum.AuditBatches }));
  private readonly collectorOpts$ = this.store.select(collectorOptions);

  constructor(
    private readonly store: Store<AppState>,
    private readonly modalService: ModalService,
    private readonly datePipe: DateFormatPipe,
    private actionsSubj: ActionsSubject,
    router: Router,
    elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.store.dispatch(auditorCommonActions.UpdateActionBar({ actionBar: this.actionBar }));

    this.statusOpts$.pipe(
      filter(s => s.length && !this.statusOpts.length),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(opts => {
      this.statusOpts.push(...opts.map(o => ({ id: o.id, name: o.name })));
      if (this.collectorOpts.length) {
        this.setGrid();
      }
    });

    this.collectorOpts$.pipe(
      filter(s => s.length && !this.collectorOpts.length),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(opts => {
      this.collectorOpts.push(...opts.map(o => ({ id: o.id, name: o.name })));
      if (this.statusOpts) {
        this.setGrid();
      }
    });

    if (!this.statusOpts.length) {
      this.store.dispatch(rootActions.GetStatuses({ entityType: EntityTypeEnum.AuditBatches }));
    }

    if (!this.collectorOpts.length) {
      const searchOptions: IServerSideGetRowsRequestExtended = SearchOptionsHelper.getFilterRequest([
        SearchOptionsHelper.getContainsFilter('id', FilterTypes.Number, SearchTypeEnum.Contains, AuditEnabledCollectorIds.join(',')),
      ]);
      searchOptions.endRow = -1;
      searchOptions.sortModel = [{ sort: 'asc', colId: 'name' }];

      this.store.dispatch(auditBatchesActions.GetCollectors({ searchOptions }));
    }

    this.authStore$.pipe(
      filter(user => !!user),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(user => {
      this.timezone = user.timezone && user.timezone.name;
    });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(auditBatchModalActions.RefreshAuditRunGrid),
    ).subscribe(() => this.gridApi.refreshServerSide({ purge: true }));
  }

  private setGrid() {
    this.gridOptions = {
      animateRows: false,
      columnDefs: [
        {
          headerName: 'ID',
          field: 'batchNumber',
          width: 50,
          sortable: true,
          suppressSizeToFit: true,
          ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
        },
        {
          headerName: 'File Name',
          field: 'inputDocument.fileName',
          colId: 'inputDocumentName',
          width: 100,
          sortable: true,
          ...AGGridHelper.getCustomTextColumnFilter({ isAutofocused: true }),
          ...AGGridHelper.nameColumnDefaultParams,
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
          field: 'auditDocImportTemplate.collector.name',
          colId: 'auditDocImportTemplate.collectorId',
          autoHeight: true,
          wrapText: true,
          sortable: true,
          ...AGGridHelper.getMultiselectDropdownColumnFilter({ options: this.collectorOpts }),
          maxWidth: 175,
        },
        {
          headerName: 'Uploaded By',
          field: 'createdBy.displayName',
          sortable: true,
          ...AGGridHelper.getCustomTextColumnFilter(),
          ...AGGridHelper.nameColumnDefaultParams,
        },
        {
          headerName: 'Uploaded Date',
          field: 'createdDate',
          sortable: true,
          sort: 'desc',
          cellRenderer: data => this.datePipe.transform(data.value, true, null, this.timezone),
          tooltipValueGetter: params => {
            const value = this.datePipe.transform(params.value, true, null, this.timezone);
            const length: number = value ? value.length : 0;
            const maxLength = 18;
            return length > maxLength ? value as string : null;
          },
          ...AGGridHelper.dateTimeColumnDefaultParams,
          ...AGGridHelper.dateColumnFilter(),
        },
        {
          headerName: 'Lien Count',
          field: 'liensCount',
          sortable: true,
          ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
          ...AGGridHelper.numberColumnDefaultParams,
          maxWidth: 100,
        },
        {
          headerName: 'Success',
          field: 'successCount',
          sortable: true,
          ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
          ...AGGridHelper.numberColumnDefaultParams,
          maxWidth: 80,
        },
        {
          headerName: 'Warnings',
          field: 'warningsCount',
          sortable: true,
          ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
          ...AGGridHelper.numberColumnDefaultParams,
          maxWidth: 80,
        },
        {
          headerName: 'Errors',
          field: 'errorsCount',
          sortable: true,
          ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
          ...AGGridHelper.nameColumnDefaultParams,
          maxWidth: 80,
        },
        AGGridHelper.getActionsColumn({
          viewHandler: this.onView.bind(this),
          downloadHandler: this.onDownloadResults.bind(this),
        }, 70, true),
      ],
      defaultColDef: {
        ...AGGridHelper.defaultGridOptions.defaultColDef,
        floatingFilter: true,
      },
      onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
      components: { buttonRenderer: AuditBatchesActionsRendererComponent },
    };
  }

  private onRowDoubleClicked(event: RowDoubleClickedEvent): void {
    const auditRun = event.data as AuditRun;

    if (auditRun) {
      const navSettings = AGGridHelper.getNavSettings(this.gridApi);
      this.store.dispatch(CreatePager({ relatedPage: RelatedPage.AuditRunSearch, settings: navSettings }));
      this.router.navigate(
        ['auditor', 'tabs', 'audit-batches', auditRun.id, 'tabs', 'audit-details'],
        { state: { navSettings } },
      );
    }
  }

  private openAuditBatchModal(): void {
    this.onView(null, true);
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;

    [{ id: 'runStatusId', name: 'runStatus.name' }, { id: 'auditDocImportTemplate.collectorId', name: 'auditDocImportTemplate.collector.name' }].forEach(key => {
      const keyIndex = this.gridParams.request.filterModel.findIndex(i => i.key === key.id);
      if (keyIndex !== -1) {
        this.gridParams.request.filterModel[keyIndex].filterType = 'number';
      }

      const colIndex = this.gridParams.request.sortModel.findIndex(i => i.colId === key.id);
      if (colIndex !== -1) {
        this.gridParams.request.sortModel[colIndex].colId = key.name;
      }
    });

    this.store.dispatch(auditBatchesActions.GetList({ agGridParams: this.gridParams }));
  }

  private onDownloadResults(id: number): void {
    this.store.dispatch(DownloadDocument({ id }));
  }

  private onView(auditRun: AuditRun, force: boolean = false) {
    if (!auditRun?.rowsCount && !force) {
      return;
    }

    this.modalService.show(AuditBatchModalComponent, {
      class: 'modal-lg wide-modal',
      initialState: { auditRun },
    });
  }

  public ngOnDestroy(): void {
    this.store.dispatch(auditorCommonActions.UpdateActionBar({ actionBar: null }));

    super.ngOnDestroy();
  }
}
