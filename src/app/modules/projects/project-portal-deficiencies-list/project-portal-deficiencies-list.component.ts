import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { GridId } from '@app/models/enums/grid-id.enum';
import { DateFormatPipe, EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { MessageService, ModalService, PermissionService } from '@app/services';
import { ActionsSubject, Store } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';
import { takeUntil, filter, first } from 'rxjs/operators';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { AGGridHelper, SearchOptionsHelper, StringHelper } from '@app/helpers';
import { DeficienciesButtonsRendererComponent } from '@app/modules/shared/deficiencies-list-base/deficiencies-buttons-renderer/deficiencies-buttons-renderer.component';
import { TextWithIconRendererComponent } from '@app/modules/shared/_renderers/text-with-icon-renderer/text-with-icon-renderer.component';
import { LinkActionRendererComponent } from '@app/modules/shared/_renderers/link-action-renderer/link-action-renderer.component';
import { AppState } from '../state';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import { PermissionTypeEnum, PermissionActionTypeEnum, JobNameEnum, ControllerEndpoints, DocumentGeneratorsLoading, EntityTypeEnum, DocumentType } from '@app/models/enums';
import { PusherService } from '@app/services/pusher.service';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { SaveDocumentGeneratorRequest } from '@app/models/documents';
import { OutputContainerType } from '@app/models/enums/document-generation/output-container-type';
import { OutputFileType } from '@app/models/enums/document-generation/output-file-type';
import { OutputType } from '@app/models/enums/document-generation/output-type';
import * as projectSelectors from '../state/selectors';
import { Project } from '@app/models';
import { DocumentTemplate } from '@app/models/documents/document-generators';
import { ofType } from '@ngrx/effects';
import { TypedAction } from '@ngrx/store/src/models';
import * as exportsActions from '@shared/state/exports/actions';
import { LogService } from '@app/services/log-service';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { exportsSelectors } from '@app/modules/shared/state/exports/selectors';
import { ListView } from '@app/modules/shared/_abstractions/list-view';

@Component({
  selector: 'app-project-portal-deficiencies-list',
  templateUrl: './project-portal-deficiencies-list.component.html',
})
export class ProjectPortalDeficienciesListComponent extends ListView {
  public gridId: GridId = GridId.ProjectPortalDeficiencies;
  public readonly currentProject$ = this.store.select(selectors.item);
  public isExporting = false;
  private readonly project$ = this.store.select(projectSelectors.item);
  public projectId: number;
  private deficienciesTemplate: DocumentTemplate;
  private deficienciesExportDocGenerator: SaveDocumentGeneratorRequest;
  public actionBar$ = this.store.select(projectSelectors.actionBar);

  public readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'Deficiency ID',
        field: 'id',
        sortable: true,
        resizable: true,
        width: 110,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
      },
      {
        headerName: 'Client ID',
        field: 'clientId',
        width: 75,
        sortable: true,
        resizable: true,
        sort: 'asc',
        cellRendererSelector: () =>
          AGGridHelper.getLinkActionRenderer({
            onAction: this.goToClientDetails.bind(this),
            showLink: this.onShowClientLink.bind(this),
          }),
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'Lien ID',
        field: 'lienId',
        sortable: true,
        ...AGGridHelper.numberColumnDefaultParams,
        width: 110,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'First Name',
        field: 'firstName',
        sortable: true,
        width: 200,
        minWidth: 200,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Last Name',
        field: 'lastName',
        sortable: true,
        width: 200,
        minWidth: 200,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Attorney Ref ID',
        field: 'attorneyReferenceId',
        sortable: true,
        width: 200,
        minWidth: 200,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Third Party ID',
        field: 'thirdPartyId',
        sortable: true,
        width: 200,
        minWidth: 200,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Deficiency Category',
        field: 'deficiencyCategoryName',
        sortable: true,
        width: 200,
        minWidth: 200,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Deficiency Type',
        field: 'deficiencyTypeDisplayName',
        sortable: true,
        width: 200,
        minWidth: 200,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Deficiency Type Id',
        field: 'deficiencyTypeId',
        sortable: true,
        resizable: true,
        width: 110,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'Notes',
        field: 'notes',
        sortable: true,
        resizable: true,
        width: 200,
        minWidth: 200,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    components: {
      buttonRenderer: DeficienciesButtonsRendererComponent,
      textWithIconRenderer: TextWithIconRendererComponent,
      linkActionRenderer: LinkActionRendererComponent,
    },
  };

  constructor(
    protected readonly store: Store<AppState>,
    protected readonly router: Router,
    protected messageService: MessageService,
    public readonly modalService: ModalService,
    protected readonly elementRef: ElementRef,
    protected readonly datePipe: DateFormatPipe,
    private readonly pusher: PusherService,
    private readonly actionsSubj: ActionsSubject,
    private readonly enumToArray: EnumToArrayPipe,
    private readonly logger: LogService,
  ) {
    super(router, elementRef);
  }

  public ngOnInit() {
    this.actionBar$
      .pipe(first())
      .subscribe((actionBar: ActionHandlersMap) => this.store.dispatch(actions.UpdateActionBar({ actionBar: this.getActionBar(actionBar) })));

    this.subscribeCurrentProject();
    this.subscribeToTemplateLoad();
    this.subscribeToExport();
  }

  private getActionBar(actionBar: ActionHandlersMap): ActionHandlersMap {
    return {
      ...actionBar,
      download: {
        disabled: () => this.isExporting,
        permissions: PermissionService.create(PermissionTypeEnum.ProjectDeficiencies, PermissionActionTypeEnum.Read),
        options: [
          { name: 'Deficiencies', callback: () => this.exportDeficienciesList() },
        ],
      },
      clearFilter: this.clearFilterAction(),
      exporting: { hidden: () => !this.isExporting },
    }
  }

  private subscribeCurrentProject(): void {
    this.project$
      .pipe(
        filter((c: Project) => !!c),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((c: Project) => {
        this.projectId = c.id;
        if (this.gridParams) {
          this.fetchData(this.gridParams);
        }
        this.store.dispatch(actions.LoadTemplates({
          templateTypes: [EntityTypeEnum.Projects],
          entityTypeId: EntityTypeEnum.Projects,
          documentTypes: [DocumentType.DeficiencyReport],
          entityId: this.projectId,
        }));
      });
  }

  private subscribeToTemplateLoad(): void {
    this.actionsSubj.pipe(
      ofType(actions.LoadTemplatesComplete),
      filter((action: {
        data: any;
      } & TypedAction<'[Project] Load Templates Complete'>) => !!action.data),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((action: {
      data: any;
    } & TypedAction<'[Project] Load Templates Complete'>) => {
      if (action.data?.templates?.length > 0) {
        const deficienciesTemplate = action.data.templates.find((template: DocumentTemplate) => template.name === 'Deficiency Report');
        if (deficienciesTemplate) {
          this.deficienciesTemplate = deficienciesTemplate;

        }
      }
    });
  }

  private subscribeToExport(): void {
    this.store.select(exportsSelectors.isExporting).pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((result: boolean) => { this.isExporting = result; });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(actions.GenerateDocumentsComplete),
    ).subscribe((action: { generationRequest: SaveDocumentGeneratorRequest; } & TypedAction<string>) => {
      this.deficienciesExportDocGenerator = action.generationRequest;
      this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
      this.actionBar$.pipe(first())
        .subscribe((actionBar: ActionHandlersMap) => this.store.dispatch(actions.UpdateActionBar({ actionBar: this.getActionBar(actionBar) })));
    });
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended) {
    this.gridParams = params;
    this.store.dispatch(actions.GetPortalDeficienciesList({ params }));
  }

  protected onShowClientLink(): boolean {
    return true;
  }

  protected goToClientDetails({ data }): void {
    this.router.navigate([`/claimants/${data.clientId}`]);
  }

  private exportDeficienciesList(): void {
    const channelName = StringHelper.generateChannelName(JobNameEnum.ExportPortalDeficiencies, this.projectId, EntityTypeEnum.Projects);

    const additionalRequest = SearchOptionsHelper
      .getFilterRequest([
        SearchOptionsHelper.getNumberFilter('caseId', FilterTypes.Number, 'equals', this.projectId),
      ]);

    this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));

    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    this.gridParams.request.filterModel = this.gridParams.request.filterModel.concat(additionalRequest.filterModel);
    const searchOptions = this.gridParams.request;

    const request: SaveDocumentGeneratorRequest = {
      id: null,
      channelName,
      name: 'Portal Deficiencies Export',
      entityTypeId: EntityTypeEnum.Projects,
      entityId: this.projectId,
      outputType: OutputType.Draft,
      outputFileType: OutputFileType.Xlsx,
      outputContainerType: OutputContainerType.Zip,
      outputFileNamingConvention: this.deficienciesTemplate.outputFileNamingConvention,
      watermark: this.deficienciesTemplate.watermark,
      templateIds: [this.deficienciesTemplate.id],
      templateFilters: [
        { entityId: this.projectId, entityTypeId: EntityTypeEnum.Projects, searchOptions: searchOptions }
      ],
      jobScheduleChronExpression: null,
      jobExternalId: null,
      generatorType: null,
      outputFileName: null,
      outputSaveChildDocs: null,
      recurrence: null,
      useIndividualTemplates: null,
    };

    this.store.dispatch(actions.GenerateDocuments({ controller: ControllerEndpoints.PortalDeficiencies, request }));
    this.channel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(DocumentGeneratorsLoading).map((i: { id: number; name: string; }) => i.name),
      this.exportDeficienciesListCallback.bind(this),
    );
  }

  private exportDeficienciesListCallback(data: any, event: string): void {
    switch (DocumentGeneratorsLoading[event]) {
      case DocumentGeneratorsLoading.Complete:
        this.store.dispatch(actions.DownloadGeneratedDocument({ generatorId: this.deficienciesExportDocGenerator.id }));
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
        break;
      case DocumentGeneratorsLoading.Error:
        this.logger.log('[exportPortalDeficienciesChannelEventHandler]', data);
        this.store.dispatch(actions.Error({ error: `Error exporting: ${data.message}` }));
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
        break;
      default:
        break;
    }
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));
  }
}
