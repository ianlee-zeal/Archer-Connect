import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, UntypedFormBuilder, AbstractControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { combineLatest, Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import moment from 'moment-timezone';

import { Document } from '@app/models/documents/document';
import { CommunicationTypeEnum } from '@app/models/enums/communication-type.enum';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { CommonHelper } from '@app/helpers';
import { ELASTIC_MAX_STRING_LENGTH } from '@app/helpers/constants';
import { ValidationService } from '@app/services';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { ClaimantsState } from '../../../claimants/state/reducer';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import { CommunicationRecord } from '../../../../models/communication-center/communication-record';
import { Note } from '../../../../models/note';
import { EntityTypeEnum } from '../../../../models/enums';

const OTHER_OPTION_NAME = 'Other';

@Component({
  selector: 'app-new-phone-call',
  templateUrl: './new-phone-call.component.html',
  styleUrls: ['./new-phone-call.component.scss'],
})
export class NewPhoneCallComponent extends ValidationForm implements OnInit, OnDestroy {
  @Input() communicationRecord: CommunicationRecord;

  private ngUnsubscribe$ = new Subject<void>();
  public directionsSelector$ = this.store.select(selectors.communicationDirectionsOptions);
  public communicationPartyListSelector$ = this.store.select(selectors.communicationPartiesOptions);
  public communicationResultListSelector$ = this.store.select(selectors.communicationResultsOptions);
  public communicationSubjectListSelector$ = this.store.select(selectors.communicationSubjectsOptions);

  public communicationResultList: SelectOption[];
  public communicationSubjectList: SelectOption[];

  public formGroup: UntypedFormGroup;
  public isShowOtherSubjectField: boolean;
  public isShowOtherResultField: boolean;
  private methodId = CommunicationTypeEnum.Call;

  constructor(
    private store: Store<ClaimantsState>,
    private fb: UntypedFormBuilder,
  ) {
    super();

    this.formGroup = this.fb.group({
      callId: new UntypedFormControl(null, [Validators.required, Validators.min(1), ValidationService.onlyNumbersValidator, ValidationService.maxIntValidator]),
      phoneNumber: new UntypedFormControl(null, [Validators.required, ValidationService.phoneNumberValidator]),
      claimant: new UntypedFormControl(null, Validators.required),
      callerName: new UntypedFormControl(null, [Validators.required, Validators.maxLength(50)]),
      partyType: new UntypedFormControl(null, Validators.required),
      direction: new UntypedFormControl(null, Validators.required),
      subject: new UntypedFormControl(null, [this.checkDirectionAndMethodValidator.bind(this), Validators.required]),
      method: new UntypedFormControl(CommunicationTypeEnum.Call),
      otherSubject: new UntypedFormControl(null),
      result: new UntypedFormControl(null, [this.checkDirectionAndMethodValidator.bind(this), Validators.required]),
      otherResult: new UntypedFormControl(null),
      notes: new UntypedFormControl(null, [Validators.maxLength(ELASTIC_MAX_STRING_LENGTH), Validators.required, ValidationService.noEmptyStringInHTMLValidator]),
      startTime: new UntypedFormControl(new Date()),
      endTime: new UntypedFormControl(null),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public checkDirectionAndMethodValidator(_control: AbstractControl): { error: string } | null {
    return this.formGroup && this.formGroup.controls.direction.value ? null : { error: 'Select the direction of the communication first' };
  }

  ngOnInit(): void {
    this.store.dispatch(actions.GetCommunicationDirectionListRequest());
    this.store.dispatch(actions.GetCommunicationPartyTypeListRequest());
    this.communicationSubjectListSelector$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((result: SelectOption[]) => { this.communicationSubjectList = result; });

    this.communicationResultListSelector$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((result: SelectOption[]) => { this.communicationResultList = result; });

    if (this.communicationRecord) {
      this.formGroup.patchValue({
        callId: this.communicationRecord.callId,
        phoneNumber: this.communicationRecord.phoneNumber,
        claimant: this.communicationRecord.claimant,
        callerName: this.communicationRecord.callerName,
        otherSubject: this.communicationRecord.otherSubject,
        otherResult: this.communicationRecord.otherResults,
        notes: this.communicationRecord.notes?.length ? this.communicationRecord.notes[0].html : '',
        startTime: this.communicationRecord.startTime,
        endTime: this.communicationRecord.endTime,
      });

      // Patch if value is selected
      if (this.communicationRecord.partyType) this.formGroup.patchValue({ partyType: this.communicationRecord.partyType });
      if (this.communicationRecord.direction) this.formGroup.patchValue({ direction: this.communicationRecord.direction });
      if (this.communicationRecord.subject) this.formGroup.patchValue({ subject: this.communicationRecord.subject });
      if (this.communicationRecord.result) this.formGroup.patchValue({ result: this.communicationRecord.result });
      if (this.communicationRecord.mailTrackingNumberTypeId) this.formGroup.patchValue({ trackingNumberType: this.communicationRecord.mailTrackingNumberTypeId });
    }

    if (this.communicationRecord) {
      combineLatest([
        this.formGroup.get('direction').valueChanges.pipe(startWith(this.communicationRecord.direction)),
      ])
        .pipe(
          takeUntil(this.ngUnsubscribe$),
        )
        .subscribe(([direction]: [number]) => {
          this.getResultAndSubject(direction);
        });
    } else {
      combineLatest([
        this.formGroup.get('direction').valueChanges])
        .pipe(
          takeUntil(this.ngUnsubscribe$),
        )
        .subscribe(([direction]: [number]) => {
          this.getResultAndSubject(direction);
        });
    }
  }

  public getResultAndSubject(direction: number): void {
    this.store.dispatch(actions.GetCommunicationResultListRequest({ directionId: direction, methodId: this.methodId }));
    this.store.dispatch(actions.GetCommunicationSubjectListRequest({ directionId: direction, methodId: this.methodId }));
    this.formGroup.controls.result.updateValueAndValidity({ onlySelf: true });
    this.formGroup.controls.subject.updateValueAndValidity({ onlySelf: true });
  }

  markAsTouched(fields: string[]): void {
    if (!this.formGroup.controls.direction.value) {
      fields.forEach((field: string) => this.formGroup.controls[field].markAsTouched());
    }
  }

  public getModel(entityType: number, entityId: number, relatedDocuments: Document[]): CommunicationRecord {
    CommonHelper.windowLog('getModel');
    CommonHelper.windowLog('this.formGroup.value', this.formGroup.value);
    if (this.formGroup.value) {
      const newCommunicationRecord = {
        ...this.formGroup.value,
        id: 0,
        entityType,
        entityId,
        callId: +this.formGroup.value.callId,
        directionId: +this.formGroup.value.direction,
        methodId: +this.formGroup.value.method,
        partyTypeId: +this.formGroup.value.partyType,
        subjectId: +this.formGroup.value.subject,
        resultId: +this.formGroup.value.result,
        otherResults: this.formGroup.value.otherResult,
        relatedDocuments,
        startTime: moment(this.formGroup.value.startTime).utc().toDate().toISOString(),
        endTime: this.formGroup.value.endTime ? moment(this.formGroup.value.endTime).utc().toDate().toISOString() : null,
      };

      CommonHelper.windowLog('newCommunicationRecord', newCommunicationRecord);

      if (this.formGroup.value.notes) {
        const note = new Note();
        note.id = 0;
        note.html = this.formGroup.value.notes;
        note.entityId = 0;
        note.entityTypeId = EntityTypeEnum.Communications;
        newCommunicationRecord.notes = [note];
        CommonHelper.windowLog('newCommunicationRecord.notes', newCommunicationRecord.notes);
      }

      CommonHelper.windowLog('newCommunicationRecord', newCommunicationRecord);
      return newCommunicationRecord;
    }

    CommonHelper.windowLog('getModel -> return null');
    return null;
  }

  protected get validationForm(): UntypedFormGroup {
    return this.formGroup;
  }

  public setEndTime(): void {
    this.formGroup.patchValue({ endTime: new Date() });
  }

  public setClaimantName(name: string): void {
    this.formGroup.patchValue({
      claimant: name,
      callerName: name,
    });
  }

  public onSubjectChange(id: number): void {
    const selectedOption: SelectOption = this.communicationSubjectList.find((subject: SelectOption) => subject.id === id);

    if (!selectedOption) {
      const { subject } = this.formGroup.controls;

      subject.setValue(null);
      subject.updateValueAndValidity();
    }

    this.isShowOtherSubjectField = selectedOption ? selectedOption.name === OTHER_OPTION_NAME : false;

    this.toggleRequiredValidator('otherSubject', this.isShowOtherResultField);
  }

  public onResultChange(id: number): void {
    const selectedOption: SelectOption = this.communicationResultList.find((result: SelectOption) => result.id === id);
    if (!selectedOption) {
      const { result } = this.formGroup.controls;

      result.setValue(null);
      result.updateValueAndValidity();
    }

    this.isShowOtherResultField = selectedOption ? selectedOption.name === OTHER_OPTION_NAME : false;

    this.toggleRequiredValidator('otherResult', this.isShowOtherResultField);
  }

  public onDirectionChange(): void {
    this.isShowOtherResultField = false;
    this.isShowOtherSubjectField = false;
  }

  private toggleRequiredValidator(controlName: string, condition: boolean): void {
    const control = this.formGroup.controls[controlName];
    if (condition) {
      control.setValidators(Validators.required);
      control.updateValueAndValidity();
    } else if (!condition && !this.communicationRecord?.[controlName]) {
      control.setValidators(null);
      control.updateValueAndValidity();
    }
  }

  ngOnDestroy(): void {
    this.store.dispatch(actions.ClearDropdownLists());

    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
