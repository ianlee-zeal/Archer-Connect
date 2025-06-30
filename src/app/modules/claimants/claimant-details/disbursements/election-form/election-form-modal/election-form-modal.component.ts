import { Component, OnDestroy, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';

import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { ElectionFormFormatReceivedType, ElectionPaymentMethod, EntityTypeEnum, PaymentMethodEnum } from '@app/models/enums';
import * as fromShared from '@app/state';
import { Address, ClaimantElection, Email } from '@app/models';
import { ElectionFormAmountFields, ElectionFormModalService } from '@app/services/election-form-modal.service';
import { sharedSelectors, sharedActions } from '@app/modules/shared/state';
import { ElectionFormTotalCalculatorService } from '@app/services/election-form-total-calculator.service';
import * as rootActions from '@app/state/root.actions';
import * as selectors from '../../../state/selectors';
import * as actions from '../../../state/actions';
import { ClaimantDetailsState } from '../../../state/reducer';

@Component({
  selector: 'app-election-form-modal',
  templateUrl: './election-form-modal.component.html',
  styleUrls: ['./election-form-modal.component.scss'],
})
export class ElectionFormModalComponent implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject<void>();
  private electionForm$ = this.store.select(selectors.electionForm);

  public title: string;
  public electionFormId: number;

  public documentChannels$ = this.store.select(fromShared.documentChannelsDropdownValues);
  public availableDisbursementGroupsForElectionForm$ = this.store.select(selectors.availableDisbursementGroupsForElectionForm);
  public electionFormStatuses$ = this.store.select(fromShared.electionFormStatusOptions);
  public item$ = this.store.select(selectors.item);
  public primaryEmail$ = this.store.select(sharedSelectors.emailSelectors.primaryEmail);

  public electionForm: ClaimantElection;
  public electionPaymentMethod = ElectionPaymentMethod;
  public amountFields: ElectionFormAmountFields;
  public personAddress: Address;

  public paymentMethod = PaymentMethodEnum;
  public primaryEmail: Email;

  form: UntypedFormGroup;

  constructor(
    public electionFormModal: BsModalRef,
    private store: Store<ClaimantDetailsState>,
    private electionFormService: ElectionFormModalService,
    private electionFormCalculatorService: ElectionFormTotalCalculatorService,
    private readonly formBuilder: UntypedFormBuilder,
  ) {}

  public get totalAmount(): number {
    if (this.electionForm) {
      const { lumpSumAmount, structuredSettlementAmount, specialNeedsTrustAmount } = this.electionForm;
      return this.electionFormCalculatorService.calcTotal(lumpSumAmount, structuredSettlementAmount, specialNeedsTrustAmount);
    }

    return 0;
  }

  public ngOnInit(): void {
    this.subscribeToPrimaryEmail();
    this.electionForm$
      .pipe(
        filter((d: ClaimantElection) => !!d),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((electionForm: ClaimantElection) => {
        this.electionForm = electionForm;
        this.form = this.formBuilder.group({ note: this.electionForm.note });
        this.personAddress = Address.toModel(electionForm.client.person.primaryAddress);
        this.amountFields = this.electionFormService.getAmountFieldsFromElectionForm(electionForm);
        if (electionForm.client.person?.id && this.primaryEmail == null) {
          this.store.dispatch(sharedActions.emailActions.GetPrimaryEmailByEntity({ entityType: EntityTypeEnum.Persons, entityId: electionForm.client.person.id }));
        }
      });

    this.store.dispatch(actions.GetElectionForm({ id: this.electionFormId }));
    this.store.dispatch(rootActions.GetElectionFormStatuses());
  }

  public isElectionFormatTypeActive(type: ElectionFormFormatReceivedType): boolean {
    return type === this.electionForm?.documentChannelId;
  }

  public onDownloadDocument(): void {
    this.store.dispatch(sharedActions.documentsListActions.DownloadDocument({ id: this.electionForm.doc.id }));
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.ClearElectionForm());
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  onClose(): void {
    this.electionFormModal.hide();
  }

  private subscribeToPrimaryEmail(): void {
    this.primaryEmail$
      .pipe(
        filter((d: Email) => !!d),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((email: Email) => {
        this.primaryEmail = email;
      });
  }
}
