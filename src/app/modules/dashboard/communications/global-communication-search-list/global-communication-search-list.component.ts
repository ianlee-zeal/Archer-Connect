/* eslint-disable no-restricted-globals */
import { Component, OnInit, ElementRef, Input, OnDestroy } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';
import { ColDef, GridOptions, ICellRendererParams, RowDoubleClickedEvent, ValueFormatterParams } from 'ag-grid-community';
import { Router } from '@angular/router';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { DateFormatPipe } from '@app/modules/shared/_pipes/date-format.pipe';
import { ColumnExport, IdValue } from '@app/models';
import {
  EntityTypeEnum,
  ExportLoadingStatus,
  JobNameEnum,
  EntityTypeDisplayEnum,
  CommunicationLevelEnum,
  CommunicationEscalationStatusEnum,
  PermissionTypeEnum,
  PermissionActionTypeEnum,
} from '@app/models/enums';
import { ofType } from '@ngrx/effects';
import { takeUntil } from 'rxjs/operators';

import * as exportsActions from '@shared/state/exports/actions';
import * as claimantActions from '@app/modules/claimants/claimant-details/state/actions';
import { PusherService } from '@app/services/pusher.service';
import { exportsSelectors } from '@app/modules/shared/state/exports/selectors';
import { CreatePager } from '@app/modules/shared/state/common.actions';
import { RelatedPage } from '@app/modules/shared/grid-pager';
import { GridDateRangeSelectorComponent } from '@app/modules/shared/grid/grid-date-range-selector/grid-date-range-selector.component';
import { ClaimantDetailsRequest } from '@app/modules/shared/_abstractions';
import { NavigationSettings } from '@app/modules/shared/action-bar/navigation-settings';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { StringHelper } from '@app/helpers';
import { actions } from '../state';
import { AppState } from '../../../shared/state';
import { GlobalCommunicationSearchButtonsRenderer } from '../renderers/global-communication-search-buttons-renderer';
import { GoToCommunication } from '../state/actions';
import { PermissionService } from '@app/services';

@Component({
  selector: 'app-global-communication-search-list',
  templateUrl: './global-communication-search-list.component.html',
  styleUrls: ['./global-communication-search-list.component.scss'],
})
export class GlobalCommunicationSearchComponent extends ListView implements OnInit, OnDestroy {
  @Input() public gridId: GridId;
  public isExporting = false;

  private permissionType = PermissionTypeEnum.CommunicationNotes;
  protected readonly canReadNotes = this.permissionService.canRead(this.permissionType);
  private readonly canViewAuditInfoPermission = this.permissionService.has(PermissionService.create(PermissionTypeEnum.AuditInfo, PermissionActionTypeEnum.CommunicationsSearch));

  private readonly actionBar: ActionHandlersMap = {
    clearFilter: this.clearFilterAction(),
    download: {
      disabled: () => (
        !this.canClearFilters()
      ),
      options: [
        { name: 'Standard', callback: (): void => this.exportCommunicationsSearchList(this.gridOptions.columnDefs) },
      ],
    },
    exporting: { hidden: () => !this.isExporting },
  };
  public gridOptions: GridOptions = {
    animateRows: false,
    columnDefs: [
      {
        headerName: 'ACCommId',
        hide: true,
        field: 'id',
      },
      {
        headerName: 'ARCHER ID',
        field: 'archerId',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
      },
      {
        headerName: 'Attorney Ref ID',
        field: 'attorneyReferenceId',
        width: 140,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'First Name',
        field: 'claimantFirstName',
        sortable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Last Name',
        field: 'claimantLastName',
        sortable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Project Name',
        field: 'projectName',
        colId: 'caseName',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Date',
        field: 'createdDate',
        sortable: true,
        sort: 'desc',
        resizable: false,
        suppressSizeToFit: true,
        width: 260,
        cellRenderer: (data: ICellRendererParams): string => this.datePipe.transform(data.value),
        ...AGGridHelper.dateColumnFilter({ onDateRangeFilterChanged: (dates: Date[]) => this.onDateRangeFilterChanged('createdDate', dates) }),
      },
      {
        headerName: 'Direction',
        field: 'direction.displayName',
        width: 120,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Type',
        field: 'method.displayName',
        colId: 'method.displayName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Party Type',
        field: 'partyType.displayName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Party Name',
        field: 'callerName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Subject',
        field: 'subject.displayName',
        hide: true,
      },
      {
        headerName: 'Other Subject',
        field: 'otherSubject',
        hide: true,
      },
      {
        headerName: 'Result',
        field: 'result.displayName',
        hide: true,
      },
      {
        headerName: 'Note',
        field: 'note',
        hide: true,
      },
      {
        headerName: 'Attachments Count',
        field: 'documentsCount',
        hide: true,
      },
      {
        headerName: 'Created By',
        field: 'createdBy.displayName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        hide: !this.canViewAuditInfoPermission,
      },
      {
        headerName: 'Entity Type',
        field: 'entityTypeId',
        colId: 'communicationLinks.entityTypeId',
        sortable: true,
        ...AGGridHelper.getDropdownColumnFilter({
          options: [
            {
              id: EntityTypeEnum.Projects,
              name: EntityTypeDisplayEnum[EntityTypeEnum.Projects],
            },
            {
              id: EntityTypeEnum.Clients,
              name: EntityTypeDisplayEnum[EntityTypeEnum.Clients],
            },
          ],
        }),
        ...AGGridHelper.nameColumnDefaultParams,
        valueFormatter: (data: ValueFormatterParams): string => EntityTypeDisplayEnum[data.value],
      },
      {
        headerName: 'Level',
        field: 'level.id',
        sortable: true,
        ...AGGridHelper.getDropdownColumnFilter({
          options: [
            {
              id: CommunicationLevelEnum.Escalation,
              name: CommunicationLevelEnum[CommunicationLevelEnum.Escalation],
            },
            {
              id: CommunicationLevelEnum.Standard,
              name: CommunicationLevelEnum[CommunicationLevelEnum.Standard],
            },
          ],
        }),
        ...AGGridHelper.nameColumnDefaultParams,
        valueFormatter: (data: ValueFormatterParams): string => CommunicationLevelEnum[data.value],
      },
      {
        headerName: 'Escalation Status',
        field: 'escalationStatus.id',
        sortable: true,
        ...AGGridHelper.getDropdownColumnFilter({
          options: [
            {
              id: CommunicationEscalationStatusEnum.Active,
              name: CommunicationEscalationStatusEnum[CommunicationEscalationStatusEnum.Active],
            },
            {
              id: CommunicationEscalationStatusEnum.Resolved,
              name: CommunicationEscalationStatusEnum[CommunicationEscalationStatusEnum.Resolved],
            },
          ],
        }),
        ...AGGridHelper.nameColumnDefaultParams,
        valueFormatter: (data: ValueFormatterParams): string => CommunicationEscalationStatusEnum[data.value],
      },
      {
        headerName: 'CAPSCommId',
        field: 'externalId',
        hide: true,
      },
      AGGridHelper.getActionsColumn({ showGlobalCommunicationSearchHandler: this.onShowGlobalCommunication.bind(this) }),
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
    components: {
      buttonRenderer: GlobalCommunicationSearchButtonsRenderer,
      agDateInput: GridDateRangeSelectorComponent,
    },
  };

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;
    this.store.dispatch(actions.GetGlobalCommunicationSearchListRequest({ agGridParams }));
  }

