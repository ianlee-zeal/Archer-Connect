import { Component, Input, OnInit } from '@angular/core';
import { CurrencyHelper } from '@app/helpers/currency.helper';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DocumentImport } from '@app/models/documents';
import { EntityTypeEnum, FileImportDocumentType, FileImportReviewTabs } from '@app/models/enums';
import { FileImportTab } from '@app/models/file-imports';
import { Subject, takeUntil } from 'rxjs';
import { ActionsSubject, Store } from '@ngrx/store';
import { ofType } from '@ngrx/effects';
import * as fromShared from '../../../../../shared/state';
import { CreateNewNoteSilently } from '@app/modules/shared/state/notes-list/actions';

@Component({
  selector: 'app-review-payments-details-step',
  templateUrl: './review-payments-details-step.component.html',
  styleUrl: './review-payments-details-step.component.scss'
})
export class ReviewPaymentsDetailsStepComponent  implements OnInit {
  @Input() public documentImport: DocumentImport;
  @Input() public documentTypeId: FileImportDocumentType;
  @Input() public tabsGroup: FileImportTab[];
  @Input() public projectId: number;
  @Input() projectName: string;
  @Input() qsfName: string;
  @Input() previewTotalPayment: number;
  @Input() noteText: string | null;

  public readonly types = FileImportDocumentType;
  public resultTab: boolean;

  public form = new UntypedFormGroup({ note: new UntypedFormControl(null, Validators.required) });
  public activeTab = FileImportReviewTabs.AllRecords;

  protected readonly ngUnsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    protected readonly store: Store<fromShared.AppState>,
    private readonly actionsSubj: ActionsSubject,
  ) {
  }

  public navItemclass(item: FileImportTab) {
    return {
      'error-active': this.isErrorTabActive(item),
      'deleted-active': this.isDeletedTab(item),
      active: this.isActiveTab(item),
    };
  }

  ngOnInit(): void {
    this.resultTab = this.documentTypeId === FileImportDocumentType.LoadingResults;
    if (this.resultTab) {
      this.actionsSubj.pipe(
        takeUntil(this.ngUnsubscribe$),
        ofType(
          fromShared.sharedActions.uploadBulkDocumentActions.GetDocumentImportsResultSuccess
        ),
      ).subscribe(result => {
        if (result.validationResults.rows.length > 0) {
          const paymentRequestId = result.validationResults.rows[0].fields.PaymentRequestId;
          this.store.dispatch(CreateNewNoteSilently({
            note: {
              entityId: this.projectId,
              entityTypeId: EntityTypeEnum.ProjectDisbursementNotes,
              note: this.noteText,
              id: 0,
              isInternal: false,
              relatedEntityId: paymentRequestId,
              relatedEntityTypeId: EntityTypeEnum.ManualPaymentRequest,
            }
          }));
        }
      });
    }
  }

  isActiveTab(item: FileImportTab) {
    return item.tab === this.activeTab && this.documentImport?.id;
  }

  isDeletedTab(item: FileImportTab) {
    return this.documentImport?.id && item.tab === FileImportReviewTabs.Deleted && item.count > 0;
  }

  isErrorTabActive(item: FileImportTab) {
    return this.documentImport?.id && item.tab === FileImportReviewTabs.Errors && item.count > 0;
  }

  onChangeTab(tab: FileImportReviewTabs) {
    this.activeTab = tab;
  }

  get totalPaymentString(): string {
    return CurrencyHelper.toUsdFormat({ value: this.previewTotalPayment }, true);
  }

  isValid(): boolean {
    let valid = this.form?.valid;
    return valid;
  }

  showNotes() {
    return !this.resultTab
      && this.activeTab != FileImportReviewTabs.Errors
      && this.activeTab != FileImportReviewTabs.Warnings;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
