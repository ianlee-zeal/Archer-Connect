import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CellRendererSelectorResult, GridOptions, ICellRendererParams } from 'ag-grid-community';

import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { ModalService } from '@app/services';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { CreateOrUpdateTemplateRequest, DocumentTemplate } from '@app/models/documents/document-generators';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { IGridActionRendererParams } from '@app/entities';

import { AppState } from '@app/state';
import { Store } from '@ngrx/store';
import * as documentTemplateActions from '@app/modules/document-templates/state/actions';
import * as documentTemplatesSelectors from '@app/modules/document-templates/state/selectors';
import { filter, takeUntil } from 'rxjs/operators';
import { IdValue } from '@app/models';
import { DocumentTypeCellRendererComponent } from '../documents-list/document-type-cell-renderer/document-type-cell-renderer.component';
import { DocumentTemplatesGridActionsRendererComponent } from './document-templates-grid-actions-renderer/document-templates-grid-actions-renderer.component';
import { DocumentTemplateEditModalComponent, IDocumentTemplateEditModalData } from './document-template-edit-modal/document-template-edit-modal.component';
import { PermissionService } from '../../../services/permissions.service';
import { DateFormatPipe } from '../_pipes';
import { SelectHelper } from '@app/helpers/select.helper';
import { TestCSGenerationRequest } from '@app/models/docusign-sender/test-cs-generation-request';

@Component({
  selector: 'app-document-templates-grid',
  templateUrl: './document-templates-grid.component.html',
  styleUrls: ['./document-templates-grid.component.scss'],
})
export class DocumentTemplatesGridComponent extends ListView implements OnInit {
  @Input()
  readonly gridId: GridId;

  @Output()
  readonly fetch = new EventEmitter<IServerSideGetRowsParamsExtended>();

  @Output()
  readonly actionBarUpdate: EventEmitter<ActionHandlersMap> = new EventEmitter();

  @Output()
  readonly templateDelete = new EventEmitter<number>();

  @Output()
  readonly templateCreateOrUpdate = new EventEmitter<CreateOrUpdateTemplateRequest>();

  @Output()
  readonly testDITFile = new EventEmitter<{ templateId: number, request: TestCSGenerationRequest }>();

  @Output()
  readonly download = new EventEmitter<number>();

  private statuses$ = this.store.select(documentTemplatesSelectors.allDocumentStatuses);

  private statuses: IdValue[] = [];

  readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'ID',
        field: 'id',
        width: 80,
        maxWidth: 80,
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
      },
      {
        headerName: 'Name',
        field: 'name',
        sortable: true,
        minWidth: 200,
        width: 200,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'File Name',
        field: 'document.fileNameFull',
        colId: 'document.name',
        sortable: true,
        minWidth: 200,
        width: 200,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Type',
        field: 'document.documentType.name',
        cellRendererSelector: this.documentTypeCellRendererSelector.bind(this),
        sortable: true,
        minWidth: 180,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Project',
        field: 'projectName',
        colId: 'projectDocumentTemplate.project.name',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Status',
        field: 'document.status.name',
        colId: 'document.status.id',
        sortable: true,
        width: 100,
        minWidth: 100,
        ...AGGridHelper.getDropdownColumnFilter({ options: this.statuses }),
      },
      {
        headerName: 'Created By',
        field: 'createdBy.displayName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.lastModifiedByColumnDefaultParams,
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        valueFormatter: params => this.dateFormatPipe.transform(params.node.data && params.node.data.createdDate, false, null, null, true),
        sortable: true,
        ...AGGridHelper.dateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Last Modified By',
        field: 'lastModifiedBy.displayName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.lastModifiedByColumnDefaultParams,
      },
      {
        headerName: 'Last Modified Date',
        field: 'lastModifiedDate',
        sortable: true,
        cellRenderer: data => this.dateFormatPipe.transform(data.value, false, null, null, true),
        ...AGGridHelper.lastModifiedDateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      AGGridHelper.getActionsColumn(this.buildActionsRendererParams()),
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    onRowDoubleClicked: event => this.onEditDocumentTemplate(event.data),
    components: {
      buttonRenderer: DocumentTemplatesGridActionsRendererComponent,
      documentTypeRenderer: DocumentTypeCellRendererComponent,
    },
  };

  constructor(
    router: Router,
    elementRef : ElementRef,
    private readonly dateFormatPipe: DateFormatPipe,
    private readonly modalService: ModalService,
    private readonly permissionService: PermissionService,
    private readonly store: Store<AppState>,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.initActionBar();
    this.initDocumentStatuses();
  }

  private initActionBar() {
    this.actionBarUpdate.emit({
      new: {
        callback: () => this.showModalDialog(new CreateOrUpdateTemplateRequest(), []),
        permissions: PermissionService.create(PermissionTypeEnum.Templates, PermissionActionTypeEnum.Create),
      },
      clearFilter: this.clearFilterAction(),
    });
  }

  private initDocumentStatuses() {
    this.statuses$.pipe(
      filter(s => s && !this.statuses.length),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(statuses => {
      this.statuses.push(...statuses);
    });
    this.store.dispatch(documentTemplateActions.GetDocumentStatuses());
  }

  private onEditDocumentTemplate(template: DocumentTemplate) {
    if (!this.permissionService.canEdit(PermissionTypeEnum.Templates)) {
      return;
    }
    const request = new CreateOrUpdateTemplateRequest();
    request.id = template.id;
    request.documentId = template.document.id;
    request.documentStatusId = template.document.status?.id;
    request.documentTypeId = template.document.documentType.id;
    request.fileName = template.document.fileNameFull;
    request.name = template.name;
    request.projects = template.projects?.map(item => item.name).join(', ') || null;
    request.projectIds = template.projects?.map(item => item.id) || null;
    request.isGlobal = template?.isGlobal;
    request.relatedDocumentTemplateId = template?.relatedDocumentTemplateId;
    request.envelopeHeader = template?.envelopeHeader;
    request.emailSubjectLine = template?.emailSubjectLine;
    request.emailIntro = template?.emailIntro;
    request.emailBody = template?.emailBody;
    request.emailFooter = template?.emailFooter;
    request.ccSignedDocuments = template?.ccSignedDocuments;
    request.electronicDeliveryProviderId = template?.electronicDeliveryProviderId;
    request.recipients = template?.testRecipients;
    if (template?.lastTestedBy) {
      request.lastTestedBy = `${template?.lastTestedBy?.firstName} ${template?.lastTestedBy?.lastName}`;
    }
    request.lastTestedDate = template?.lastTestedDate;
    this.showModalDialog(request, template.projects);
  }

  private onDownloadDocumentTemplate(template: DocumentTemplate): void {
    this.download.emit(template.document.id);
  }

  private showModalDialog(template: CreateOrUpdateTemplateRequest, projects: IdValue[]): void {
    this.modalService.show(DocumentTemplateEditModalComponent, {
      initialState: this.buildModalState(template, projects) as Partial<DocumentTemplateEditModalComponent>,
      class: 'modal-lg',
    });
  }

  private buildModalState(template: CreateOrUpdateTemplateRequest, projects: IdValue[]): IDocumentTemplateEditModalData {
    return {
      template,
      selectedProjects: projects.map(item => SelectHelper.toKeyValuePair(item)),
      title: `${template.documentId ? 'Edit' : 'Create New'} Template`,
      onTemplateDelete: (id: number) => this.templateDelete.emit(id),
      onTemplateCreateOrUpdate: (request: CreateOrUpdateTemplateRequest) => this.templateCreateOrUpdate.emit(request),
      onTestDITFile: (templateId: number, request: TestCSGenerationRequest) => this.testDITFile.emit({templateId, request})
    };
  }

  private buildActionsRendererParams(): IGridActionRendererParams<DocumentTemplate> {
    return {
      editHandler: this.onEditDocumentTemplate.bind(this),
      downloadHandler: this.onDownloadDocumentTemplate.bind(this),
    };
  }

  private documentTypeCellRendererSelector(params: ICellRendererParams): CellRendererSelectorResult {
    const template = params.data as DocumentTemplate;
    const comboBox = {
      component: 'documentTypeRenderer',
      params: { document: template.document },
    };
    return comboBox;
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;
    this.fetch.emit(agGridParams);
  }
}
