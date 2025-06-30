import { Component, ElementRef, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { StringHelper } from '@app/helpers';
import { BatchAction, BatchActionDto } from '@app/models/batch-action/batch-action';
import { EntityTypeEnum, FileImportReviewTabs, JobNameEnum } from '@app/models/enums';
import { BatchActionDocumentType } from '@app/models/enums/batch-action/batch-action-document-type.enum';
import { BatchActionStatus } from '@app/models/enums/batch-action/batch-action-status.enum';
import { BatchActionTemplate } from '@app/models/enums/batch-action/batch-action-template.enum';
import { FileImportTab, ValidationResults } from '@app/models/file-imports';
import { IARApproval } from '@app/models/payment-queue/ar-approval-request';
import { CopySpecialPaymentInstructionData } from '@app/models/payment-queue/copy-special-payment-instruction-data';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { AppState } from '@app/modules/shared/state';
import { LogService } from '@app/services/log-service';
import { PusherService } from '@app/services/pusher.service';
import { ofType } from '@ngrx/effects';
import { ActionsSubject, Store } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';
import * as exportsActions from '@shared/state/exports/actions';
import { GridApi } from 'ag-grid-community';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Channel } from 'pusher-js';
import { Subject, takeUntil } from 'rxjs';
import * as docActions from '@app/modules/shared/state/upload-bulk-document/actions';
import * as globalPaymentQueueActions from '../state/actions';

@Component({
  selector: 'app-invoice-archer-fees-modal',
  templateUrl: './invoice-archer-fees-modal.component.html',
  styleUrls: ['./invoice-archer-fees-modal.component.scss'],
})
export class InvoiceArcherFeesModalComponent implements OnDestroy {
  @Input() public request: IARApproval;

  public tabsGroup: FileImportTab[];
  public batchAction: BatchAction;
  public batchActionCreated: BatchAction;
  public resultDocId: number;
  public previewDocId: number;
  public paymentInstructions: CopySpecialPaymentInstructionData[];
  private pusherChannel: Channel;
  private deficienciesCount: number = 0;

  public activeTab = FileImportReviewTabs.Queued;
  protected gridApi: GridApi;

  protected ngUnsubscribe$ = new Subject<void>();

  public enabledAutoHeight: boolean = false;
  public skipSetContentHeight: boolean = true;
  public isContentAutoHeight: boolean = true;

  public readonly validationResultsButtonAwaitedActions = [
    docActions.DownloadDocumentComplete.type,
    docActions.DownloadDocumentError.type,
  ];

  constructor(
    public modal: BsModalRef,
    public store: Store<AppState>,
    protected router: Router,
    protected elementRef: ElementRef,
    protected pusher: PusherService,
    protected enumToArray: EnumToArrayPipe,
    private actionsSubj: ActionsSubject,
    private readonly logger: LogService,
  ) {
  }

  isActiveTab(item: FileImportTab): boolean {
    return item.tab === this.activeTab;
  }

