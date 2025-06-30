import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { ofType } from '@ngrx/effects';

import { Store, ActionsSubject } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { GridOptions, RowNode } from 'ag-grid-community';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { DocumentImport, DocumentImportTemplate } from '@app/models/documents';
import { DateFormatPipe, EnumToArrayPipe } from '@app/modules/shared/_pipes';
import * as fromAuth from '@app/modules/auth/state';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum, FileImportETLStatusEnum, EntityTypeEnum, DocumentImportLoading } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { GridPusherMessage } from '@app/models/documents/grid-pusher-message';
import { PusherService } from '@app/services/pusher.service';
import { sharedSelectors, sharedActions } from '../../../shared/state';
import * as selectors from '../../state/selectors';
import * as actions from '../../state/actions';
import * as fromProjects from '../../state';
import { ProjectImportsActionsRendererComponent } from './project-imports-actions-renderer/project-imports-actions-renderer.component';

@Component({
  selector: 'app-project-imports',
  templateUrl: './project-imports.component.html',
  styleUrls: ['./project-imports.component.scss'],
})
export class ProjectImportsComponent extends ListView implements OnInit, OnDestroy {
  readonly gridId: GridId = GridId.DocumentImports;

  private readonly authStore$ = this.store.select(fromAuth.authSelectors.getUser);

  readonly error$ = this.store.select(selectors.error);

  readonly documentImports$ = this.store.select(selectors.documentImports);

  private readonly allowedExtensions$ = this.store.select(sharedSelectors.commonSelectors.allowedFileExtensions);

  private readonly agGridParams$ = this.store.select(selectors.documentImportGridParams);

  private readonly item$ = this.store.select(selectors.item);

  private readonly documentImportTemplates$ = this.store.select(selectors.documentImportTemplates);

  public bsModalRef: BsModalRef;

  public projectId: number;

  public agGridParams: IServerSideGetRowsParamsExtended;

  private allowedExtensions: string[] = [];

  protected ngUnsubscribe$ = new Subject<void>();

  private timezone: string;

  public statusEnumOptions: SelectOption[] = this.enumToArrayPipe.transform(FileImportETLStatusEnum).sort((prev, current) => ((prev.name > current.name) ? 1 : -1));

  public documentImports: DocumentImport[] = [];

  public documentImportTemplates: SelectOption[] = [];

