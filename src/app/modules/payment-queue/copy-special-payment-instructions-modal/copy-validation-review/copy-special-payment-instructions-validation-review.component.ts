import { Component, ElementRef, Input, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import * as fromShared from '@app/modules/shared/state';
import { GridApi } from 'ag-grid-community';
import { Subject, filter, takeUntil } from 'rxjs';
import { ActionsSubject, Store } from '@ngrx/store';
import { BatchActionDocumentType } from '@app/models/enums/batch-action/batch-action-document-type.enum';
import { Router } from '@angular/router';
import { FileImportReviewTabs } from '@app/models/enums';
import { FileImportTab } from '@app/models/file-imports';
import { BatchAction } from '@app/models/batch-action/batch-action';
import { CopySpecialPaymentInstructionData } from '@app/models/payment-queue/copy-special-payment-instruction-data';
import * as globalPaymentQueueActions from '../../state/actions';
import * as globalPaymentQueueSelectors from '../../state/selectors';

@Component({
  selector: 'app-copy-special-payment-instructions-validation-review',
  templateUrl: './copy-special-payment-instructions-validation-review.component.html',
})
export class CopySpecialPaymentInstructionsValidationReviewComponent implements OnDestroy, OnInit, AfterViewInit {
  @Input() public tabsGroup: FileImportTab[];
  @Input() public batchAction: BatchAction;
  @Input() public ledgerEntryId: number;
  @Input() public projectId: number;
  public paymentInstructions: CopySpecialPaymentInstructionData[];

  public activeTab = FileImportReviewTabs.AllRecords;
  public documentTypeId = BatchActionDocumentType.PreviewValidation;

  protected gridApi: GridApi;

  protected ngUnsubscribe$ = new Subject<void>();
  public readonly specialPaymentInstructions$ = this.store.select(globalPaymentQueueSelectors.specialPaymentInstructions);


  public enabledAutoHeight: boolean = false;
  public skipSetContentHeight: boolean = true;
  public isContentAutoHeight: boolean = true;

  isActiveTab(item: FileImportTab) {
    return item.tab === this.activeTab;
  }

  public ngOnInit(): void {
    this.specialPaymentInstructions$
    .pipe(
      filter(item => !!item),
      takeUntil(this.ngUnsubscribe$),
    )
    .subscribe(items => {
      this.paymentInstructions = items;
    });
  }

  ngAfterViewInit(): void {
    if (!this.paymentInstructions)
      this.store.dispatch(globalPaymentQueueActions.GetCopySpecialPaymentInstructions({ ledgerEntryId: this.ledgerEntryId, caseId: this.projectId }));
  }

  public onChangeTab(tab: FileImportReviewTabs) {
    this.activeTab = tab;
  }

  constructor(
    private store: Store<fromShared.AppState>,
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
