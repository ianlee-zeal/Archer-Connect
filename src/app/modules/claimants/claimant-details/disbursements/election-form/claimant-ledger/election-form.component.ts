import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DropdownHelper } from '@app/helpers/dropdown.helper';
import { TypeAheadHelper } from '@app/helpers/type-ahead.helper';
import { ClaimantElection, Country } from '@app/models';
import { ElectionFormFormatReceivedType, ElectionPaymentMethod, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { DateValidator } from '@app/modules/shared/_validators/date-validator';
import { Observable, Subject } from 'rxjs';
import { ActionsSubject, Store } from '@ngrx/store';
import * as fromShared from '@app/state';
import { filter, first, takeUntil } from 'rxjs/operators';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { CanLeave } from '@app/modules/shared/_interfaces';
import { PermissionService } from '@app/services';
import { ElectionFormStatus } from '@app/models/enums/election-form-status';
import { ActivatedRoute } from '@angular/router';
import { ofType } from '@ngrx/effects';
import * as rootActions from '@app/state/root.actions';
import * as actions from '../../../state/actions';
import * as selectors from '../../../state/selectors';

@Component({
  selector: 'app-election-form',
  templateUrl: './election-form.component.html',
  styleUrls: ['./election-form.component.scss'],
  encapsulation: ViewEncapsulation.None,

})
export class ElectionFormComponent implements CanLeave, OnInit, OnDestroy {
  countrySearch = (search$: Observable<string>) => TypeAheadHelper.search(this.countries, search$);
  countryValidator = (control: AbstractControl) => TypeAheadHelper.getValidationError(control, this.countries);
  public dropdownComparator = DropdownHelper.compareOptions;
  public addressTypesDropdownValues$ = this.store.select(fromShared.addressTypesDropdownValues);
  public electionFormStatuses$ = this.store.select(fromShared.electionFormStatusOptions);
  public electionFormFormatReceivedTypes = this.enumToArrayPipe.transform(ElectionFormFormatReceivedType);

  public electionForm$ = this.store.select(selectors.electionForm);
  public item$ = this.store.select(selectors.item);
  public documentChannels$ = this.store.select(fromShared.documentChannelsDropdownValues);

  public form: UntypedFormGroup;
  public electionForm: ClaimantElection;
  private hasChanges: boolean;
  private isInvalid: boolean;

  private ngUnsubscribe$ = new Subject<void>();

  constructor(
    private store: Store<fromShared.AppState>,
    private dateValidator: DateValidator,
    private fb: UntypedFormBuilder,
    private enumToArrayPipe: EnumToArrayPipe,
    private route: ActivatedRoute,
    private actionsSubj: ActionsSubject,
  ) {}

  public canEdit = false;
  public electionPaymentMethod = ElectionPaymentMethod;
  public countries: Country[] = [];
  private clientId: number;
  private electionFormId: number;

  public get canLeave(): boolean {
    return !this.hasChanges;
  }

  public get totalAmount() {
    return Number(this.form.controls.lumpSumAmount.value)
    + Number(this.form.controls.structuredSettlement.value)
    + Number(this.form.controls.specialNeedsTrust.value);
  }

  ngOnInit(): void {
    this.electionFormId = this.route.snapshot.params.id;

    if (this.electionFormId) {
      this.store.dispatch(actions.GetElectionForm({ id: this.electionFormId }));
    }
    this.initActionBar();
    this.store.select(fromShared.countriesDropdownValues).pipe(
      filter(x => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(results => {
      this.countries = <Country[]>results;
    });

    this.item$
      .pipe(
        filter(item => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(claimant => {
        this.clientId = claimant.id;
      });

    this.electionForm$
      .pipe(
        filter(item => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(electionForm => {
        this.electionForm = electionForm;
        this.initForm(electionForm);
      });

    this.electionFormStatuses$
      .pipe(first())
      .subscribe(statuses => {
        if (!statuses.length) {
          this.store.dispatch(rootActions.GetElectionFormStatuses());
        }
      });

    this.actionsSubj
      .pipe(
        ofType(actions.CreateOrUpdateElectionFormSuccess),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(() => {
        this.canEdit = false;
        this.hasChanges = false;
      });
  }

  public onCountryChange(event) {
    const search = event.srcElement.value;
    const country = TypeAheadHelper.get(this.countries, search.toLowerCase());

    this.form.patchValue({ countryName: country ? country.name : search });
  }

  public isElectionFormatTypeActive(type: ElectionFormFormatReceivedType): boolean {
    return type === this.electionForm?.documentChannelId;
  }

  public toggleViewMode(): void {
    this.canEdit = !this.canEdit;
  }

  public onSave(): void {
    const electionForm: ClaimantElection = {
      ...this.electionForm,
      clientId: this.clientId,
      received: this.form.value.electionFormReceived,
      receivedDate: this.form.value.dateReceived,
      efPaymentMethodId: this.form.value.electionFormPaymentMethodId,
      lumpSumAmount: this.form.value.lumpSumAmount,
      structuredSettlementAmount: this.form.value.structuredSettlement,
      specialNeedsTrustAmount: this.form.value.specialNeedsTrust,
      addressChange: this.form.value.addressChangeNeeded,
      addressCity: this.form.value.city,
      addressLineOne: this.form.value.line1,
      addressLineTwo: this.form.value.line2,
      addressState: this.form.value.state,
      addressZip: this.form.value.zip,
      addressType: this.form.value.type,
      addressTypeId: this.form.value.type?.id,
      country: this.form.value.countryName,
      electionFormStatusId: this.form.value.status.id,
    };
    this.store.dispatch(actions.CreateOrUpdateElectionForm({ electionForm, file: null }));
  }

  public onCheckFormat(type: any, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.electionForm.documentChannelId = type.id;
    } else {
      this.electionForm.documentChannelId = null;
    }
  }

  public onChange() {
    this.isInvalid = this.form?.invalid;
    this.hasChanges = true;
  }

  private initActionBar() {
    this.store.dispatch(actions.UpdateClaimantsActionBar({
      actionBar: <ActionHandlersMap>{
        save: {
          callback: () => this.onSave(),
          disabled: () => !this.hasChanges || this.isInvalid,
          hidden: () => !this.canEdit,
          permissions: PermissionService.create(PermissionTypeEnum.ElectionForms, PermissionActionTypeEnum.Edit),
          awaitedActionTypes: [
            actions.CreateOrUpdateElectionFormSuccess.type,
            actions.Error.type,
          ],
        },
        edit: {
          callback: () => this.toggleViewMode(),
          hidden: () => this.canEdit,
          permissions: PermissionService.create(PermissionTypeEnum.ElectionForms, PermissionActionTypeEnum.Edit),
        },
        cancel: {
          callback: () => this.toggleViewMode(),
          hidden: () => !this.canEdit,
        },
      },
    }));
  }

  private initForm(electionForm: ClaimantElection) {
    this.form = this.fb.group({
      electionFormReceived: [electionForm.received, Validators.requiredTrue],
      dateReceived: [electionForm.receivedDate, [this.dateValidator.valid]],
      electionFormPaymentMethodId: [electionForm.efPaymentMethodId ?? ElectionPaymentMethod.LumpSumPayment],
      documentChannelChecked: [!!electionForm.documentChannelId, Validators.requiredTrue],
      lumpSumAmount: [electionForm.lumpSumAmount],
      structuredSettlement: [electionForm.structuredSettlementAmount],
      specialNeedsTrust: [electionForm.specialNeedsTrustAmount],
      addressChangeNeeded: [electionForm.addressChange],
      line1: [electionForm.addressLineOne],
      line2: [electionForm.addressLineTwo],
      city: [electionForm.addressCity],
      state: [electionForm.addressState],
      zip: [electionForm.addressZip],
      countryName: [electionForm.country, this.countryValidator],
      type: [electionForm.addressType],
      status: [electionForm.electionFormStatus ?? { id: ElectionFormStatus.PendingReview, name: 'Pending Review' }, Validators.required],
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
