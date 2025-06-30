import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import {
  PermissionActionTypeEnum,
  PermissionTypeEnum,
} from '@app/models/enums';
import { PermissionService, ValidationService } from '@app/services';
import { Store } from '@ngrx/store';
import * as actions from '@app/modules/claimants/claimant-details/state/actions';
import { ClaimantDetailsState } from '@app/modules/claimants/claimant-details/state/reducer';
import { Claimant } from '@app/models/claimant';
import { Subject } from 'rxjs';
import { fullClaimantPin, isFullPinLoaded } from '@app/modules/claimants/claimant-details/state/selectors';
import { takeUntil } from 'rxjs/operators';
import { PinPipe } from '../_pipes';
import { ValidationForm } from '../_abstractions/validation-form';

@Component({
  selector: 'app-pin-code',
  templateUrl: 'pin-code.component.html',
})
export class PinCodeComponent extends ValidationForm implements OnInit {
  @Input() public canEdit: boolean = true;
  @Input() public client: Claimant;

  public isFullPinLoaded$ = this.store.select(isFullPinLoaded);
  public fullClaimantPin$ = this.store.select(fullClaimantPin);
  private readonly ngUnsubscribe$ = new Subject<void>();

  public isPinLoaded: boolean = false;
  public fullClaimantPin: string = '';

  public pinReadPermissions = PermissionService.create(
    PermissionTypeEnum.ClaimantPin,
    PermissionActionTypeEnum.Read,
  );
  public pinEditPermissions = [
    PermissionService.create(
      PermissionTypeEnum.ClaimantPin,
      PermissionActionTypeEnum.Read,
    ),
    PermissionService.create(
      PermissionTypeEnum.ClaimantPin,
      PermissionActionTypeEnum.Edit,
    ),
  ];

  public form: UntypedFormGroup = new UntypedFormGroup({
    pin: new UntypedFormControl(null, [
      Validators.maxLength(12),
      ValidationService.onlyAlphanumerics,
    ]),
  });

  constructor(
    private store: Store<ClaimantDetailsState>,
    private pinPipe: PinPipe,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.form.patchValue({ pin: this.pin });

    this.isFullPinLoaded$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((isPinLoaded: boolean) => {
        this.isPinLoaded = isPinLoaded;
      });

    this.fullClaimantPin$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((fullPin: string) => {
        this.fullClaimantPin = fullPin;
        this.togglePinValidators();
      });
  }

  public get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public get pin(): string {
    return this.fullClaimantPin;
  }

  protected togglePinValidators(): void {
    this.form.patchValue({ pin: this.pin });
  }

  public formatPin(pin: string, showFullValue: boolean): string {
    return this.pinPipe.transform(pin, showFullValue);
  }

  public onViewFull(): void {
    this.store.dispatch(actions.GetClientFullPin({ clientId: this.client.id }));
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.ResetClientFullPin());
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
