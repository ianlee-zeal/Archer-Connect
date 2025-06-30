import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { GridApi } from 'ag-grid-community';
import { FileImportReviewTabs } from '@app/models/enums';
import { FileImportTab } from '@app/models/file-imports';
import { BatchAction } from '@app/models/batch-action/batch-action';
import { BatchActionDocumentType } from '@app/models/enums/batch-action/batch-action-document-type.enum';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-refund-transfer-request-result-step',
  templateUrl: './refund-transfer-request-result-step.component.html',
  styleUrls: ['./refund-transfer-request-result-step.component.scss'],
})
export class RefundTransferRequestResultStepComponent implements OnInit, OnDestroy {
  @Input() public tabsGroup: FileImportTab[];
  @Input() public batchAction: BatchAction;
  @Input() public resultFileDocId: number;
  @Input() public refundInfo;

  public activeTab = FileImportReviewTabs.AllRecords;
  public documentTypeId = BatchActionDocumentType.LoadingResults;

  protected gridApi: GridApi;

  protected ngUnsubscribe$ = new Subject<void>();

  constructor(
  ) {
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
