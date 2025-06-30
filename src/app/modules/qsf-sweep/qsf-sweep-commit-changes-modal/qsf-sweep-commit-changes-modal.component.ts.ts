import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { IdValue } from '@app/models';
import { DisbursementGroupLight } from '@app/models/disbursement-group-light';
import { PaymentLevelEnum } from '@app/models/enums/payment-level.enum';
import { QSFSweepCommitChangesRequest } from '@app/models/qsf-sweep/qsf-sweep-commit-changes-request';
import * as qsfSweepActions from '@app/modules/qsf-sweep/state/actions';
import * as qsfSweepSelectors from '@app/modules/qsf-sweep/state/selectors';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { ActionsSubject, Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { ofType } from '@ngrx/effects';
import * as fromShared from '../../shared/state';

@Component({
  selector: 'app-qsf-sweep-commit-changes-modal',
  templateUrl: './qsf-sweep-commit-changes-modal.component.html',
  styleUrls: ['./qsf-sweep-commit-changes-modal.component.scss'],
})
export class QsfSweepCommitChangesModalComponent extends ValidationForm implements OnInit, OnDestroy {
  protected ngUnsubscribe$ = new Subject<void>();
  public caseId: number;
  public batchId: number;
  public disableApproveButton: boolean = true;
  public selectedClaimantsIds: number[];
  public isAllClaimantsSelected: boolean = false;
  public isLoading$ = this.store.select(qsfSweepSelectors.isLoading);
  public qsfCommitChangesResponse$ = this.store.select(qsfSweepSelectors.qsfCommitChangesResponse);
  public disbursementGroupOptions$ = this.store.select(fromShared.sharedSelectors.uploadBulkDocumentSelectors.disbursementGroups).pipe(
    filter((data: DisbursementGroupLight[]): boolean => !!data),
    map(
      (data: DisbursementGroupLight[]) => data.map((i: DisbursementGroupLight) => ({ id: i.sequenceId, name: `(${i.sequenceId}) ${i.name}` })).sort((a: any, b: any) => a.id - b.id),
    ),
  );

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  protected get approveButtonDisabled(): boolean {
    const bothCheckboxesUnchecked = !this.form.get('commitLiens')?.value && !this.form.get('commitFees')?.value;
    return !this.form.valid || bothCheckboxesUnchecked || this.disableApproveButton;
  }

  constructor(
    private readonly modal: BsModalRef,
    public readonly store: Store<fromShared.AppState>,
    private actionsSubj: ActionsSubject,
  ) {
    super();
  }

  public form: UntypedFormGroup = new UntypedFormGroup({
    disbursmentGroupId: new UntypedFormControl(null, Validators.required),
    commitLiens: new UntypedFormControl(true),
    commitFees: new UntypedFormControl(true),
  });

  public disbursementGroups: IdValue[] = [
    { id: PaymentLevelEnum.GlobalDefault, name: 'Global Default' },
    { id: PaymentLevelEnum.Project, name: 'Project' },
    { id: PaymentLevelEnum.Claimant, name: 'Claimant' },
  ];

  public ngOnInit(): void {
    this.store.dispatch(fromShared.sharedActions.uploadBulkDocumentActions.LoadDisbursementGroupsData({ entityId: this.caseId, removeProvisionals: true }));
    this.validateBeforeStart();

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(qsfSweepActions.QsfSweepValidateCommitChangesSuccess),
    ).subscribe(action => {
      this.disableApproveButton = !action?.qsfCommitChangesResponse?.success || false;
    });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(qsfSweepActions.QsfSweepCommitChangesSuccess),
    ).subscribe(action => {
      if (action?.qsfCommitChangesResponse?.success) {
        this.onCancel();
      } else {
        this.disableApproveButton = false;
      }
    });
  }

  private validateBeforeStart(): void {
    const request: QSFSweepCommitChangesRequest = new QSFSweepCommitChangesRequest();
    request.claimantIds = this.selectedClaimantsIds;
    request.isAllClaimantsSelected = this.isAllClaimantsSelected;

    this.store.dispatch(qsfSweepActions.QsfSweepValidateCommitChangesRequest({ batchId: this.batchId, request }));
  }

  public onApprove(): void {
    const request: QSFSweepCommitChangesRequest = {
      claimantIds: this.selectedClaimantsIds,
      isAllClaimantsSelected: this.isAllClaimantsSelected,
      disbursementGroupId: this.form.get('disbursmentGroupId')?.value,
      commitLiens: this.form.get('commitLiens')?.value,
      commitFees: this.form.get('commitFees')?.value,
    };
    this.disableApproveButton = true;
    this.store.dispatch(qsfSweepActions.QsfSweepCommitChangesRequest({ batchId: this.batchId, request }));
  }

  public onCancel(): void {
    this.store.dispatch(qsfSweepActions.ResetQsfSweepCommitChanges());
    this.closeModal();
  }

  protected closeModal(): void {
    if (this.modal) {
      this.modal.hide();
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
