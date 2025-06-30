import { Component, OnDestroy } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

import { filter, first, takeUntil, withLatestFrom } from 'rxjs/operators';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import cloneDeep from 'lodash-es/cloneDeep';
import { ofType } from '@ngrx/effects';
import { PusherService } from '@app/services/pusher.service';
import { Channel } from 'pusher-js';
import { DocumentGeneratorsLoading, EntityTypeEnum, JobNameEnum } from '@app/models/enums';
import { SaveDocumentGeneratorRequest } from '@app/models/documents';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { OutputType } from '@app/models/enums/document-generation/output-type';
import { OutputFileType } from '@app/models/enums/document-generation/output-file-type';
import { LogService } from '@app/services/log-service';
import { ISearchOptions } from '@app/models/search-options';
import { Subject } from 'rxjs';
import { FilterModel } from '@app/models/advanced-search/filter-model';
import { ClaimSettlementLedgerSettings } from '@app/models/ledger-settings';
import { CommonHelper, StringHelper } from '@app/helpers';
import { IdValue } from '@app/models';
import { ClaimSettlementLedger } from '../../../models/closing-statement/claim-settlement-ledger';
import { ModalService } from '../../../services/modal.service';
import * as projectActions from '../state/actions';
import * as projectSelectors from '../state/selectors';
import * as claimantSummarySelectors from '../project-disbursement-claimant-summary/state/selectors';
import { ProjectsCommonState } from '../state/reducer';
import { DocumentTemplatesService } from '@app/services/api/documents/document-templates.service';

@Component({
  selector: 'app-closing-statement-modal',
  templateUrl: './closing-statement-modal.component.html',
  styleUrls: ['./closing-statement-modal.component.scss'],
})
export class ClosingStatementModalComponent implements OnDestroy {
  public projectId: number;
  public clientSummaryGridSearchOpt: ISearchOptions;
  public isErrorShown: boolean = false;
  public errorMessage: string;
  public customError: string;
  private isValidStageIdFilter = true;
  public outputTypes: IdValue[] = [
    { id: OutputType.Publish, name: 'Publish' },
    { id: OutputType.Draft, name: 'Draft' },
  ];
  public canPublish = true;

  public readonly awaitedActionTypes = [
    projectActions.DownloadClosingStatementSuccess,
    projectActions.DownloadClosingStatementError,
    projectActions.Error,
  ];

  private ngUnsubscribe$ = new Subject<void>();
  private defaultFilterModel: FilterModel[];
  private pusherChannel: Channel;
  private ledgerSettings: ClaimSettlementLedgerSettings;
  private claimantsWithLedgers: ClaimSettlementLedger[];

  readonly templates$ = this.store.select(projectSelectors.closingStatementTemplates);
  readonly claimantsWithLedgers$ = this.store.select(projectSelectors.claimantsWithLedgersList);

  readonly form = new UntypedFormGroup(
    {
      templateId: new UntypedFormControl(null, Validators.required),
      useSettingsTemplate: new UntypedFormControl(true),
      watermark: new UntypedFormControl(null, Validators.maxLength(100)),
      outputType: new UntypedFormControl(OutputType.Publish, Validators.required),
    },
  );

  constructor(
    public readonly modalService: ModalService,
    private readonly store: Store<ProjectsCommonState>,
    private readonly actionsSubj: ActionsSubject,
    private readonly pusher: PusherService,
    private readonly enumToArray: EnumToArrayPipe,
    private readonly logger: LogService,
    private readonly documentTemplatesService: DocumentTemplatesService,
  ) {
  }

  get showWatermarkInput(): boolean {
    return this.form.get('outputType').value == OutputType.Draft;
  }

  get loaded(): boolean {
    return !!this.ledgerSettings && !!this.claimantsWithLedgers;
  }

