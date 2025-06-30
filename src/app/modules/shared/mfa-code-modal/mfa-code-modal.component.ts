import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';
import { authSelectors } from '@app/modules/auth/state';
import { sharedActions } from '@app/modules/shared/state';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { AuthyUpdateRequest, UserInfo } from '@app/models/users';
import { ServerErrorService } from '@app/services';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { SharedMfaCodeModalState } from '../state/mfa-code-modal/reducer';
import * as selectors from '../../user-profile/state/selectors';

@Component({
  selector: 'app-mfa-code-modal',
  templateUrl: './mfa-code-modal.component.html',
  styleUrls: ['./mfa-code-modal.component.scss'],
})
export class MfaCodeModalComponent implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject<void>();
  private userGuid: string;

  @Input()
  title: string;

  @Input()
  phoneNumberShort: string;

  @Input()
  authyUpdateRequest: AuthyUpdateRequest;

  public linesCount = new Array(7);

  readonly user$ = this.store.select<any>(authSelectors.getUser);
  private readonly error$ = this.store.select<any>(selectors.error);

  public form: UntypedFormGroup = new UntypedFormGroup({ code: new UntypedFormControl('') });

  constructor(
    private readonly modal: BsModalRef,
    private readonly store: Store<SharedMfaCodeModalState>,
    public serverErrorService: ServerErrorService,
  ) { }

  ngOnInit() {
    this.user$.pipe(
      filter(x => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((user: UserInfo) => {
      this.userGuid = user.userGuid;
      this.sendMfaCodeRequest();
    });

    this.error$.pipe(
      filter(error => !!error),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(error => {
      this.form.get('code').setErrors(null);
      this.serverErrorService.showServerErrors(this.form, { error });
    });
  }

  public onSubmit() {
    const code = this.form.controls.code.value;
    this.store.dispatch(sharedActions.mfaCodeActions.SaveUserEnteredMfaCode({ code }));
  }

  public cancel(): void {
    this.modal.hide();
  }

  public resendCode() {
    this.sendMfaCodeRequest();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  private sendMfaCodeRequest() {
    if (this.authyUpdateRequest) {
      this.store.dispatch(sharedActions.mfaCodeActions.SendMfaCodeRequestForNewAuthyUser({ request: this.authyUpdateRequest }));
    } else {
      this.store.dispatch(sharedActions.mfaCodeActions.SendMfaCodeRequest({ userGuid: this.userGuid }));
    }
  }
}
