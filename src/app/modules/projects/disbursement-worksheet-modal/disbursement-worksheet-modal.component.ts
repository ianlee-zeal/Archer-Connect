import { Component, EventEmitter, OnDestroy } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ActionsSubject, Store } from '@ngrx/store';

import { filter, first, takeUntil } from 'rxjs/operators';
import * as rootSelectors from '@app/state/index';
import { GridId } from '@app/models/enums/grid-id.enum';
import { CommonHelper, SearchOptionsHelper, StringHelper } from '@app/helpers';
import { ofType } from '@ngrx/effects';
import { PusherService } from '@app/services/pusher.service';
import { Channel } from 'pusher-js';
import { DocumentGeneratorsLoading, EntityTypeEnum, FileImportTemplateTypes, JobNameEnum } from '@app/models/enums';
import { SaveDocumentGeneratorRequest } from '@app/models/documents';
import { ClaimSettlementLedgerSettings } from '@app/models/ledger-settings/claim-settlement-ledger-settings';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { OutputType } from '@app/models/enums/document-generation/output-type';
import { OutputFileType } from '@app/models/enums/document-generation/output-file-type';
import { LogService } from '@app/services/log-service';
import { Observable, Subject } from 'rxjs';
import { IGridLocalData } from '@app/state/root.state';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { ClaimSettlementLedgerStages } from '@app/models/enums/claim-settlement-ledger-stages.enum';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ClaimSettlementLedger } from '@app/models/closing-statement/claim-settlement-ledger';
import { GenerateDisbursementWorksheetStage } from '@app/models/enums/generate-disbursement-worksheet-stage.enum';
import { DeficiencySummaryOption } from '@app/models/documents/document-generators/deficiency-summary-option';
import * as docActions from '@app/modules/shared/state/upload-bulk-document/actions';
import * as actions from './state/actions';
import * as selectors from './state/selectors';
import * as projectSelectors from '../state/selectors';
import * as projectActions from '../state/actions';
import * as claimantSummarySelectors from '../project-disbursement-claimant-summary/state/selectors';
import { ProjectsCommonState } from '../state/reducer';
import { FilterModel } from '@app/models/advanced-search/filter-model';

@Component({
  selector: 'app-disbursement-worksheet-modal',
  templateUrl: './disbursement-worksheet-modal.component.html',
  styleUrls: ['./disbursement-worksheet-modal.component.scss'],
})
export class DisbursementWorksheetModalComponent implements OnDestroy {
  public projectId: number;
  public isErrorShown: boolean = false;
  public readonly templates$ = this.store.select(projectSelectors.disbursementsTemplates);
  public readonly claimantsWithLedgers$ = this.store.select(projectSelectors.claimantsWithLedgersList);
  public outputType: OutputType;
  public readonly outputTypes = OutputType;
  public readonly canPublish$ = this.store.select(projectSelectors.canPublish);
  public canPublish: boolean;
  public worksheetGeneratedSuccessfully = new EventEmitter();

  public stage = GenerateDisbursementWorksheetStage.SelectTemplate;

  readonly stages = GenerateDisbursementWorksheetStage;

  public readonly awaitedActionTypes = [
    projectActions.DownloadGeneratedDocumentSuccess,
    projectActions.Error,
  ];

  public readonly validationResultsButtonAwaitedActions = [
    docActions.DownloadDocumentComplete.type,
    docActions.DownloadDocumentError.type,
  ];

  private ngUnsubscribe$ = new Subject<void>();
  private clientSummaryGridParams: IServerSideGetRowsParamsExtended;
  private clientSummaryGridLocalData: IGridLocalData;
  private pusherChannel: Channel;
  private docGenerator: SaveDocumentGeneratorRequest;
  private ledgerSettings: ClaimSettlementLedgerSettings;
  private claimantsWithLedgers: ClaimSettlementLedger[];
  public validationDocId: number;
  public readonly form = new UntypedFormGroup({ templateId: new UntypedFormControl(null, Validators.required), outputType: new UntypedFormControl(OutputType.Publish, Validators.required) });

  get loaded(): boolean {
    return !!this.ledgerSettings && !!this.claimantsWithLedgers;
  }

