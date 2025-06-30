import { Component, Input, OnDestroy, OnInit, Output, EventEmitter, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import {
  GridOptions,
  RowDoubleClickedEvent,
  ColDef,
  ICellRendererParams,
  GridApi,
  ValueFormatterParams,
} from 'ag-grid-community';
import { Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { takeUntil, filter, take } from 'rxjs/operators';
import { saveAs } from 'file-saver';

import { DocumentType, Document } from '@app/models/documents';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { MessageService } from '@app/services/message.service';
import { ModalService, PermissionService } from '@app/services';
import { Router } from '@angular/router';
import { DefaultGlobalSearchType, PermissionActionTypeEnum, EntityTypeEnum, PermissionTypeEnum, JobNameEnum, ExportLoadingStatus } from '@app/models/enums';
import { Policy } from '@app/modules/auth/policy';
import { GridId } from '@app/models/enums/grid-id.enum';
import * as fromAuth from '@app/modules/auth/state';
import { CommonHelper } from '@app/helpers/common.helper';
import { User, IdValue, UserInfo } from '@app/models';

import { ListRendererComponent } from '@app/modules/shared/_renderers';
import { PusherService } from '@app/services/pusher.service';
import { StringHelper } from '@app/helpers';
import * as exportsActions from '@shared/state/exports/actions';
import { exportsSelectors } from '@shared/state/exports/selectors';
import { DocumentsListActionsCellRendererComponent } from './documents-list-actions-renderer/documents-list-actions-renderer.component';
import { DocumentTypeCellRendererComponent } from './document-type-cell-renderer/document-type-cell-renderer.component';

import { UploadDocumentModalComponent } from '../upload-document-modal/upload-document-modal.component';
import { checkboxColumn } from '../_grid-columns/columns';
import { ListView } from '../_abstractions/list-view';
import { DateFormatPipe } from '../_pipes';
import * as fromShared from '../state';

import * as documentDetailsActions from '../state/document-details/actions';
import { ClearDocumentGridParams, ClearDocuments } from '../state/documents-list/actions';
import { SelectOption } from '../_abstractions/base-select';
import { EntityTypeRendererComponent } from './entity-type-renderer/entity-type-renderer.component';
import { IServerSideGetRowsParamsExtended } from '../_interfaces/ag-grid/ss-get-rows-params';
import * as auditDetailsActions from '../../auditor/audit-batches/audit-details/state/actions';
import { PAGES_COUNT_FACTOR } from '../records-per-page/records-per-page.component';

const { sharedActions } = fromShared;

export interface IUploadDocumentModalParams {
  title: string;
  document?: Document;
  onDocumentAdded: (document: Document) => void;
  onDocumentsAdded?: (document: Document) => void;
  onDocumentDelete?: (document: Document) => void;
  onDocumentUpdated?: (document: Document) => void;
}

const idColumn: ColDef = {
  headerName: 'ID',
  field: 'id',
  width: 120,
  minWidth: 120,
  sortable: true,
  ...AGGridHelper.fixedColumnDefaultParams,
  ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
};

@Component({
  selector: 'app-documents-list',
  templateUrl: './documents-list.component.html',
  styleUrls: ['./documents-list.component.scss'],
})
export class DocumentsListComponent extends ListView implements OnInit, OnChanges, OnDestroy {
  @Input() public entityId: number;
  @Input() public entityTypeId: number;
  @Input() public documentTypeId: number;
  @Input() public forOneEntityOnly: boolean;
  @Input() public isAutonomic: boolean;
  @Input() public documents: Document[];
  @Input() public gridId: GridId;
  @Input() public class: string = '';
  @Input() public dragDropStopPropagation: boolean = true;
  @Input() public emailDragAndDropEnabled: boolean = false;
  @Input() public additionalInfo: { [key: number]: any } = {};
  @Input() public skipSetContentHeight = false;
  @Input() public isContentAutoHeight = false;
  @Input() public enabledAutoHeight = true;
  @Input() public showNewDocumentButton: boolean = true;
  @Input() public additionalPageItemsCountValues: number[];

  /**
   * Gets or sets the flag indicating that file name should be filled automatically
   * when file is selected.
   *
   * @memberof DocumentsListComponent
   */
  @Input() setFileNameOnFileSelect = false;

  @Output() public onActionBarUpdated: EventEmitter<any> = new EventEmitter();

  public documentTypes$ = this.store.select(fromShared.sharedSelectors.documentsListSelectors.documentTypes);
  public allowedExtensions$ = this.store.select(fromShared.sharedSelectors.commonSelectors.allowedFileExtensions);
  public agGridParams$ = this.store.select(fromShared.sharedSelectors.documentsListSelectors.agGridParams);
  public entityTypes$ = this.store.select(fromShared.sharedSelectors.documentsListSelectors.entityTypes);
  private readonly user$ = this.store.select(fromAuth.authSelectors.getUser);
  private isExporting: boolean;

  private readonly canViewAuditInfoPermission = this.permissionService.has(PermissionService.create(PermissionTypeEnum.AuditInfo, PermissionActionTypeEnum.ProjectDocuments));

  public entityTypes: SelectOption[] = [];
  public selectedDocumentIds: number[] = [];
  public allowedExtensions: string[];
  public documentTypes: DocumentType[];
  public addedDocuments: Document[] = [];
  public bsModalRef: BsModalRef;
  public hidden = false;
  isInternalUser = false;

  public get gridOptions(): GridOptions {
    if (this.gOptions) {
      return this.gOptions;
    }

    this.gOptions = {
      columnDefs: [
        {
          headerName: 'Name',
          field: 'description',
          sortable: true,
          ...AGGridHelper.nameColumnDefaultParams,
          ...AGGridHelper.getCustomTextColumnFilter(),
        },
        {
          headerName: 'File Name',
          field: 'fileNameFull',
          colId: 'name',
          sortable: true,
          ...AGGridHelper.nameColumnDefaultParams,
          ...AGGridHelper.getCustomTextColumnFilter(),
        },
        {
          headerName: 'Type',
          field: 'documentType.name',
          cellRenderer: 'documentTypeRenderer',
          sortable: true,
          ...AGGridHelper.nameColumnDefaultParams,
          ...AGGridHelper.getCustomTextColumnFilter(),
        },
        {
          headerName: 'Entity Type',
          field: 'documentLink.entityType.name',
          colId: 'documentLink.entityType.id',
          cellRenderer: 'entityTypeRenderer',
          sortable: true,
          ...AGGridHelper.nameColumnDefaultParams,
          ...AGGridHelper.getDropdownColumnFilter({ options: this.entityTypes }),
          minWidth: 180,
          width: 180,
          hide: !this.isInternalUser,
          suppressColumnsToolPanel: !this.isInternalUser,
        },
        {
          headerName: 'Tracking ID',
          field: 'trackingIdentifier',
          width: 100,
          sortable: true,
          ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
          ...AGGridHelper.fixedColumnDefaultParams,
        },
        {
          headerName: 'Created By',
          field: 'createdBy.displayName',
          sortable: true,
          ...AGGridHelper.getCustomTextColumnFilter(),
          ...AGGridHelper.lastModifiedByColumnDefaultParams,
          hide: !this.canViewAuditInfoPermission,
        },
        {
          headerName: 'Created Date',
          field: 'createdDate',
          sortable: true,
          sort: 'desc',
          cellRenderer: (data: ICellRendererParams) => this.datePipe.transform(data.value, false, null, null, false),
          ...AGGridHelper.lastModifiedDateColumnDefaultParams,
          ...AGGridHelper.dateColumnFilter(),
          hide: !this.canViewAuditInfoPermission,
        },
        {
          headerName: 'Source',
          field: 'dataSourceId',
          sortable: true,
          ...AGGridHelper.getDataSourceFilter(),
          ...AGGridHelper.nameColumnDefaultParams,
          hide: !this.canViewAuditInfoPermission,
        },
        {
          headerName: 'Access',
          field: 'documentLink.isPublic',
          valueFormatter: (val: ValueFormatterParams) => this.getAccessValue(val.data.documentLinks[0].isPublic),
          sortable: true,
          hide: this.hideAccess,
          suppressColumnsToolPanel: this.hideAccess,
          ...AGGridHelper.nameColumnDefaultParams,
          ...AGGridHelper.getDocumentAccessFilter(),
        },
        {
          headerName: 'Shared With',
          field: 'organizationAccesses',
          cellRendererSelector: (params: ICellRendererParams) => (
            AGGridHelper.getListRenderer({
              ...params,
              value: this.getSharedWithValue(params.value),
            })
          ),
          sortable: false,
          hide: this.hideAccess,
          suppressColumnsToolPanel: this.hideAccess,
          ...AGGridHelper.nameColumnDefaultParams,
          minWidth: 250,
          width: 250,
        },
      ],
      animateRows: false,
      defaultColDef: {
        ...AGGridHelper.defaultGridOptions.defaultColDef,
        floatingFilter: true,
      },
      paginationPageSize: this.additionalPageItemsCountValues?.[0] ?? PAGES_COUNT_FACTOR,
      components: {
        listRenderer: ListRendererComponent,
        buttonRenderer: DocumentsListActionsCellRendererComponent,
        entityTypeRenderer: EntityTypeRendererComponent,
        documentTypeRenderer: DocumentTypeCellRendererComponent,
      },
      onSelectionChanged: this.selectionChanged.bind(this),
      onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
    } as GridOptions;

    if (this.isAutonomic) {
      this.gOptions.rowModelType = AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE;
      this.gOptions.columnDefs.push(AGGridHelper.getActionsColumn({ downloadDocumentHandler: (row: any) => this.onDownloadLocalDocument(row.data) }, 80));
      const fileNameColDef: ColDef = this.gOptions.columnDefs.find((c: ColDef) => c.field === 'fileNameFull');
      fileNameColDef.colId = 'fileNameFull';
    } else {
      this.gOptions.columnDefs.unshift(idColumn);

      this.gOptions.columnDefs.push(AGGridHelper.getActionsColumn({ downloadDocumentHandler: this.onDownloadDocumentHandler.bind(this) }, 80));

      if (this.gridId !== GridId.CommunicationDocuments
        && this.gridId !== GridId.TaskRelatedDocuments) {
        this.gOptions.columnDefs.unshift(checkboxColumn);
      }
    }

    if (this.gridId === GridId.TaskRelatedDocuments) {
      this.gOptions.columnDefs.splice(1, 0, {
        headerName: 'Related Subtask',
        field: 'documentLink.entityId',
        valueFormatter: (val: ValueFormatterParams) => {
          if (val.data.documentLinks[0].entityId === +this.entityId) {
            return 'N/A';
          }
          return this.additionalInfo[val.data.documentLinks[0].entityId];
        },
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      });
    }

    return this.gOptions;
  }

  public get hideAccess(): boolean {
    return !this.isInternalUser || ![EntityTypeEnum.Projects, EntityTypeEnum.Matter, EntityTypeEnum.DocumentGeneration].includes(this.entityTypeId);
  }

  private currentUser: User;
  private gOptions: GridOptions;
  private ngUnsubscribe = new Subject<void>();
  public readonly searchType = DefaultGlobalSearchType.Documents;

  constructor(
    private store: Store<fromShared.AppState>,
    private modalService: ModalService,
    protected router: Router,
    protected elementRef: ElementRef,
    private readonly datePipe: DateFormatPipe,
    private readonly messageService: MessageService,
    private readonly permissionService: PermissionService,
    private pusher: PusherService,
  ) {
    super(router, elementRef);
    this.subscribeToExport();
  }

  public ngOnInit(): void {
    super.ngOnInit();

    this.store.select(exportsSelectors.isExporting).pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(result => { this.isExporting = result; });

    this.user$.pipe(
      filter((user: UserInfo) => !!user),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((user: UserInfo) => {
      this.isInternalUser = user.defaultOrganization?.isMaster;
    });
    this.onUpdated();
    this.loadExtensions();
    this.store.dispatch(sharedActions.documentsListActions.GetEntityTypesRequest());
    this.subscribeToEntityTypes();

    if (!CommonHelper.isNullOrUndefined(this.entityTypeId)) {
      this.store.dispatch(sharedActions.documentsListActions.GetDocumentTypesByEntityId({ entityTypeId: this.entityTypeId }));
    }
    if (this.entityId !== undefined) {
      this.store.dispatch(sharedActions.documentsListActions.UpdateDocumentsListSearch({
        search: {
          entityId: this.entityId,
          documentTypeId: this.documentTypeId,
          entityTypeId: this.entityTypeId,
          forOneEntityOnly: this.forOneEntityOnly,
        },
      }));
    }

    this.documentTypes$
      .pipe(
        takeUntil(this.ngUnsubscribe),
        filter((value: DocumentType[]) => value !== null),
      )
      .subscribe((documentTypes: DocumentType[]) => { this.documentTypes = documentTypes; });

    this.agGridParams$.pipe(
      takeUntil(this.ngUnsubscribe),
    ).subscribe(
      (value: IServerSideGetRowsParamsExtended) => { this.gridParams = value; },
    );

    this.store.select(fromAuth.authSelectors.getUserDetails)
      .pipe(take(1))
      .subscribe((user: User) => { this.currentUser = user; });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { documents } = this;
    const documentsChanged = changes[CommonHelper.nameOf({ documents })];

    if (documentsChanged && documentsChanged.firstChange && this.documents) {
      this.addedDocuments.splice(0);
      this.addedDocuments.push(...this.documents);
    } else if (documentsChanged && this.isAutonomic && this.gridId === GridId.CommunicationDocuments) {
      this.addedDocuments = [...this.documents];
    }
    this.gridApi?.setGridOption('rowData', this.addedDocuments);
  }

  public onUpdated(): void {
    this.onActionBarUpdated.emit({
      new: {
        callback: () => (this.entityId && !this.isAutonomic ? this.upload() : this.add()),
        permissions: PermissionService.create(Policy.getDocuments(+this.entityTypeId), PermissionActionTypeEnum.Create),
        hidden: () => !this.showNewDocumentButton,
      },
      clearFilter: this.clearFilterAction(),
      exporting: { hidden: () => !this.isExporting },
    });
  }

  private subscribeToEntityTypes(): void {
    this.entityTypes$.pipe(
      filter((types: SelectOption[]) => types && !this.entityTypes.length),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((types: SelectOption[]) => {
      this.entityTypes.push(...types);
    });
  }

  private selectionChanged(): void {
    this.selectedDocumentIds = this.gridApi.getSelectedRows().map(row => row.id);
    this.onUpdated();
  }

  private getAccessValue(value: boolean | null): '' | 'Public' | 'Internal' {
    if (value == null) {
      return '';
    }
    return value ? 'Public' : 'Internal';
  }

  private getSharedWithValue(orgs: IdValue[]): string[] {
    return [
      'ARCHER',
      ...(orgs || [])
        .map((item: IdValue) => item.name)
        .filter((name: string) => name.toLowerCase() !== 'archer'),
    ];
  }

  public onRowDoubleClicked(event: RowDoubleClickedEvent): void {
    const hasPermissionManageWireInstructions = this.permissionService.has(PermissionService.create(PermissionTypeEnum.Documents, PermissionActionTypeEnum.ManageWireInstructions));
    if (this.gridId === GridId.TaskRelatedDocuments) { return; }

    if (this.gridId === GridId.OrgPaymentInstructionDocuments && !hasPermissionManageWireInstructions) { return; }

    const { data: row } = event;

    if (!row || !this.permissionService.has(PermissionService.create(Policy.getDocuments(+this.entityTypeId), PermissionActionTypeEnum.Edit))) {
      return;
    }

    this.edit(row as Document);
  }

  public documentUploaded(): void {
    if (this.gridApi) this.gridApi.refreshServerSide({ purge: true });
    this.bsModalRef.hide();

    this.onUpdated();
  }

  private documentAdded(document: Document): void {
    this.bsModalRef.hide();
    this.setUserData(document);
    this.updateDocumentsList(document);
  }

  private documentsAdded(documents: Document[]): void {
    this.addDocuments(documents);
    this.bsModalRef.hide();
  }

  private updateDocumentsList(document: Document): void {
    if (this.addedDocuments.indexOf(document) !== -1) {
      return;
    }

    this.addedDocuments.push(document);
    if (this.isAutonomic) {
      this.gridApi.setGridOption('rowData', this.addedDocuments);
    }

    this.store.dispatch(sharedActions.documentsListActions.SaveAddedDocuments({ documents: this.addedDocuments }));
  }

  addDocuments(documents: Document[]): void {
    documents.forEach((document: Document) => {
      this.setUserData(document);
    });
    this.addedDocuments.push(...documents);
    if (this.isAutonomic) {
      this.gridApi.setGridOption('rowData', this.addedDocuments);
    }
    this.store.dispatch(sharedActions.documentsListActions.SaveAddedDocuments({ documents: this.addedDocuments }));
  }

  redraw(): void {
    this.hidden = true;
    setTimeout(() => {
      this.hidden = false;
    }, 300);
  }

  private onDocumentDelete(document: Document): void {
    this.messageService
      .showDeleteConfirmationDialog('Confirm delete', 'Are you sure you want to delete this document?')
      .subscribe((answer: boolean) => {
        if (!answer) {
          return;
        }

        if (!this.isAutonomic) {
          this.store.dispatch(documentDetailsActions.DeleteDocument({
            documentId: document.id,
            onDocumentDeleted: () => {
              this.bsModalRef.hide();
              this.gridApi.deselectAll();
            },
          }));
        } else {
          this.addedDocuments = this.addedDocuments.filter((d: Document) => d !== document);
          this.gridApi.setGridOption('rowData', this.addedDocuments);
          this.bsModalRef.hide();
        }
      });
  }

  private documentUpdated(): void {
    this.bsModalRef.hide();
    if (this.isAutonomic) {
      this.gridApi.setGridOption('rowData', this.addedDocuments);
    }
  }

  public upload(): void {
    this.openUploadDocumentModal({
      title: 'Upload Document',
      onDocumentAdded: this.documentUploaded.bind(this),
    });
  }

  public add(): void {
    this.openUploadDocumentModal({
      title: 'Add document',
      onDocumentAdded: this.documentAdded.bind(this),
      onDocumentsAdded: this.documentsAdded.bind(this),
    });
  }

  public edit(document: Document): void {
    this.openUploadDocumentModal({
      title: 'Update Document',
      document,
      onDocumentAdded: this.documentUploaded.bind(this),
      onDocumentDelete: this.onDocumentDelete.bind(this),
      onDocumentUpdated: this.documentUpdated.bind(this),
    });
  }

  public download(): void {
    if (!this.selectedDocumentIds || !this.selectedDocumentIds.length) {
      return;
    }

    if (this.selectedDocumentIds.length > 1) {
      this.store.dispatch(sharedActions.documentsListActions.DownloadDocuments({ ids: this.selectedDocumentIds }));

      return;
    }
    // Need to get it like this for now
    const document = this.gridApi.getSelectedRows().map(row => row);
    this.export(document[0]);
  }

  public gridReady(gridApi: GridApi): void {
    this.gridApi = gridApi;

    if (this.gridParams) {
      this.gridApi.setFilterModel(this.gridParams.request.filterModel);
    }

    if (this.isAutonomic) {
      this.gridApi.setGridOption('rowData', this.addedDocuments);
    }
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;
    AGGridHelper.replaceSortColIdInSearchRequest(this.gridParams.request, 'dataSourceId', 'dataSource.name');
    this.reloadGrid();
  }

  public reloadGrid(): void {
    this.store.dispatch(sharedActions.documentsListActions.GetDocumentsList({ agGridParams: this.gridParams }));
  }

  private onDownloadDocumentHandler({ data }): void {
    this.export(data);
  }

  private openUploadDocumentModal(params: IUploadDocumentModalParams): void {
    const entityTypeId = params.document && params.document.documentLinks ? params.document.documentLinks[0].entityType.id : +this.entityTypeId;
    const defaultParams = {
      entityTypeId,
      entityId: this.entityId,
      allowedExtensions: this.allowedExtensions,
      documentTypes: this.documentTypes,
      isAutonomic: this.isAutonomic,
      setFileNameOnFileSelect: this.setFileNameOnFileSelect,
      stopPropagation: this.dragDropStopPropagation,
      emailDragAndDropEnabled: this.emailDragAndDropEnabled,
    };

    this.bsModalRef = this.modalService.show(UploadDocumentModalComponent, {
      initialState: {
        ...defaultParams,
        ...params,
      },
      class: 'modal-lg',
    });
  }

  private export(data): void {
    if (data?.filePath?.includes('elastic.com?batchId')) {
      if (this.isExporting) {
        return;
      }
      this.exportAuditDetails(data.id);
    } else {
      this.store.dispatch(sharedActions.documentsListActions.DownloadDocument({ id: data.id }));
    }
  }

  private exportAuditDetails(id: number): void {
    const channelName = StringHelper.generateChannelName(JobNameEnum.ExportAuditDetails);

    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    this.channel = this.pusher.subscribeChannel(
      channelName,
      Object.keys(ExportLoadingStatus).filter((key: string) => !Number.isNaN(Number(ExportLoadingStatus[key.toString()]))),
      this.exportClientsListCallback.bind(this),
      () => {
        this.store.dispatch(sharedActions.documentsListActions.ExportAuditDetails({
          id,
          channelName,
        }));
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
        this.onUpdated();
      },
    );
  }

  private exportClientsListCallback(data, event): void {
    switch ((<any>ExportLoadingStatus[event])) {
      case ExportLoadingStatus.Complete:
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
        this.store.dispatch(sharedActions.documentsListActions.DownloadDocument({ id: data.docId }));
        this.onUpdated();
        this.reloadGrid();
        break;
      case ExportLoadingStatus.Error:
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
        this.store.dispatch(auditDetailsActions.Error({ errorMessage: `Error exporting: ${data.message}` }));
        this.onUpdated();
        this.reloadGrid();
        break;
      default:
        break;
    }
  }

  private loadExtensions(): void {
    this.store.dispatch(sharedActions.commonActions.GetMimeTypes());

    this.allowedExtensions$
      .pipe(
        takeUntil(this.ngUnsubscribe),
        filter((value: string[]) => value !== null),
      )
      .subscribe((extensions: string[]) => { this.allowedExtensions = extensions; });
  }

  private onDownloadLocalDocument(doc: Document): void {
    if (doc.fileContent) {
      saveAs(doc.fileContent, doc.fileContent.name);
    }
  }

  private setUserData(document: Document): void {
    // eslint-disable-next-line no-param-reassign
    document.createdDate = new Date();
    // eslint-disable-next-line no-param-reassign
    document.createdBy = this.currentUser;
  }

  private subscribeToExport(): void {
    this.store.select(exportsSelectors.isExporting)
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(result => { this.isExporting = result; });
  }

  public clearGridFilters(): void {
    this.clearFilters();
  }

  public canClearGridFilters(): boolean {
    return this.canClearFilters();
  }

  public ngOnDestroy(): void {
    this.store.dispatch(ClearDocumentGridParams());

    if (!this.isAutonomic) {
      this.store.dispatch(ClearDocuments());
    }

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
