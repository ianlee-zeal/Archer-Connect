import { Component, OnInit, OnDestroy } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ActionsSubject, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { ofType } from '@ngrx/effects';
import { AppState } from '@shared/state';
import * as qsfSweepSelectors from '@app/modules/qsf-sweep/state/selectors';
import * as qsfSweepActions from '@app/modules/qsf-sweep/state/actions';
import { takeUntil } from 'rxjs/operators';
import { QSFLienSweepStatus } from '@app/models/enums/qsf-lien-sweep-status.enum';

@Component({
  selector: 'app-run-qsf-sweep-modal',
  templateUrl: './run-qsf-sweep-modal.component.html',
  styleUrls: ['./run-qsf-sweep-modal.component.scss'],
})
export class RunQsfSweepModalComponent implements OnInit, OnDestroy {
  protected ngUnsubscribe$ = new Subject<void>();

  public caseId: number;
  public claimantsCount: number;

  readonly awaitedSaveActionTypes = [
    qsfSweepActions.RunQsfSweepComplete.type,
    qsfSweepActions.Error.type,
  ];

  public step: number = 1;
  public isError: boolean = false;

  public readonly isLoading$ = this.store.select(qsfSweepSelectors.isLoading);
  public isQsfSweepInProgress$ = this.store.select(qsfSweepSelectors.isQsfSweepInProgress);
  public statusId: QSFLienSweepStatus;
  public channelName: string;

  constructor(
    private readonly store: Store<AppState>,
    private readonly modal: BsModalRef,
    private readonly actionsSubj: ActionsSubject,
  ) {}

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public ngOnInit(): void {
    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(qsfSweepActions.RunQsfSweepComplete),
    ).subscribe(({ statusId }: { channelName: string, statusId: QSFLienSweepStatus }) => {
      this.step = 2;
      this.isError = statusId == QSFLienSweepStatus.Error;
    });
  }

  public onCancel(): void {
    this.closeModal();
  }

  public onContinue(): void {
    this.store.dispatch(qsfSweepActions.RunQsfSweep({ caseId: this.caseId }));
  }

  protected closeModal(): void {
    if (this.modal) {
      this.modal.hide();
    }
  }
}
