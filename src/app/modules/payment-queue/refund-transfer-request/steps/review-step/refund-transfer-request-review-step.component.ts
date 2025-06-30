import { Component, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';
import { GridApi } from 'ag-grid-community';
import { FileImportReviewTabs } from '@app/models/enums';
import { ProjectsCommonState } from '@app/modules/projects/state/reducer';
import { ContextBarElement } from '@app/entities';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { PusherService } from '@app/services/pusher.service';
import { FileImportTab } from '@app/models/file-imports';
import { BatchAction } from '@app/models/batch-action/batch-action';
import { BatchActionDocumentType } from '@app/models/enums/batch-action/batch-action-document-type.enum';
import { Subject } from 'rxjs';
import { BatchActionResultStatus } from '@app/models/enums/batch-action/batch-action-result-status.enum';

@Component({
  selector: 'app-refund-transfer-request-review-step',
  templateUrl: './refund-transfer-request-review-step.component.html',
  styleUrls: ['./refund-transfer-request-review-step.component.scss'],
})
export class RefundTransferRequestReviewStepComponent implements OnDestroy {
  @Input() public tabsGroup: FileImportTab[];
  @Input() public batchAction: BatchAction;
  @Input() public previewFileDocId: number;
  @Input() public refundInfo;

  public activeTab = FileImportReviewTabs.AllRecords;
  public documentTypeId = BatchActionDocumentType.PreviewValidation;

  public tabs = FileImportReviewTabs;

  public get enqueuedStatus() {
    return BatchActionResultStatus.Enqueued;
  }

  public get errorStatus() {
    return BatchActionResultStatus.Error;
  }

  public get warnStatus() {
    return BatchActionResultStatus.Warn;
  }

  public get updatedStatus() {
    return BatchActionResultStatus.Updated;
  }

  public get showNoteForm() {
    return this.activeTab != FileImportReviewTabs.Errors && this.activeTab != FileImportReviewTabs.Warnings;
  }

  protected gridApi: GridApi;

  protected ngUnsubscribe$ = new Subject<void>();

  @Output() readonly fail = new EventEmitter<string>();
  @Output() readonly reviewIsCompleted = new EventEmitter();

  public headerElements: ContextBarElement[];
  public form = new UntypedFormGroup({ note: new UntypedFormControl('', Validators.required) });

  get isValid(): boolean {
    return (!this.form || this.form.valid);
  }

  constructor(
    private readonly store: Store<ProjectsCommonState>,
    private readonly pusher: PusherService,
    private actionsSubj: ActionsSubject,
  ) {
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public isActiveTab(item: FileImportTab) {
    return item.tab === this.activeTab;
  }

  public onChangeTab(tab: FileImportReviewTabs) {
    this.activeTab = tab;
  }
}