  get valid(): boolean {
    if (!this.loaded) {
      return true;
    }

    if (!this.isValidStageIdFilter && this.form.get('outputType').value != OutputType.Draft) {
      this.errorMessage = 'One or more claimant records are not in CS Ready ledger stage';
      return false;
    }
    if (CommonHelper.isNullOrUndefined(this.form.get('templateId').value)) {
      this.errorMessage = 'Closing statement template must be selected.';
      return false;
    }
    if (!this.claimantsWithLedgers.length) {
      this.errorMessage = 'Closing statements were not found.';
      return false;
    }
    this.errorMessage = '';
    return true;
  }

  public ngOnInit(): void {
    this.store.select(projectSelectors.ledgerSettings)
      .pipe(
        filter(settings => !!settings),
        withLatestFrom(this.templates$),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(([settings, templates]) => {
        this.ledgerSettings = settings;
        if (!CommonHelper.isNullOrUndefined(this.ledgerSettings.closingStatementTemplateId)
           && templates?.some(template => template.id === this.ledgerSettings.closingStatementTemplateId)) {
          this.form.patchValue({ templateId: this.ledgerSettings.closingStatementTemplateId });
        }
      });

    this.store.dispatch(projectActions.GetLedgerSettings({ projectId: this.projectId }));
    this.store.dispatch(projectActions.GetClosingStatementTemplates({ projectId: this.projectId, isProjectAssociated: true }));

    this.claimantsWithLedgers$
      .pipe(
        filter(list => list !== null),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(list => {
        this.claimantsWithLedgers = list;
      });

    this.subscribeToClientSummaryGridParams();
    this.subscribeToLedgersListSuccess();

    this.actionsSubj
      .pipe(
        ofType(projectActions.DownloadClosingStatementSuccess),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(() => {
        this.modalService.hide();
      });
  }

  private subscribeToLedgersListSuccess() {
    this.actionsSubj.pipe(
      ofType(projectActions.GetClaimantsWithLedgersListSuccess),
      filter(data => !!data),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(data => {
      this.isValidStageIdFilter = !data.result.hasInvalidStagesForClosingStatementGeneration;
    });
  }

  public onGenerate(): void {
    this.isErrorShown = false;
    this.customError = '';

    const searchOptions: ISearchOptions = {
      ...AGGridHelper.getDefaultSearchRequest(),
      ...this.clientSummaryGridSearchOpt,
      filterModel: this.defaultFilterModel,
      endRow: -1,
    };

    const outputType = this.form.get('outputType').value;
    const channelName = StringHelper.generateChannelName(JobNameEnum.GenerateClosingStatementRequest, this.projectId, EntityTypeEnum.Projects);
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
    generationRequest.outputFileType = OutputFileType.Pdf;
    generationRequest.outputType = outputType;
    generationRequest.useIndividualTemplates = this.form.get('useSettingsTemplate').value;
    generationRequest.watermark = this.form.get('watermark').value;

    this.unsubscribePusherChannel();
    this.pusherChannel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(DocumentGeneratorsLoading).map(i => i.name),
      this.channelEventHandler.bind(this),
      () => this.store.dispatch(projectActions.EnqueueClosingStatementGeneration({ generationRequest })),
    );
  }

  private subscribeToClientSummaryGridParams(): void {
    this.store.select(claimantSummarySelectors.gridParams)
      .pipe(first())
      .subscribe(params => {
        this.defaultFilterModel = cloneDeep(params.request.filterModel);

        this.defaultFilterModel.push({
          filter: this.projectId,
          filterType: 'number',
          type: 'equals',
          key: 'caseId',
          filterTo: null,
          dateFrom: null,
          dateTo: null,
        });
      });
  }

  private channelEventHandler(data: { id: number, message: string }, event: string): void {
    switch (DocumentGeneratorsLoading[event]) {
      case DocumentGeneratorsLoading.Complete:
        this.store.dispatch(projectActions.DownloadClosingStatement({ generatorId: data.id }));
        break;
      case DocumentGeneratorsLoading.Error:
        this.logger.log('[ClosingStatementModalComponent channelEventHandler]', data);
        this.isErrorShown = true;
        this.customError = data.message;
        this.store.dispatch(projectActions.DownloadClosingStatementError());
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

  public ngOnDestroy(): void {
    this.unsubscribePusherChannel();
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
