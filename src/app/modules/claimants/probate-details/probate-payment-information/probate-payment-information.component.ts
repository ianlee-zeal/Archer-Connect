import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ProbateDetails } from '@app/models/probate-details';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { Claimant } from '@app/models/claimant';
import { CommonHelper } from '@app/helpers';
import { PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { ProbateStage } from '@app/models/enums/probate-stage.enum';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NEW_ID } from '@app/helpers/constants';
import * as fromContacts from '@app/modules/dashboard/persons/contacts/state/index';
import { ClaimantDetailsState } from '../../claimant-details/state/reducer';
import * as actions from '../../claimant-details/state/actions';
import * as selectors from '../../claimant-details/state/selectors';
import { GetClaimantDisbursementGroupListRequest } from '../../claimant-details/disbursements/claimant-disbursements/state/actions';

@Component({
  selector: 'app-probate-payment-information',
  templateUrl: './probate-payment-information.component.html',
  styleUrls: ['./probate-payment-information.component.scss'],
})
export class ProbatePaymentInformationComponent extends ValidationForm implements OnChanges, OnInit, OnDestroy {
  @Input() public canEdit: boolean = true;
  @Input() public claimant: Claimant;
  @Input() public probateDetails: ProbateDetails;

  readonly probateDisbursementGroups$ = this.store.select(selectors.probateDisbursementGroups);
  readonly probateStages$ = this.store.select(selectors.probateStages);
  readonly personContacts$ = this.store.select(fromContacts.selectors.personContactPaidOnBehalfListSelector);

  private ngUnsubscribe$ = new Subject<void>();

  public probateDisbursementGroups: string = '';

  get canReadDisbursementGroups(): boolean {
    return this.permissionService.canRead(PermissionTypeEnum.ClaimantDisbursementGroups);
  }

  get canReadClientContacts(): boolean {
    return this.permissionService.canRead(PermissionTypeEnum.ClientContact);
  }

  public form: UntypedFormGroup = new UntypedFormGroup({
    invoiced: new UntypedFormControl(''),
    invoiceDate: new UntypedFormControl(''),
    invoiceAmount: new UntypedFormControl(''),
    invoiceNumber: new UntypedFormControl(''),
  });

  public get validationForm(): UntypedFormGroup {
    return this.form;
  }

  private readonly amountComponents = ['invoiceAmount'];

  constructor(
    private readonly store: Store<ClaimantDetailsState>,
    private readonly permissionService: PermissionService,
  ) {
    super();
  }

  ngOnInit(): void {
    if (this.permissionService.canRead(PermissionTypeEnum.DisbursementGroups) && this.probateDetails.client?.project?.id) {
      this.store.dispatch(actions.GetDisbursementGroupsList({
        claimantId: this.probateDetails.clientId,
        projectId: this.probateDetails.client.project.id,
      }));
    }

    this.form.patchValue({
      invoiced: this.probateDetails?.invoiced,
      invoiceDate: this.probateDetails?.invoiceDate,
      invoiceAmount: this.probateDetails?.invoiceAmount,
      invoiceNumber: this.probateDetails?.invoiceNumber,
    });

    this.probateDisbursementGroups$
      .pipe(
        filter(x => !!x),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(disbursementGroups => {
        if (disbursementGroups.length > 0 && this.probateDetails.id !== NEW_ID) {
          this.probateDisbursementGroups = disbursementGroups.map(item => `${item.name}`).join(', ');
        } else {
          this.probateDisbursementGroups = '';
        }
      });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    const { claimant } = this;

    const claimantChange = changes[CommonHelper.nameOf({ claimant })];

    if (claimantChange && claimant && this.canReadDisbursementGroups) {
      const gridParams = {
        request: {
          startRow: 0,
          endRow: -1,
        },
        success: response => {
          const disbursementGroupList = response.rowData.map(g => ({ id: g.disbursementGroupId, name: g.disbursementGroup?.name, disabled: true }));
          this.store.dispatch(actions.GetDisbursementGroupsListSuccess({ disbursementGroupList }));
        },
      } as any;
      this.store.dispatch(GetClaimantDisbursementGroupListRequest({ clientId: this.claimant.id, agGridParams: gridParams }));
    }

    if (this.canEdit && changes.probateDetails) {
      this.toggleValidators();
    }

    if (this.canReadClientContacts && claimantChange && claimant) {
      this.store.dispatch(fromContacts.actions.GetAllPersonContactsRequest({ claimantId: claimant.id }));
    }
  }

  filterFromSelectOptions(options: SelectOption[], id: number): SelectOption {
    if (!!options && options.length > 0) {
      const selectedOptions = options?.filter(i => i.id === id);
      const option: SelectOption = selectedOptions.length > 0 ? selectedOptions[0] : null;
      return option;
    }
    return null;
  }

  private toggleValidators() {
    if (this.probateDetails) {
      const isAmountRequired = this.probateDetails.probateStageId === ProbateStage.FinalizedClaim;
      this.amountComponents.forEach(key => {
        const control = this.form.get(key);
        if (control) {
          control.clearValidators();
          if (isAmountRequired) {
            control.setValidators(Validators.required);
          }
          control.updateValueAndValidity();
        }
      });
    }
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