  readonly criticalDwDeficiencies$: Observable<DeficiencySummaryOption[]> = this.store.select(selectors.criticalDwDeficiencies);

  get valid(): boolean {
    if (!this.loaded) {
      return true;
    }
    switch (this.stage) {
      case GenerateDisbursementWorksheetStage.SelectTemplate:
        if (CommonHelper.isNullOrUndefined(this.form.get('templateId').value) || CommonHelper.isNullOrUndefined(this.form.get('outputType'))) {
          return false;
        }
        break;
    }

    return true;
  }

  constructor(
    public readonly modal: BsModalRef,
    private readonly store: Store<ProjectsCommonState>,
    private readonly actionsSubj: ActionsSubject,
    private readonly pusher: PusherService,
    private readonly enumToArray: EnumToArrayPipe,
    private readonly logger: LogService,
  ) {
  }

  public ngOnInit(): void {
    this.store.select(projectSelectors.ledgerSettings)
      .pipe(
        filter((settings: ClaimSettlementLedgerSettings) => settings !== null),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((settings: ClaimSettlementLedgerSettings) => {
        this.ledgerSettings = settings;
        this.form.get('templateId').patchValue(this.ledgerSettings.exportDetailedDisbursementWorksheetTemplateId);
      });

    this.store.dispatch(projectActions.GetLedgerSettings({ projectId: this.projectId }));
    this.store.dispatch(projectActions.GetDisbursementsTemplates({ templateId: FileImportTemplateTypes.NewDetailedDisbursementWorksheet }));
    this.subscribeToClientSummaryGridParams();
    this.subscribeToClientSummaryGridLocalData();
    this.subscribeToCanPublish();
    this.subscribeToEnqueueSuccess();
    this.claimantsWithLedgers$
      .pipe(
        filter((list: ClaimSettlementLedger[]) => list !== null),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((list: ClaimSettlementLedger[]) => {
        this.claimantsWithLedgers = list;
      });

    this.form.get('outputType').valueChanges
      .subscribe((o: OutputType) => {
        this.outputType = o;
      });
  }

  public onValidate(): void {
    this.isErrorShown = false;

    this.unsubscribePusherChannel();

    const channelName = StringHelper.generateChannelName(JobNameEnum.GenerateFeeExpenseWorksheet, this.projectId, EntityTypeEnum.Projects);

    this.pusherChannel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(DocumentGeneratorsLoading).map((i: {
        id: number;
        name: string;
      }) => i.name),
      this.channelEventHandlerValidation.bind(this),
      this.enqueueFeeExpenseDocValidation.bind(this, channelName),
    );
  }

  public onGenerate(): void {
    this.isErrorShown = false;

    this.unsubscribePusherChannel();

    const channelName = this.docGenerator.channelName;

    this.pusherChannel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(DocumentGeneratorsLoading).map((i: {
        id: number;
        name: string;
      }) => i.name),
      this.channelEventHandler.bind(this),
      this.enqueueFeeExpenseDocGenerator.bind(this, channelName),
    );
  }

  private enqueueFeeExpenseDocGenerator(channelName: string): void {
    this.store.dispatch(actions.EnqueueDWGeneration({ generatorId: this.docGenerator.id, channelName }));
  }

  private enqueueFeeExpenseDocValidation(channelName: string): void {
    const searchOptions = SearchOptionsHelper.createSearchOptions(this.clientSummaryGridLocalData, this.clientSummaryGridParams);
    searchOptions.startRow = 0;
    searchOptions.endRow = -1;
    searchOptions.filterModel = [
      ...searchOptions.filterModel,
      new FilterModel({ filter: 0, filterType: FilterTypes.Number, type: 'greaterThan', key: 'claimSettlementLedgerId' }),
      new FilterModel({ filter: true, filterType: FilterTypes.Boolean, type: 'equals', key: 'disbursementGroupActive' }),
    ];

    const outputType = this.form.get('outputType').value;
    if (outputType === 2) {
      searchOptions.filterModel.push(new FilterModel({ filter: ClaimSettlementLedgerStages.CSPublished, filterType: FilterTypes.Number, type: 'notEqual', key: 'stage.id' }));
    }

    const generationRequest = SaveDocumentGeneratorRequest.toDocumentGeneratorRequestDto(
      this.projectId,
      EntityTypeEnum.Projects,
      [{ entityId: this.projectId, entityTypeId: EntityTypeEnum.Projects, searchOptions }],
      [this.form.get('templateId').value],
      null,
      null,
      outputType,
      channelName,
    );
    generationRequest.outputFileNamingConvention = '{name}_{timestamp}';
    generationRequest.outputFileType = OutputFileType.Xlsx;
    generationRequest.outputType = this.form.get('outputType').value;

    this.store.dispatch(actions.ValidateDocumentGeneration({ generationRequest }));
  }

