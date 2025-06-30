import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { UntypedFormGroup, Validators, UntypedFormBuilder } from '@angular/forms';
import { InjuryEvent } from '@app/models/injury-event';
import { injuryTypesDropdownValues } from '@app/state';
import { IdValue } from '@app/models';
import { DateValidator } from '@app/modules/shared/_validators/date-validator';
import { IInjuryEventsListState } from '../state/reducer';
import { SaveInjuryEvent, DeleteInjuryEvent } from '../state/actions';

@Component({
  selector: 'app-add-new-injury-event-modal',
  templateUrl: './add-new-injury-event-modal.component.html',
  styleUrls: ['./add-new-injury-event-modal.component.scss']
})
export class AddNewInjuryEventModalComponent extends ValidationForm implements OnInit, OnDestroy {
  protected get validationForm(): UntypedFormGroup {
    return this.injuryEventForm;
  }

  public injuryEvent: InjuryEvent;
  public claimantId: number;

  public injuryEventTypes: IdValue[];
  public injuryEventForm: UntypedFormGroup;
  public isDeleteButtonVisible: boolean = false;
  public todaysDate: Date = new Date();

  public injuryTypes$ = this.store.select(injuryTypesDropdownValues);
  public ngDestroyed$ = new Subject<void>();

  constructor(
    private fb: UntypedFormBuilder,
    private store: Store<IInjuryEventsListState>,
    public addNewInjuryEventModal: BsModalRef,
    private dateValidator: DateValidator,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.isDeleteButtonVisible = !!this.injuryEvent;
    this.injuryEventForm = this.fb.group({
      date: [this.injuryEvent ? new Date(this.injuryEvent.startDate) : '', [Validators.required, this.dateValidator.notFutureDate]],
      type: [this.injuryEvent ? this.injuryEvent.injuryEventType.id : '', [Validators.required]],
      description: [this.injuryEvent ? this.injuryEvent.description : ''],
    });
  }


  public onSave(): void {
    if (!super.validate()) {
      return;
    }

    const injuryEvent: any = {
      id: this.injuryEvent && this.injuryEvent.id,
      injuryEventTypeId: this.injuryEventForm.controls.type.value,
      startDate: this.injuryEventForm.controls.date.value,
      description: this.injuryEventForm.controls.description.value,
      clientIds: [this.claimantId],
    };

    this.store.dispatch(SaveInjuryEvent({ injuryEvent, successCallback: this.onCancel.bind(this) }));
  }

  public onCancel(): void {
    this.addNewInjuryEventModal.hide();
  }

  public onDelete(): void {
    const injuryEvent: any = {
      id: this.injuryEvent && this.injuryEvent.id,
      clientIds: [this.claimantId],
    };

    this.store.dispatch(DeleteInjuryEvent({ injuryEvent, successCallback: this.onCancel.bind(this) }));
  }

  public ngOnDestroy(): void {
    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
  }
}
