import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { takeUntil } from 'rxjs/operators';
import { ofType } from '@ngrx/effects';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import * as claimantDetailsActions from '../../state/actions';
import * as claimantDetailsSelectors from '../../state/selectors';
import * as claimantDetailsStore from '../../state/reducer';

@Component({
  selector: 'app-delete-ledger-modal',
  templateUrl: './delete-ledger-modal.component.html',
  styleUrls: ['./delete-ledger-modal.component.scss'],
})
export class DeleteLedgerComponent implements OnInit, OnDestroy {
  public claimantId: number;
  public disbursementGroupId: number;
  public error$ = this.store.select(claimantDetailsSelectors.error);
  public ngDestroyed$ = new Subject<void>();
  public disabled = true;

  readonly awaitedSubmitActionTypes = [
    claimantDetailsActions.DeleteLedgerRequestSuccess.type,
    claimantDetailsActions.DeleteLedgerRequestError.type,
    claimantDetailsActions.Error.type,
  ];

  constructor(
    private store: Store<claimantDetailsStore.ClaimantDetailsState>,
    public modal: BsModalRef,
    private actionsSubj: ActionsSubject,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.actionsSubj.pipe(
      takeUntil(this.ngDestroyed$),
      ofType(claimantDetailsActions.DeleteLedgerRequestSuccess),
    ).subscribe(() => {
      this.modal.hide();
      this.router.navigate([`/claimants/${this.claimantId}/payments/tabs/ledger-summary`]);
    });
    this.actionsSubj.pipe(
      takeUntil(this.ngDestroyed$),
      ofType(claimantDetailsActions.DeleteLedgerRequestPreviewSuccess),
    ).subscribe(() => {
      this.disabled = false;
    });
    this.actionsSubj.pipe(
      takeUntil(this.ngDestroyed$),
      ofType(claimantDetailsActions.DeleteLedgerRequestError),
    ).subscribe(() => {
      this.disabled = true;
    });
  }

  public onClose(): void {
    this.modal.hide();
  }

  public onDelete(): void {
    this.store.dispatch(claimantDetailsActions.DeleteLedgerRequest({ clientId: this.claimantId, disbursementGroupId: this.disbursementGroupId, preview: false }));
  }

  public ngOnDestroy(): void {
    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
  }
}