  constructor(
    public store: Store<AppState>,
    private actionsSubj: ActionsSubject,
    protected router: Router,
    private datePipe: DateFormatPipe,
    private pusher: PusherService,
    protected elementRef: ElementRef,
    private readonly enumToArray: EnumToArrayPipe,
    private readonly permissionService: PermissionService
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: this.actionBar }));

    this.store.select(exportsSelectors.isExporting).pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((result: boolean) => { this.isExporting = result; });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(actions.DownloadCommunicationsComplete),
    )
      .subscribe(() => {
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
        this.store.dispatch(actions.UpdateActionBar({ actionBar: this.actionBar }));
      });
  }

  private exportCommunicationsSearchList(columns: ColDef[]): void {
    const columnsParam = columns.filter((x: ColDef) => x.colId !== 'actions').map((item: ColDef) => {
      const container: ColumnExport = {
        name: item.headerName,
        field: this.mapField(item.field),
      };
      return container;
    });

    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    const channelName = StringHelper.generateChannelName(JobNameEnum.ExportPersonsList);

    this.channel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(ExportLoadingStatus).map((i: IdValue) => i.name),
      this.exportCommunicationsListCallback.bind(this),
      () => (this.store.dispatch(actions.DownloadCommunications({
        searchOptions: this.getExportParams().request,
        columns: columnsParam,
        channelName,
      }))),
    );
  }

  private mapField(fieldName: string): string {
    switch (fieldName) {
      case 'projectName':
        return 'caseName';
      case 'entityTypeId':
        return 'entityTypeName';
      default:
        return fieldName;
    }
  }

  private exportCommunicationsListCallback(data, event): void {
    this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
    this.store.dispatch(actions.UpdateActionBar({ actionBar: this.actionBar }));

    switch ((<any>ExportLoadingStatus[event])) {
      case ExportLoadingStatus.Complete:
        this.store.dispatch(actions.DownloadCommunicationsDocument({ id: data.docId }));
        break;
      case ExportLoadingStatus.Error:
        this.store.dispatch(actions.Error({ error: `Error exporting: ${data.message}` }));
        break;
      default:
        break;
    }
  }

  private onShowGlobalCommunication(params: ICellRendererParams): void {
    const gridApi = this.getGridApi();

    const navSettings = <NavigationSettings>{
      current: params.node.rowIndex,
      count: gridApi.paginationGetRowCount(),
    };

    if (params.data.id && (params.data.claimantId || params.data.caseId)) {
      this.navigateToCommunication(navSettings, params.data.claimantId, params.data.id, params.data.caseId);
    }
  }

  private onRowDoubleClicked(row: RowDoubleClickedEvent): void {
    if (row.data.id) {
      const navSettings = AGGridHelper.getNavSettings(this.getGridApi());
      if (row.data.claimantId || row.data.caseId) {
        this.navigateToCommunication(navSettings, row.data.claimantId, row.data.id, row.data.caseId);
      }
    }
  }

  private navigateToCommunication(navSettings: NavigationSettings, claimantId: number | null, communicationId: number, caseId: number | null): void {
    const claimantDetailsRequest: ClaimantDetailsRequest = { gridParamsRequest: this.gridParams.request };
    this.store.dispatch(claimantActions.SetClaimantDetailsRequest({ claimantDetailsRequest }));
    this.store.dispatch(
      CreatePager({
        relatedPage: RelatedPage.GlobalCommunicationSearch,
        settings: navSettings,
        pager: {
          payload: {
            agGridParams: this.gridParams,
            entityId: claimantId != null ? claimantId : caseId,
            entityType: claimantId ? EntityTypeEnum.Clients : EntityTypeEnum.Projects,
          },
        },
      }),
    );

    this.store.dispatch(GoToCommunication({ entityId: claimantId ?? caseId, entityTypeId: claimantId ? EntityTypeEnum.Clients : EntityTypeEnum.Projects, id: communicationId, canReadNotes: this.canReadNotes }));
  }

  ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));
    super.ngOnDestroy();
  }
}
