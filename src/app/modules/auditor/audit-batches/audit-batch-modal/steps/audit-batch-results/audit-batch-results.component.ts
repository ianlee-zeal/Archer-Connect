import { Component, OnDestroy, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';

import { AuditorState } from '@app/modules/auditor/state/reducer';
import { Document, DocumentImport } from '@app/models/documents';

import { Channel } from 'pusher-js';
import { PusherService } from '@app/services/pusher.service';

import { AuditorPusherMessage } from '@app/models/auditor/auditor-pusher-message';

import { DocumentImportLoading, EntityTypeEnum, FileImportReviewTabs, JobNameEnum } from '@app/models/enums';

import { StringHelper } from '@app/helpers/string.helper';
import { RunAuditorCommand } from '@app/models/auditor/run-auditor-command';
import { AuditBatchUploading } from '@app/models/enums/audit-batch-uploading.enum';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { PreviewStatus } from '@app/models/auditor/preview-status.enum';
import { AuditRun } from '@app/models/auditor/audit-run';
import { FileImportTab } from '@app/models/file-imports';
import * as fromShared from '@shared/state';
import { auditBatchModalSelectors } from '../../state/selectors';
import * as auditBatchModalActions from '../../state/actions';

const { sharedActions } = fromShared;

const defaultError: string = 'Something went wrong, try again';

@Component({
  selector: 'app-audit-batch-results',
  templateUrl: './audit-batch-results.component.html',
  styleUrls: ['./audit-batch-results.component.scss'],
})
export class AuditBatchResultsStepComponent implements OnInit, OnDestroy {
  private channel: Channel;
  // eslint-disable-next-line no-restricted-globals
  readonly pusherEvents = Object.keys(DocumentImportLoading).filter(key => !isNaN(Number(DocumentImportLoading[key.toString()])));

  public tabsGroup: FileImportTab[];

  public activeTab = FileImportReviewTabs.AllRecords;

  protected readonly ngUnsubscribe$: Subject<void> = new Subject<void>();

  public documentImport: DocumentImport;

  public previewStatus$ = this.store.select(auditBatchModalSelectors.previewStatus);
  public previewStatus: PreviewStatus;

  readonly previewStatuses = PreviewStatus;

  public auditRun$ = this.store.select(auditBatchModalSelectors.auditRun);
  public auditRun: AuditRun;

  constructor(
    private readonly store: Store<AuditorState>,
    private pusher: PusherService,
    private readonly enumToArrayPipe: EnumToArrayPipe,
  ) {}

  ngOnInit() {
    this.initValues();
  }

  private initValues(): void {
    this.auditRun$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(auditRun => {
      if (!this.auditRun?.counts && !auditRun.isPreview && !!auditRun?.counts && this.previewStatus !== PreviewStatus.Approve) {
        this.generateResultsTabsGroup(auditRun);
      }
      this.auditRun = auditRun;
    });

    this.previewStatus$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(result => {
      if (this.previewStatus !== result) {
        if (result === PreviewStatus.Approve) {
          this.runAuditorApprove();
        }
      }

      this.previewStatus = result;
    });
  }

  private runAuditorApprove() : void {
    const channelName = StringHelper.generateChannelName(
      JobNameEnum.ApproveAudit,
      this.auditRun.id,
      EntityTypeEnum.AuditBatches,
    );

    const runAuditorCommand: RunAuditorCommand = {
      auditRunId: this.auditRun.id,
      pusherChannelName: channelName,
    };

    this.documentImport = new DocumentImport({ channelName });

    this.subscribeToApprovePusher(channelName, () => {
      this.store.dispatch(auditBatchModalActions.RunAuditor({ runAuditorCommand, approve: true }));
      this.resetProgressBar();
    });
  }

  private unsubscribeFromChannel(): void {
    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
      this.channel = null;
    }
  }

  private displayError(message?: string) {
    this.store.dispatch(auditBatchModalActions.ResetOnErrorState());
    this.store.dispatch(auditBatchModalActions.Error({ error: message ?? defaultError }));
  }

  private resetProgressBar() {
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.ResetProgressValues());
  }

  private subscribeToApprovePusher(channelName: string, onSubscribedCallback: () => void = null) {
    this.unsubscribeFromChannel();

    this.channel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArrayPipe.transformForStringKeys(AuditBatchUploading).map(item => item.id.toString()),
      this.approvePusherCallback.bind(this),
      onSubscribedCallback,
    );
  }

  private approvePusherCallback(data: AuditorPusherMessage, event): void {
    if (data.ProcessedRowsCount && data.TotalRowsCount) {
      const currentPercentage = ((data.ProcessedRowsCount + 1) / data.TotalRowsCount) * 100;

      this.store.dispatch(sharedActions.uploadBulkDocumentActions.SetProgressValues({
        progressValues:
        {
          progressWidth: `${currentPercentage}%`,
          progressValue: <any>currentPercentage,
        },
      }));
    }

    const eventValue = Number(event);

    if (eventValue === AuditBatchUploading.Completed) {
      this.unsubscribeFromChannel();
      this.store.dispatch(auditBatchModalActions.ShowAuditResults({
        auditRun: {
          ...this.auditRun,
          resultDocument: new Document({ id: data.ResultDocId }),
        },
      }));
    }

    if (eventValue === AuditBatchUploading.CompletedWithErrors) {
      this.unsubscribeFromChannel();
      this.displayError(data.ErrorMessage);
    }

    if ([AuditBatchUploading.Completed, AuditBatchUploading.CompletedWithErrors].includes(eventValue)) {
      this.store.dispatch(auditBatchModalActions.RefreshAuditRunGrid());
    }
  }

  private generateResultsTabsGroup(auditRun: AuditRun): void {
    this.tabsGroup = [
      {
        tab: FileImportReviewTabs.AllRecords,
        title: 'All Records',
        count: auditRun.counts.total,
      },
      {
        tab: FileImportReviewTabs.Errors,
        title: 'Errors',
        count: auditRun.counts.errors,
      },
      {
        tab: FileImportReviewTabs.Warnings,
        title: 'Warnings',
        count: auditRun.counts.warnings,
      },
    ];
  }

  isActiveTab(item: FileImportTab) {
    return item.tab === this.activeTab;
  }

  onChangeTab(tab: FileImportReviewTabs) {
    this.activeTab = tab;
  }

  ngOnDestroy() {
    this.unsubscribeFromChannel();

    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
