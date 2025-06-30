import { Component, OnDestroy, OnInit } from '@angular/core';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';

import { AuditorState } from '@app/modules/auditor/state/reducer';

import { FileImportReviewTabs } from '@app/models/enums';
import { AuditRun } from '@app/models/auditor/audit-run';
import { FileImportTab } from '@app/models/file-imports';
import { auditBatchModalSelectors } from '../../state/selectors';

@Component({
  selector: 'app-audit-batch-review',
  templateUrl: './audit-batch-review.component.html',
  styleUrls: ['./audit-batch-review.component.scss'],
})
export class AuditBatchReviewStepComponent implements OnInit, OnDestroy {
  public tabsGroup: FileImportTab[];

  public activeTab = FileImportReviewTabs.AllRecords;

  protected readonly ngUnsubscribe$: Subject<void> = new Subject<void>();

  public auditRun$ = this.store.select(auditBatchModalSelectors.auditRun);
  public auditRun: AuditRun;

  constructor(
    private readonly store: Store<AuditorState>,
  ) {}

  ngOnInit() {
    this.initValues();
  }

  private initValues(): void {
    this.auditRun$.pipe(
      filter(auditRun => !auditRun || !!auditRun?.counts),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(auditRun => {
      if (!this.auditRun && !!auditRun) {
        this.generateReviewTabsGroup(auditRun);
      }
      this.auditRun = auditRun;
    });
  }

  private generateReviewTabsGroup(auditRun: AuditRun): void {
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
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
