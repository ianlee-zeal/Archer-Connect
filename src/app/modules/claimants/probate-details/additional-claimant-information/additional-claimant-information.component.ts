import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ProbateDetails } from '@app/models/probate-details';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { DateValidator } from '@app/modules/shared/_validators/date-validator';
import * as fromShared from '@app/state';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { IdValue } from '@app/models';
import { ClaimantDetailsState } from '../../claimant-details/state/reducer';

@Component({
  selector: 'app-additional-claimant-information',
  templateUrl: './additional-claimant-information.component.html',
  styleUrls: ['./additional-claimant-information.component.scss'],
})
export class AdditionalClaimantInformationComponent extends ValidationForm implements OnInit {
  @Input() public canEdit: boolean = true;
  @Input() public probateDetails: ProbateDetails;
  @Input() public claimantSummaryTotalAllocation: number | undefined;

  private ngUnsubscribe$ = new Subject<void>();
  public todaysDate: Date = new Date();
  public stateCodes: IdValue[] = [];

  public readonly statesDropdownValues$ = this.store.select(fromShared.statesDropdownValues);

  constructor(
    protected store: Store<ClaimantDetailsState>,
    private dateValidator: DateValidator,
  ) {
    super();
  }

  ngOnInit(): void {
    this.form.patchValue({
      county: this.probateDetails?.county,
      stateOfResidence: this.probateDetails?.stateOfResidence,
      allocationAmount: this.allocationAmount,
      newlyDeceased: this.probateDetails?.newlyDeceased,
      dateSentToProbateDept: this.probateDetails?.dateSentToProbateDept ?? new Date(),
      dateAssigned: this.probateDetails?.dateAssigned,
      dateAllocationRecd: this.probateDetails?.dateAllocationRecd,
      dateNextFollowUp: this.probateDetails?.dateNextFollowUp,
      dateCompleted: this.probateDetails?.dateCompleted,
      releaseId: this.probateDetails?.releaseId,
      dateOfDeath: this.probateDetails?.dateOfDeath,
    });

    this.store
      .select(fromShared.statesDropdownValues)
      .pipe(
        filter(x => !!x),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(results => {
        this.stateCodes = results.map(p => new IdValue(Number(p.id), p.code));
      });

    this.subscribeToStatesDropdown();
  }

  public form: UntypedFormGroup = new UntypedFormGroup({
    county: new UntypedFormControl(''),
    stateOfResidence: new UntypedFormControl(''),
    allocationAmount: new UntypedFormControl(''),
    newlyDeceased: new UntypedFormControl(''),
    dateSentToProbateDept: new UntypedFormControl(''),
    dateAssigned: new UntypedFormControl(''),
    dateAllocationRecd: new UntypedFormControl(''),
    dateNextFollowUp: new UntypedFormControl(''),
    dateCompleted: new UntypedFormControl(''),
    releaseId: new UntypedFormControl(''),
    dateOfDeath: new UntypedFormControl(''),
  });

  public get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public get allocationAmount(): number | null | undefined {
    if (this.probateDetails?.allocationAmount === null) {
      return this.claimantSummaryTotalAllocation;
    }

    return !Number.isNaN(Number(this.probateDetails?.allocationAmount))
      ? Number(this.probateDetails?.allocationAmount)
      : undefined;
  }

  public get allocationAmountTooltip(): string {
    return (!!this.probateDetails
      && this.probateDetails?.allocationAmount !== null
      && this.claimantSummaryTotalAllocation !== undefined
      && this.claimantSummaryTotalAllocation !== null
      && Number(this.probateDetails?.allocationAmount) !== this.claimantSummaryTotalAllocation)
      ? 'Allocation Discrepancy'
      : '';
  }

  filterFromSelectOptions(options: SelectOption[], id: number): SelectOption {
    if (!!options && options.length > 0) {
      const selectedOptions = options?.filter(i => i.id === id);
      const option: SelectOption = selectedOptions.length > 0 ? selectedOptions[0] : null;
      return option;
    }
    return null;
  }

  private subscribeToStatesDropdown() {
    this.statesDropdownValues$.pipe(
      filter(x => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(results => {
      this.stateCodes = results.map(p => new IdValue(Number(p.id), p.code));
    });
  }
}
