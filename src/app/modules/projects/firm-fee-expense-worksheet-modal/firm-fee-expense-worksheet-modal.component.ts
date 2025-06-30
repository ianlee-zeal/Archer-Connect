import { Component } from '@angular/core';
import { SearchOptionsHelper, StringHelper } from '@app/helpers';
import { DocumentGeneratorsLoading, EntityTypeEnum, FileImportTemplateTypes, JobNameEnum } from '@app/models/enums';
import { SaveDocumentGeneratorRequest } from '@app/models/documents';
import { OutputType } from '@app/models/enums/document-generation/output-type';
import { OutputFileType } from '@app/models/enums/document-generation/output-file-type';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ActionsSubject, Store } from '@ngrx/store';
import { PusherService } from '@app/services/pusher.service';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { LogService } from '@app/services/log-service';
import { Subject } from 'rxjs';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { IGridLocalData } from '@app/state/root.state';
import { Channel } from 'pusher-js';
import { ClaimSettlementLedger } from '@app/models/closing-statement/claim-settlement-ledger';
import { filter, first, takeUntil } from 'rxjs/operators';
import * as rootSelectors from '@app/state/index';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ofType } from '@ngrx/effects';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ClaimSettlementLedgerSettings } from '@app/models/ledger-settings';
import * as projectSelectors from '../state/selectors';
import * as projectActions from '../state/actions';
import { ProjectsCommonState } from '../state/reducer';
import * as claimantSummarySelectors from '../project-disbursement-claimant-summary/state/selectors';

@Component({
  selector: 'firm-fee-expense-worksheet-modal',
  templateUrl: './firm-fee-expense-worksheet-modal.component.html',
})
export class FirmFeeExpenseWorksheetModalComponent {
  private readonly defaultError = 'Something went wrong, please try again later';
  private readonly invalidStageError = 'One or more claimants are not in DW Ready to Generate or earlier stage';

  public projectId: number;
  public displayedError: string = null;
  public isDataLoaded = false;
  public readonly claimantsWithLedgers$ = this.store.select(projectSelectors.claimantsWithLedgersList);
  public readonly templates$ = this.store.select(projectSelectors.disbursementsTemplates);

  public readonly form = new UntypedFormGroup({
    templateId: new UntypedFormControl(null, Validators.required),
  });

  public readonly awaitedActionTypes = [
    projectActions.DownloadGeneratedDocumentSuccess,
    projectActions.Error,
  ];

  private ngUnsubscribe$ = new Subject<void>();
  protected clientSummaryGridParams: IServerSideGetRowsParamsExtended;
  protected clientSummaryGridLocalData: IGridLocalData;
  protected pusherChannel: Channel;
  private docGenerator: SaveDocumentGeneratorRequest;
  private claimantsWithLedgers: ClaimSettlementLedger[];

  constructor(
    public readonly modal: BsModalRef,
    public readonly store: Store<ProjectsCommonState>,
    public readonly actionsSubj: ActionsSubject,
    public readonly pusher: PusherService,
    protected readonly enumToArray: EnumToArrayPipe,
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
        this.form.get('templateId').patchValue(settings.exportFirmFeeAndExpenseTemplateId);
      });
    this.subscribeToClientSummaryGridParams();
    this.subscribeToClientSummaryGridLocalData();
    this.subscribeToEnqueueSuccess();
    this.subscribeToClaimantsWithLedgers();
    this.subscribeToLedgersListSuccess();
    this.store.dispatch(projectActions.GetDisbursementsTemplates({ templateId: FileImportTemplateTypes.FirmFeeAndExpense }));
    this.store.dispatch(projectActions.GetLedgerSettings({ projectId: this.projectId }));
  }

  public get isLoaded(): boolean {
    return !!this.claimantsWithLedgers && !!this.claimantsWithLedgers.length;
  }

  public get isValid(): boolean {
    return this.displayedError !== this.invalidStageError && this.form.valid;
  }

  public onGenerate(): void {
    this.displayedError = null;

    this.unsubscribePusherChannel();

    const channelName = StringHelper.generateChannelName(JobNameEnum.FirmFeeExpenseWorksheet, this.projectId, EntityTypeEnum.Projects);

    this.pusherChannel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(DocumentGeneratorsLoading).map(i => i.name),
      this.channelEventHandler.bind(this),
      this.enqueueFeeExpenseDocGenerator.bind(this, channelName),
    );
  }

  private enqueueFeeExpenseDocGenerator(channelName: string): void {
    const searchOptions = SearchOptionsHelper.createSearchOptions(this.clientSummaryGridLocalData, this.clientSummaryGridParams);
    searchOptions.startRow = 0;
    searchOptions.endRow = -1;
    searchOptions.filterModel = [
      ...searchOptions.filterModel,
    ];

    const generationRequest = SaveDocumentGeneratorRequest.toDocumentGeneratorRequestDto(
      this.projectId,
      EntityTypeEnum.Projects,
      [{ entityId: this.projectId, entityTypeId: EntityTypeEnum.Projects, searchOptions }],
      [this.form.get('templateId').value],
      null,
      null,
      null,
      channelName,
    );
    generationRequest.outputFileNamingConvention = '{name}_{timestamp}';
    generationRequest.outputFileType = OutputFileType.Xlsx;
    generationRequest.outputType = OutputType.Publish;

    this.store.dispatch(projectActions.EnqueueDocumentGeneration({ generationRequest }));
  }

  private channelEventHandler(data: any, event: string): void {
    switch (DocumentGeneratorsLoading[event]) {
      case DocumentGeneratorsLoading.Complete:
        this.store.dispatch(projectActions.DownloadGeneratedDocument({ generatorId: this.docGenerator.id }));
        break;
      case DocumentGeneratorsLoading.Error:
        this.logger.log('[FirmFeeExpenseWorksheetModalComponent channelEventHandler]', data);
        this.displayedError = this.defaultError;
        break;
      default:
        break;
    }
  }

  private subscribeToClientSummaryGridParams(): void {
    this.store.select(claimantSummarySelectors.gridParams)
      .pipe(first())
      .subscribe(params => {
        this.clientSummaryGridParams = params;
      });
  }

  private subscribeToClientSummaryGridLocalData(): void {
    this.store.select(rootSelectors.gridLocalDataByGridId({ gridId: GridId.ClaimantSummaryList }))
      .pipe(first())
      .subscribe(data => {
        this.clientSummaryGridLocalData = data;
      });
  }

  private subscribeToEnqueueSuccess(): void {
    this.actionsSubj.pipe(
      ofType(projectActions.EnqueueDocumentGenerationSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(action => {
      this.docGenerator = action.generationRequest;
    });
  }

  private subscribeToClaimantsWithLedgers(): void {
    this.claimantsWithLedgers$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(list => {
        this.claimantsWithLedgers = list;
      });
  }

  private subscribeToLedgersListSuccess(): void {
    this.actionsSubj.pipe(
      ofType(projectActions.GetClaimantsWithLedgersListSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(data => {
      if (data.result.hasInvalidStagesForFirmFeeAndExpenseGeneration) {
        this.displayedError = this.invalidStageError;
      }
    });
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