  public gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Id',
        field: 'id',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
        ...AGGridHelper.numberColumnDefaultParams,
      },
      {
        headerName: 'File Name',
        field: 'importDoc.name',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 250,
      },
      {
        headerName: 'Status',
        field: 'job.statusId',
        sortable: true,
        width: 50,
        cellRenderer: data => (data.value != null ? this.statusEnumOptions.find(type => type.id === data.value)?.name : ''),
        ...AGGridHelper.getDropdownColumnFilter({ options: this.statusEnumOptions }),
      },
      {
        headerName: 'Import Type',
        field: 'templateName',
        colId: 'template.id',
        sortable: true,
        ...AGGridHelper.getMultiselectDropdownColumnFilter({ options: this.documentImportTemplates }),
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 250,
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
        headerName: 'Total',
        field: 'countTotal',
        sortable: true,
        ...AGGridHelper.numberColumnDefaultParams,
      },
      {
        headerName: 'Inserts',
        field: 'countInserted',
        sortable: true,
        ...AGGridHelper.numberColumnDefaultParams,
      },
      {
        headerName: 'Updates',
        field: 'countUpdated',
        sortable: true,
        ...AGGridHelper.numberColumnDefaultParams,
      },
      {
        headerName: 'No Updates',
        field: 'countNotUpdated',
        sortable: true,
        ...AGGridHelper.numberColumnDefaultParams,
        minWidth: 110,
      },
      {
        headerName: 'Errors',
        field: 'countErrored',
        sortable: true,
        ...AGGridHelper.numberColumnDefaultParams,
      },
      {
        headerName: 'Warnings',
        field: 'countWarned',
        sortable: true,
        ...AGGridHelper.numberColumnDefaultParams,
        minWidth: 110,
      },
      AGGridHelper.getActionsColumn({
        editUploadBulkDocumentHandler: this.onEditUploadBulkDocumentModal.bind(this),
        downloadLogHandler: this.downloadLog.bind(this),
        downloadFilesHandler: this.downloadFiles.bind(this),
      }),
    ],
    animateRows: false,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    onRowDoubleClicked: this.onEditUploadBulkDocumentModal.bind(this),
    components: { buttonRenderer: ProjectImportsActionsRendererComponent },
  };

  constructor(
    private store: Store<fromProjects.AppState>,
    private actionsSubj: ActionsSubject,
    private datePipe: DateFormatPipe,
    protected router: Router,
    protected elementRef: ElementRef,
    private enumToArrayPipe: EnumToArrayPipe,
    private pusher: PusherService,
  ) {
    super(router, elementRef);
  }

  ngOnInit() {
    this.store.dispatch(actions.GetDocumentImportTemplatesRequest({ entityType: EntityTypeEnum.Projects }));

    this.documentImportTemplates$
      .pipe(
        filter(item => !!item && !this.documentImportTemplates.length),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((templates: DocumentImportTemplate[]) => {
        this.documentImportTemplates.push(...templates.map(o => ({ id: o.id, name: o.name })));
        if (this.gridApi) {
          this.gridApi.onFilterChanged();
          this.gridApi.refreshHeader();
        }
      });
    this.item$
      .pipe(
        filter(item => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(item => {
        this.projectId = item.id;
        if (this.gridParams) {
          this.getDocumentImports(this.gridParams);
        }
      });
    this.loadExtensions();

    this.authStore$.pipe(
      filter(user => !!user),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(user => {
      this.timezone = user.timezone && user.timezone.name;
    });

    this.agGridParams$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(value => {
        this.agGridParams = value;
      });

    // set function on action New open Modal to upload doc
    this.store.dispatch(actions.UpdateActionBar({
      actionBar: {
        new: {
          callback: () => this.openUploadBulkDocumentModal(),
          permissions: PermissionService.create(PermissionTypeEnum.ProjectImports, PermissionActionTypeEnum.Create),
        },
      },
    }));

    this.documentImports$.pipe(
      takeUntil(this.ngUnsubscribe$),
      filter(item => !!item),
    ).subscribe(data => {
      if (!this.documentImports?.length && data.length === 1 && this.gridApi) {
        this.gridApi.refreshServerSide({ purge: true });
      }
      this.documentImports = data;
    });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(sharedActions.uploadBulkDocumentActions.SubmitBulkDocumentSuccess),
    ).subscribe(() => this.getDocumentImports());

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(sharedActions.uploadBulkDocumentActions.GetDocumentImportByIdSuccess),
    ).subscribe(() => this.gridApi.refreshServerSide({ purge: true }));
  }

  private onPusherMessageReceivedCallback(data: GridPusherMessage, event): void {
    if ([DocumentImportLoading[DocumentImportLoading.Loading], DocumentImportLoading[DocumentImportLoading.Validating]].includes(event)) {
      this.gridApi.forEachNode((rowNode: RowNode) => {
        if (!!rowNode.data && !!rowNode.data.id && data.RowNo === rowNode.data.id) {
          rowNode.setDataValue('job.statusId', data.StatusId);
          rowNode.setDataValue('countTotal', data.Total);
          rowNode.setDataValue('countInserted', data.Inserted);
          rowNode.setDataValue('countUpdated', data.Updated);
          rowNode.setDataValue('countNotUpdated', data.NotUpdated);
          rowNode.setDataValue('countWarned', data.Warned);
          rowNode.setDataValue('countErrored', data.Errored);
          this.gridApi.flashCells({ rowNodes: [rowNode], columns: ['job.statusId', 'countTotal', 'countInserted', 'countUpdated', 'countNotUpdated', 'countWarned', 'countErrored'] });
        }
      });
    }
  }

  private onPusherMessageReceived(channelName: string): void {
    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    this.channel = this.pusher.subscribeChannel(
      channelName,
      // eslint-disable-next-line no-restricted-globals
      Object.keys(FileImportETLStatusEnum).filter(key => !isNaN(Number(FileImportETLStatusEnum[key.toString()]))),
      this.onPusherMessageReceivedCallback.bind(this),
    );
  }

  // Pass grid object to super class so it can do some default settings
  public gridReady(gridApi): void {
    super.gridReady(gridApi);
    if (this.gridApi) {
      this.gridApi.onFilterChanged();
      this.gridApi.refreshHeader();
    }
  }

  protected fetchData(params): void {
    this.gridParams = params;
    if (this.projectId) {
      const statusKeyIndex = this.gridParams.request.filterModel.findIndex(i => i.key === 'template.id');
      if (statusKeyIndex !== -1) {
        this.gridParams.request.filterModel[statusKeyIndex].filterType = 'number';
      }
      this.getDocumentImports(this.gridParams);
    }
  }

  private downloadLog({ data }): void {
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.DownloadLog({ id: data.id }));
  }

  private downloadFiles({ data }): void {
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.DownloadFiles({ id: data.id }));
  }

  private getDocumentImports(params = null): void {
    this.store.dispatch(actions.GetDocumentImportsRequest({ projectId: this.projectId, gridParams: params }));
  }

  public onEditUploadBulkDocumentModal(event): void {
    const documentImport = event.data as DocumentImport;
    documentImport.templateName = null;
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.EditUploadBulkDocumentModal({
      entityId: this.projectId,
      entityTypeId: EntityTypeEnum.Projects,
      allowedExtensions: this.allowedExtensions,
      documentImport,
      onPusherMessageReceived: data => this.onPusherMessageReceived(data),
    }));
  }

  private openUploadBulkDocumentModal(): void {
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.OpenUploadBulkDocumentModal({
      entityId: this.projectId,
      entityTypeId: EntityTypeEnum.Projects,
      allowedExtensions: ['.xlsx', '.xls', '.csv'],
      onPusherMessageReceived: data => this.onPusherMessageReceived(data),
    }));
  }

  ngOnDestroy(): void {
    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
      this.channel = null;
      this.store.dispatch(sharedActions.uploadBulkDocumentActions.ResetProgressValues());
    }
    this.store.dispatch(actions.ResetDocumentImports());
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  private loadExtensions(): void {
    this.store.dispatch(sharedActions.commonActions.GetMimeTypes());

    this.allowedExtensions$
      .pipe(
        filter(x => !!x),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(extensions => { this.allowedExtensions = extensions; });
  }
}
