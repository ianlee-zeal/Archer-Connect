import { Component, OnInit, Input, OnDestroy, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ActionsSubject, Store } from '@ngrx/store';
import { GridOptions, ValueGetterParams } from 'ag-grid-community';

import { EntityTypeEnum, CommunicationLevelEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { DateFormatPipe } from '@shared/_pipes/date-format.pipe';
import * as fromShared from '@shared/state';
import { DragAndDropService, PermissionService } from '@app/services';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { GridId } from '@app/models/enums/grid-id.enum';
import * as commonActions from '@app/modules/shared/state/common.actions';
import { RelatedPage } from '@app/modules/shared/grid-pager/related-page.enum';
import { stripHtml } from 'string-strip-html';
import { CommunicationRecord } from '@app/models/communication-center';
import { takeUntil } from 'rxjs/operators';
import { CommunicationEscalationStatusEnum } from '@app/models/enums/communication-escalation-status.enum';
import * as MsgReader from '@sharpenednoodles/msg.reader-ts';
import * as rootActions from '@app/state/root.actions';
import { CommunicationActionPanelRendererComponent } from './renderers/action-panel-renderer/communication-action-panel-renderer';
import { AttachmentCellRendererComponent } from './renderers/attachment-cell-renderer/attachment-cell-renderer.component';
import { CommunicationCustomTooltip } from './renderers/communication-custom-tooltip/communication-custom-tooltip';
import { HtmlTooltipRendererComponent } from '../../shared/_renderers/html-tooltip-renderer/html-tooltip-renderer.component';
import * as actions from './state/actions';
import * as commActions from '../call-widget/state/actions';
import { IGetCommunicationListRequestParams } from './state/actions';
import { GotoCommunication, SaveAttachedEmail } from '../communication/state/actions';
import { ofType } from '@ngrx/effects';

@Component({
  selector: 'app-communication-list',
  templateUrl: './communication-list.component.html',
  styleUrls: ['./communication-list.component.scss'],
})
export class CommunicationListComponent extends ListView implements OnInit, OnDestroy {
  @Input() public entityId: number;
  @Input() public entityType: EntityTypeEnum;
  @Input() public relatedPage = RelatedPage.ClaimantsCommunications;
  @Input() parentSelector: string;

  public canEditClientCommunicationsPermission = PermissionService.create(PermissionTypeEnum.ClientCommunications, PermissionActionTypeEnum.Edit);
  public readonly gridId: GridId = GridId.Communications;

  public get isProjectPage() {
    return this.relatedPage === RelatedPage.ProjectCommunications;
  }

  private get methodColumnName() {
    return this.isProjectPage ? 'Method' : 'Type';
  }
  private get notesColumnConfigs() {
    return this.isProjectPage ? {
      sortable: false,
      filter: false,

    } : {
      sortable: true,
      ...AGGridHelper.getCustomTextColumnFilter(),
    };
  }

  public ngUnsubscribe$ = new Subject<void>();

  public gridOptions: GridOptions = {
    animateRows: false,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    components: {
      buttonRenderer: CommunicationActionPanelRendererComponent,
      attachmentRenderer: AttachmentCellRendererComponent,
      customTooltip: CommunicationCustomTooltip,
      htmlTooltip: HtmlTooltipRendererComponent,
    },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  private readonly actionBar = {
    clearFilter: this.clearFilterAction(),
    logCommunication: {
      callback: () => this.onCreateNewCommunication(),
      permissions: PermissionService.create(PermissionTypeEnum.ClientCommunications, PermissionActionTypeEnum.Create),
    },
  };

  private get canReadNotes(): boolean {
    return this.permissionService.canRead(PermissionTypeEnum.CommunicationNotes);
  }

  constructor(
    router: Router,
    elementRef: ElementRef,
    private readonly store: Store<fromShared.AppState>,
    private readonly dateFormat: DateFormatPipe,
    private readonly permissionService: PermissionService,
    private readonly dragAndDropService: DragAndDropService,
    private readonly actionsSubj: ActionsSubject,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    // TODO: drag and drop to claimant communications grid
    if (this.entityType === EntityTypeEnum.Projects) {
      this.subscribeToEmailAddedEvent();
    }

    this.actionsSubj.pipe(
      ofType(commActions.FinishCallCompleted),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() =>
    this.store.dispatch(actions.GetCommunicationListRequest({
      payload: {
        agGridParams: this.gridParams,
        entityId: this.entityId,
        entityType: this.entityType,
      },
      entity: this.isProjectPage ? GridId.Projects : GridId.Claimants,
    })));
    this.store.dispatch(actions.UpdateActionBar({ actionBar: this.actionBar }));
    this.setColumnDefs();
  }

  private setColumnDefs() {
    this.gridOptions.columnDefs = [
      {
        headerName: 'Date',
        field: 'createdDate',
        valueFormatter: params => this.dateFormat.transform(params.node.data && params.node.data.createdDate, false, 'MM/dd/yyyy', null, true),
        sortable: true,
        sort: 'desc',
        ...AGGridHelper.dateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter({ isAutofocused: true }),
      },
      {
        headerName: 'Direction',
        field: 'direction.displayName',
        width: 120,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: this.methodColumnName,
        field: 'method.displayName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Level',
        hide: !this.isProjectPage,
        field: 'level.id',
        sortable: true,
        ...AGGridHelper.getDropdownColumnFilter({
          options: [
            {
              id: CommunicationLevelEnum.Standard,
              name: CommunicationLevelEnum[CommunicationLevelEnum.Standard],
            },
            {
              id: CommunicationLevelEnum.Escalation,
              name: CommunicationLevelEnum[CommunicationLevelEnum.Escalation],
            },
          ],
        }),
        ...AGGridHelper.nameColumnDefaultParams,
        valueFormatter: data => CommunicationLevelEnum[data.value],
      },
      {
        headerName: 'Escalation Status',
        hide: !this.isProjectPage,
        field: 'escalationStatus.id',
        colId: 'escalationStatusId',
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
        valueFormatter: data => CommunicationEscalationStatusEnum[data.value],
      },
      {
        headerName: 'Party Type',
        field: this.isProjectPage ? 'projectCommunicationPartyTypeName' : 'partyType.displayName',
        width: 150,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Organization',
        hide: !this.isProjectPage,
        field: 'org.name',
        width: 150,
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
        headerName: 'Logged By',
        field: 'createdBy.displayName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Subject',
        field: 'subject.displayName',
        width: 215,
        resizable: true,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Result',
        field: 'result.displayName',
        width: 200,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Note',
        field: 'lastNoteText',
        width: 220,
        minWidth: 220,
        valueGetter: (params: ValueGetterParams) => {
          const communication: CommunicationRecord = params.data;

          if (!communication.lastNoteText) {
            return '';
          }

          const noteText: string = stripHtml(communication.lastNoteText).result;

          return noteText.length > 50 ? `${noteText.slice(0, 50)}...` : noteText;
        },
        tooltipComponent: 'htmlTooltip',
        tooltipField: 'lastNoteText',
        ...this.notesColumnConfigs,
      },
      {
        headerName: 'Docs',
        width: 53,
        ...AGGridHelper.fixedColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        colId: 'documentsCount',
        tooltipComponent: 'customTooltip',
        cellRenderer: 'attachmentRenderer',
        filter: false,
        field: 'relatedDocuments',
        tooltipValueGetter: params => {
          if (params.value && params.value.length) {
            const documents = params.value || [];
            // convert documents dto to array of ["documentName.extension"]
            return documents.map(x => {
              let result = x.fileName;
              if (x.mimeType && x.mimeType.extension) {
                result = { name: `${result}.${x.mimeType.extension}`, extension: x.mimeType.extension };
              }

              return result;
            });
          }

          return null;
        },
      },
      AGGridHelper.getActionsColumn({ onEditHandler: this.onEditHandler.bind(this) }),
    ];
  }

  public onCreateNewCommunication(): void {
    this.store.dispatch(commonActions.CreatePager({ relatedPage: this.relatedPage, settings: { current: 0, count: 1, backUrl: null } }));
    this.store.dispatch(GotoCommunication({ claimantId: this.entityId, id: 'new', canReadNotes: this.canReadNotes, entity: this.isProjectPage ? GridId.Projects : GridId.Claimants }));
  }

  protected onRowDoubleClicked({ data }, edit: boolean = false): void {
    const navSettings = AGGridHelper.getNavSettings(this.gridApi);
    this.store.dispatch(commonActions.CreatePager({
      relatedPage: this.relatedPage,
      settings: navSettings,
      pager: {
        payload: {
          agGridParams: this.gridParams,
          entityId: this.entityId,
          entityType: this.entityType,
          forPaging: true,
        } as IGetCommunicationListRequestParams,
      },
    }));

    this.store.dispatch(GotoCommunication({
      claimantId: this.entityId,
      id: data.id,
      canReadNotes: this.canReadNotes,
      entity: this.isProjectPage ? GridId.Projects : GridId.Claimants,
      canEditCommunication: edit && this.permissionService.has(this.canEditClientCommunicationsPermission),
    }));
  }

  protected fetchData(params): void {
    this.gridParams = params;
    this.store.dispatch(actions.GetCommunicationListRequest({
      payload: {
        agGridParams: params,
        entityId: this.entityId,
        entityType: this.entityType,
      },
      entity: this.isProjectPage ? GridId.Projects : GridId.Claimants,
    }));
  }

  private onEditHandler(data): void {
    this.onRowDoubleClicked({ data }, true);
  }

  private subscribeToEmailAddedEvent() {
    this.dragAndDropService.subscribeToDragAndDropEvents(
      this.parentSelector,
      (error: string) => this.store.dispatch(rootActions.Error({ error })),
      (
        file: File,
        data: MsgReader.MSGFileData,
        attachments: MsgReader.MSGAttachmentData[],
      ) => {
        this.store.dispatch(SaveAttachedEmail({ attachedEmail: { file, outlookData: data, attachments } }));
        this.store.dispatch(GotoCommunication({
          claimantId: this.entityId,
          id: 'new',
          canReadNotes: this.canReadNotes,
          entity: this.entityType === EntityTypeEnum.Projects ? GridId.Projects : GridId.Claimants, // TODO: pass the type
        }));
      },
    );
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