  public ngOnInit(): void {
    this.actionsSubj.pipe(
      ofType(globalPaymentQueueActions.InvoiceArcherFeesActionCreationSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((action: { batchAction: BatchAction; } & TypedAction<string>) => {
      this.batchActionCreated = action.batchAction;
    });

    this.actionsSubj.pipe(
      ofType(globalPaymentQueueActions.InvoiceArcherFeesDeficienciesSummarySuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(action => {
      this.deficienciesCount = action.batchActionDeficienciesReview.options.length;
    });

    this.actionsSubj.pipe(
      ofType(globalPaymentQueueActions.GetInvoiceArcherFeesResultRequestSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((action: { validationResults: ValidationResults } & TypedAction<string>) => {
      this.generateResultTabsGroup(action.validationResults);
    });

    this.unsubscribePusherChannel();
    const channelName = StringHelper.generateChannelName(JobNameEnum.InvoiceArcherFees);
    this.pusherChannel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(BatchActionStatus).map((i: { id: number; name: string }) => i.name),
      this.validateInvoiceArcherFeesChannelEventHandler.bind(this),
      this.validateInvoiceArcherFees.bind(this, channelName),
    );
  }

  private validateInvoiceArcherFees(channelName: string): void {
    const batchAction: BatchActionDto = {
      entityTypeId: EntityTypeEnum.GlobalPaymentQueue,
      entityId: 0,
      batchActionFilters: [{ filter: JSON.stringify(this.request) }],
      pusherChannelName: channelName,
      batchActionTemplateId: BatchActionTemplate.InvoiceArcherFees,
    };

    this.store.dispatch(globalPaymentQueueActions.ValidateInvoiceArcherFees({ batchAction }));
  }

  private validateInvoiceArcherFeesChannelEventHandler(data: any, event: string): void {
    switch (BatchActionStatus[event]) {
      case BatchActionStatus.Complete: {
        this.batchAction = this.batchActionCreated;
        this.resultDocId = data.ResultDocId;
        this.previewDocId = data.PreviewDocId;
        this.initiateResultTabs();
        this.store.dispatch(globalPaymentQueueActions.InvoiceArcherFeesDeficienciesSummary({
          batchActionId: this.batchAction.id,
          documentTypeId: BatchActionDocumentType.PreviewValidation,
        }));
        this.store.dispatch(exportsActions.SetActionStatus({ isActionInProgress: false }));
        this.store.dispatch(globalPaymentQueueActions.ValidateInvoiceArcherFeesSuccess({ batchAction: this.batchAction }));
        break;
      }
      case BatchActionStatus.Error:
        this.logger.log('[validateARApprovalChannelEventHandler]', data);
        this.store.dispatch(exportsActions.SetActionStatus({ isActionInProgress: false }));
        this.store.dispatch(globalPaymentQueueActions.ValidateAuthorizeArcherFeesError({ errorMessage: data.ErrorMessage }));
        this.modal.hide();
        break;
      default:
        break;
    }
  }

  private generateResultTabsGroup(validationResults: ValidationResults): void {
    this.batchAction.countErrored = validationResults.errorCount;
    this.batchAction.countWarned = validationResults.warningCount;
    this.batchAction.countLoaded = validationResults.enqueuedCount;

    this.updateTabCounts();
  }

  private initiateResultTabs(): void {
    this.tabsGroup = [
      {
        tab: FileImportReviewTabs.AllRecords,
        title: 'Deficiency Summary',
        count: undefined,
      },
      {
        tab: FileImportReviewTabs.Errors,
        title: 'Errors',
        count: undefined,
      },
      {
        tab: FileImportReviewTabs.Warnings,
        title: 'Warnings',
        count: undefined,
      },
      {
        tab: FileImportReviewTabs.Queued,
        title: 'Queued',
        count: undefined,
      },
    ];
  }

  private updateTabCounts(): void {
    const tabMap = {
      [FileImportReviewTabs.Errors]: this.batchAction.countErrored,
      [FileImportReviewTabs.Warnings]: this.batchAction.countWarned,
      [FileImportReviewTabs.Queued]: this.batchAction.countLoaded,
    };

    this.tabsGroup.forEach((tab: FileImportTab) => {
      if (tab.tab in tabMap) {
        tab.count = tabMap[tab.tab];
      }
      else if (tab.tab == FileImportReviewTabs.AllRecords) {
        tab.count = this.deficienciesCount;
      }
    });
  }

  onSubmit(): void {
    this.store.dispatch(globalPaymentQueueActions.LoadInvoiceArcherFees({ batchActionId: this.batchAction.id }));
    this.modal.hide();
  }

  public onChangeTab(tab: FileImportReviewTabs): void {
    this.activeTab = tab;
  }

  public onValidationResultsClick(): void {
    this.store.dispatch(docActions.DownloadDocument({ id: this.previewDocId }));
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
