import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { GridApi } from 'ag-grid-community';
import { Subject, takeUntil } from 'rxjs';
import { ActionsSubject } from '@ngrx/store';
import { BatchActionDocumentType } from '@app/models/enums/batch-action/batch-action-document-type.enum';
import { Router } from '@angular/router';
import { FileImportReviewTabs } from '@app/models/enums';
import { FileImportTab } from '@app/models/file-imports';
import { BatchAction } from '@app/models/batch-action/batch-action';
import { CopySpecialPaymentInstructionData } from '@app/models/payment-queue/copy-special-payment-instruction-data';
import * as globalPaymentQueueActions from '../../state/actions';
import { ofType } from '@ngrx/effects';

@Component({
  selector: 'app-copy-special-payment-instructions-results',
  templateUrl: './copy-special-payment-instructions-results.component.html',
})
export class CopySpecialPaymentInstructionsResultsComponent implements OnDestroy, OnInit {
  @Input() public tabsGroup: FileImportTab[];
  @Input() public batchAction: BatchAction;
  @Input() public ledgerEntryId: number;
  @Input() public projectId: number;
  public paymentInstructions: CopySpecialPaymentInstructionData[];

  public activeTab = FileImportReviewTabs.AllRecords;
  public documentTypeId = BatchActionDocumentType.LoadingResults;

  protected gridApi: GridApi;

  protected ngUnsubscribe$ = new Subject<void>();


  public enabledAutoHeight: boolean = false;
  public skipSetContentHeight: boolean = true;
  public isContentAutoHeight: boolean = true;

  isActiveTab(item: FileImportTab) {
    return item.tab === this.activeTab;
  }

   public ngOnInit(): void {
    this.actionsSubj.pipe(
      ofType(globalPaymentQueueActions.GetCopySpecialPaymentInstructionsSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(action => {
      this.paymentInstructions = action.paymentInstructions;
    });
  }

  public onChangeTab(tab: FileImportReviewTabs) {
    this.activeTab = tab;
  }

  constructor(
    protected router: Router,
    protected elementRef: ElementRef,
    private actionsSubj: ActionsSubject,
  ) {
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