  private subscribeToCanPublish(): void {
    this.actionsSubj.pipe(
      ofType(projectActions.CanPublishDWGenerationSuccess),
      filter((data: {
        canPublish: boolean;
      }) => !!data),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((data: {
      canPublish: boolean;
    }) => {
      this.canPublish = data.canPublish;
      this.form.get('outputType').setValue(this.canPublish ? 2 : 1);
    });

    const searchOptions = SearchOptionsHelper.createSearchOptions(this.clientSummaryGridLocalData, this.clientSummaryGridParams);
    searchOptions.startRow = 0;
    searchOptions.endRow = -1;
    searchOptions.filterModel = [
      ...searchOptions.filterModel,
    ];
    this.store.dispatch(projectActions.CanPublishDWGeneration({ caseId: this.projectId, request: searchOptions }));
  }

  private subscribeToClientSummaryGridParams(): void {
    this.store.select(claimantSummarySelectors.gridParams)
      .pipe(first())
      .subscribe((params: IServerSideGetRowsParamsExtended) => {
        this.clientSummaryGridParams = params;
      });
  }

  private subscribeToClientSummaryGridLocalData(): void {
    this.store.select(rootSelectors.gridLocalDataByGridId({ gridId: GridId.ClaimantSummaryList }))
      .pipe(first())
      .subscribe((data: IGridLocalData) => {
        this.clientSummaryGridLocalData = data;
      });
  }

  private subscribeToEnqueueSuccess(): void {
    this.actionsSubj.pipe(
      ofType(projectActions.EnqueueDocumentGenerationSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((action: {
      generationRequest: SaveDocumentGeneratorRequest;
    }) => {
      this.docGenerator = action.generationRequest;
    });

    this.actionsSubj.pipe(
      ofType(actions.ValidateDocumentGenerationSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((action: {
      generationRequest: SaveDocumentGeneratorRequest;
    }) => {
      this.docGenerator = action.generationRequest;
    });
  }

  private channelEventHandler(data: any, event: string): void {
    switch (DocumentGeneratorsLoading[event]) {
      case DocumentGeneratorsLoading.Complete:
        this.store.dispatch(projectActions.DownloadGeneratedDocument({ generatorId: this.docGenerator.id }));
        this.worksheetGeneratedSuccessfully.emit();
        break;
      case DocumentGeneratorsLoading.Error:
        this.logger.log('[DisbursementWorksheetModalComponent channelEventHandler]', data);
        this.isErrorShown = true;
        break;
      default:
        break;
    }
  }

  private channelEventHandlerValidation(data: any, event: string): void {
    switch (DocumentGeneratorsLoading[event]) {
      case DocumentGeneratorsLoading.Validating:
        break;
      case DocumentGeneratorsLoading.Pending:
        this.store.dispatch(actions.GetDocumentGenerationDeficienciesSummary({ documentGenerationId: this.docGenerator.id }));
        this.validationDocId = data.validationDocId;
        this.stage = GenerateDisbursementWorksheetStage.DeficiencySummary;
        break;
      case DocumentGeneratorsLoading.Error:
        this.logger.log('[DisbursementWorksheetModalComponent channelEventHandler]', data);
        this.isErrorShown = true;
        break;
      default:
        break;
    }
  }

  private unsubscribePusherChannel(): void {
    if (this.pusherChannel) {
      this.pusher.unsubscribeChannel(this.pusherChannel);
    }
  }

  public onValidationResultsClick(): void {
    this.store.dispatch(docActions.DownloadDocument({ id: this.validationDocId }));
  }

  public ngOnDestroy(): void {
    this.unsubscribePusherChannel();
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
