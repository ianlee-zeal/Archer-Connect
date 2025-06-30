import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { CommunicationRecord } from '@app/models/communication-center/communication-record';
import { DocumentType } from '@app/models/documents';
import { CommunicationMethodEnum, EntityTypeEnum } from '@app/models/enums';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { sharedActions } from '@app/modules/shared/state';
import * as fromShared from '@app/modules/shared/state/index';
import { DragAndDropService, ValidationService } from '@app/services';
import { EmailAttachmentService } from '@app/services/email-attachment.service';
import * as rootActions from '@app/state/root.actions';
import { Store } from '@ngrx/store';
import { DateValidator } from '@shared/_validators/date-validator';
import * as MsgReader from '@sharpenednoodles/msg.reader-ts';
import { Subject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, first, startWith, takeUntil } from 'rxjs/operators';
import { ClaimantsState } from '../../../claimants/state/reducer';
import * as communicationActions from '../state/actions';
import { SaveAttachedEmail } from '../state/actions';
import { communicationSelectors } from '../state/selectors';

const OTHER_OPTION_NAME = 'Other';

@Component({
  selector: 'app-communication-details',
  templateUrl: './communication-details.component.html',
  styleUrls: ['./communication-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CommunicationDetailsComponent extends ValidationForm implements OnInit, OnDestroy {
  @Input() communicationRecord: CommunicationRecord;
  @Input() canEdit: boolean;
  private ngUnsubscribe$ = new Subject<void>();

  // ngbDatepicker reset time value each time on date changed. This object will help to restore the time.
  private dateRange = {
    startDate: null,
    endDate: null,
  };

  public directionsSelector$ = this.store.select(communicationSelectors.communicationDirectionsOptions);
  public methodsSelector$ = this.store.select(communicationSelectors.communicationMethodsOptions);
  public communicationPartyListSelector$ = this.store.select(communicationSelectors.communicationPartiesOptions);
  public communicationResultListSelector$ = this.store.select(communicationSelectors.communicationResultsOptions);
  public communicationSubjectListSelector$ = this.store.select(communicationSelectors.communicationSubjectsOptions);
  public attachedEmails$ = this.store.select(communicationSelectors.attachedEmails);
  public documentTypes$ = this.store.select(fromShared.sharedSelectors.documentsListSelectors.documentTypes);
  public email$ = this.store.select(communicationSelectors.email);

  public formGroup: UntypedFormGroup;
  public isShowOtherSubjectField: boolean;
  public isShowOtherResultField: boolean;
  public documentTypes;

  public get hasAttachedEmail(): boolean {
    return this.formGroup.controls.method.value === CommunicationMethodEnum.Email;
  }

  public get showOtherSubjectField(): boolean {
    return this.formGroup.controls.subject.value === OTHER_OPTION_NAME;
  }

  public get showOtherResultField(): boolean {
    return this.formGroup.controls.result.value === OTHER_OPTION_NAME;
  }

  constructor(
    private store: Store<ClaimantsState>,
    private fb: UntypedFormBuilder,
    private dateValidator: DateValidator,
    private readonly dragAndDropService: DragAndDropService,
    private readonly emailAttachmentService: EmailAttachmentService,
  ) {
    super();

    this.formGroup = this.fb.group({
      callId: new UntypedFormControl(null, [Validators.required, Validators.min(1), ValidationService.onlyNumbersValidator, ValidationService.maxIntValidator]),
      callerName: new UntypedFormControl(null, [ValidationService.notEmptyValidator, Validators.maxLength(50)]),
      phoneNumber: new UntypedFormControl(null, [Validators.required, ValidationService.phoneNumberValidator]),
      direction: new UntypedFormControl(null, Validators.required),
      method: new UntypedFormControl(null, Validators.required),
      partyType: new UntypedFormControl('', Validators.required),
      subject: new UntypedFormControl('', [this.checkDirectionAndMethodValidator.bind(this), Validators.required]),
      otherSubject: new UntypedFormControl(''),
      result: new UntypedFormControl('', [this.checkDirectionAndMethodValidator.bind(this), Validators.required]),
      otherResult: new UntypedFormControl(''),
      notes: new UntypedFormControl(''),
      startDate: new UntypedFormControl(new Date(), this.startDateRangeValidator.bind(this)),
      endDate: new UntypedFormControl(null, this.endDateRangeValidator.bind(this)),
      updateNotes: new UntypedFormControl(''),
      emailSubject: new UntypedFormControl(null),
      emailFrom: new UntypedFormControl(null),
      emailTo: new UntypedFormControl(null),
      emailBody: new UntypedFormControl(null),
    });
  }

  public calculateMiddleColumnLabelWidth(): number {
    if (!this.isShowOtherSubjectField && !this.isShowOtherResultField) {
      return 98;
    }

    if (this.isShowOtherSubjectField) {
      return 140;
    }

    return 132;
  }

  public startDateRangeValidator(control: AbstractControl): {
    error: string;
  } | null {
    return !!this.formGroup && this.dateValidator.sameOrBefore(control, this.formGroup.value.endDate)
      ? { error: 'Start Date cannot be after End Date' }
      : null;
  }

  public endDateRangeValidator(control: AbstractControl): {
    error: string;
  } | null {
    return !!this.formGroup && this.dateValidator.sameOrAfter(control, this.formGroup.value.startDate)
      ? { error: 'End Date cannot be prior to Start Date' }
      : null;
  }

  public checkDirectionAndMethodValidator(): {
    error: string;
  } | null {
    return this.formGroup && this.formGroup.controls.direction.value && this.formGroup.controls.method.value
      ? null
      : { error: 'Select the direction and method of the communication first' };
  }

  ngOnInit(): void {
    this.store.dispatch(communicationActions.GetCommunicationDirectionListRequest());
    this.store.dispatch(communicationActions.GetCommunicationMethodListRequest());
    this.store.dispatch(communicationActions.GetCommunicationPartyTypeListRequest());
    this.store.dispatch(rootActions.GetStatuses({ entityType: EntityTypeEnum.ProjectCommunicationsBusinessImpact }));
    this.store.dispatch(sharedActions.documentsListActions.GetDocumentTypesByEntityId({ entityTypeId: EntityTypeEnum.Communications }));

    this.initSubjectDropdown();
    this.initResultDropdown();
    this.setFormValue();
    this.subscribeToAddedEmail();

    combineLatest([
      this.store.select(communicationSelectors.attachedEmails),
      this.store.select(communicationSelectors.communicationDirectionsOptions),
      this.store.select(communicationSelectors.communicationMethodsOptions),
    ]).pipe(
      filter(
        ([emails, directions, methods]:
        [communicationActions.IAttachedEmail[], SelectOption[], SelectOption[]]) => emails?.length > 0 && directions.length > 0 && methods.length > 0,
      ),
      distinctUntilChanged((a,b) => JSON.stringify(a) === JSON.stringify(b)),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(([emails,,]:[communicationActions.IAttachedEmail[], SelectOption[], SelectOption[]]) => {
      this.emailAttachmentService.subscribeToAttachedEmailMethod(this.formGroup, emails, this.communicationRecord?.id);
    });

    if (this.communicationRecord.id) {
      combineLatest([
        this.formGroup.get('direction').valueChanges.pipe(startWith(this.communicationRecord.direction.id)),
        this.formGroup.get('method').valueChanges.pipe(startWith(this.communicationRecord.method.id))])
        .pipe(
          debounceTime(200),
          distinctUntilChanged(),
          takeUntil(this.ngUnsubscribe$),
        )
        .subscribe(([direction, method]: [number, number]) => {
          this.getResultAndSubject(direction, method);
        });
    } else {
      combineLatest([
        this.formGroup.get('direction').valueChanges,
        this.formGroup.get('method').valueChanges])
        .pipe(
          debounceTime(200),
          distinctUntilChanged(),
          takeUntil(this.ngUnsubscribe$),
        )
        .subscribe(([direction, method]: [number, number]) => {
          this.getResultAndSubject(direction, method);
        });
    }

    this.setDateRange();

    this.documentTypes$
      .pipe(
        first((value: DocumentType[]) => !!value),
      )
      .subscribe((documentTypes: DocumentType[]) => { this.documentTypes = documentTypes; });

    this.formGroup.controls.callerName.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(() => {
        this.validateCallerNameControl();
      });

    this.subscribeToEmailAddedEvent('app-communication-details');
  }

  public setFormValue(): void {
    if (this.communicationRecord.id) {
      this.formGroup.patchValue({
        callId: this.communicationRecord.callId,
        phoneNumber: this.communicationRecord.phoneNumber,
        callerName: this.communicationRecord.callerName,
        direction: this.communicationRecord.direction?.id,
        method: this.communicationRecord.method?.id,
        partyType: this.communicationRecord.partyType?.id,
        subject: this.communicationRecord.subject?.id,
        otherSubject: this.communicationRecord.otherSubject,
        otherResult: this.communicationRecord.otherResults,
        result: this.communicationRecord.result?.id,
        notes: this.communicationRecord.notes,
        startDate: this.communicationRecord.startTime,
        endDate: this.communicationRecord.endTime,
        emailSubject: this.communicationRecord.emailSubject,
        emailTo: this.communicationRecord.emailTo,
        emailFrom: this.communicationRecord.emailFrom,
        emailBody: this.communicationRecord.emailBody,
      });
    }
  }

  public getResultAndSubject(direction: number, method: number): void {
    if (direction && method) {
      this.store.dispatch(communicationActions.GetCommunicationResultListRequest({ directionId: direction, methodId: method }));
      this.store.dispatch(communicationActions.GetCommunicationSubjectListRequest({ directionId: direction, methodId: method }));
    } else {
      this.store.dispatch(communicationActions.GetCommunicationResultListSuccess({ communicationResults: [] }));
      this.store.dispatch(communicationActions.GetCommunicationSubjectListSuccess({ communicationSubjects: [] }));
    }
  }

  markAsTouched(fields: string[]): void {
    if (!this.formGroup.controls.direction.value && !this.formGroup.controls.method.value) {
      fields.forEach((field: string) => this.formGroup.controls[field].markAsTouched());
    }
  }

  public get validationForm(): UntypedFormGroup {
    return this.formGroup;
  }

  public startDateChanged(): void {
    const date = this.formGroup.value.startDate as Date;

    if (!date) {
      return;
    }

    if (!this.dateRange.startDate) {
      this.dateRange.startDate = date;
    }

    if (date.valueOf() === this.dateRange.startDate.valueOf()) {
      return;
    }

    date.setHours(this.dateRange.startDate.getHours(), this.dateRange.startDate.getMinutes());

    this.dateRange.startDate = date;
    this.formGroup.patchValue({ startDate: date });
    this.formGroup.get('endDate').updateValueAndValidity();
  }

  public endDateChanged(): void {
    const date = this.formGroup.value.endDate as Date;

    if (!date) {
      return;
    }

    if (!this.dateRange.endDate) {
      this.dateRange.endDate = date;
      this.formGroup.patchValue({ endDate: date });
    }

    if (date.valueOf() === this.dateRange.endDate.valueOf()) {
      return;
    }

    date.setHours(this.dateRange.endDate.getHours(), this.dateRange.endDate.getMinutes());

    this.dateRange.endDate = date;
    this.formGroup.patchValue({ endDate: date });
    this.formGroup.get('startDate').updateValueAndValidity();
  }

  public timeRangeChanged(): void {
    this.dateRange.startDate = this.formGroup.value.startDate;
    this.dateRange.endDate = this.formGroup.value.endDate;

    this.formGroup.get('startDate').updateValueAndValidity();
    this.formGroup.get('endDate').updateValueAndValidity();
  }

  // Reset form to initial values
  public resetForm(): void {
    this.formGroup.reset();
    this.formGroup.controls.startDate.setValue(new Date());
    this.formGroup.markAsPristine();
    this.validationForm.markAsPristine();
  }

  public validate(): boolean {
    this.validateCallerNameControl();
    return super.validate();
  }

  private setDateRange(): void {
    this.startDateChanged();
    this.endDateChanged();
  }

  private initSubjectDropdown(): void {
    combineLatest([
      this.formGroup.controls.subject.valueChanges,
      this.communicationSubjectListSelector$,
    ]).pipe(
      filter(([, communicationSubjectList]: [number, SelectOption[]]) => communicationSubjectList?.length > 0),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(([subjectFormValueId, communicationSubjectList]: [number, SelectOption[]]) => {
      const selectedOption = communicationSubjectList.find((subject: SelectOption) => subject.id === +subjectFormValueId);
      const { subject } = this.formGroup.controls;

      if (!selectedOption) {
        subject.setValue(null, { emitEvent: false });
        subject.updateValueAndValidity({ emitEvent: false });
      } else {
        subject.setValue(subjectFormValueId, { emitEvent: false });
      }
      this.isShowOtherSubjectField = selectedOption ? selectedOption.name === OTHER_OPTION_NAME : false;
      this.toggleRequiredValidator('otherSubject', this.isShowOtherSubjectField);
    });
  }

  private initResultDropdown(): void {
    combineLatest(
      [this.formGroup.controls.result.valueChanges,
        this.communicationResultListSelector$],
    ).pipe(
      filter(([, communicationResultList]: [number, SelectOption[]]) => communicationResultList?.length > 0),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(([resultFormValueId, communicationResultList]: [number, SelectOption[]]) => {
      const selectedOption = communicationResultList.find((result: SelectOption) => result.id === +resultFormValueId);
      const { result } = this.formGroup.controls;

      if (!selectedOption) {
        result.setValue(null, { emitEvent: false });
        result.updateValueAndValidity({ emitEvent: false });
      } else {
        result.setValue(resultFormValueId, { emitEvent: false });
      }

      this.isShowOtherResultField = selectedOption ? selectedOption.name === OTHER_OPTION_NAME : false;
      this.toggleRequiredValidator('otherResult', this.isShowOtherResultField);
    });
  }

  private toggleRequiredValidator(controlName: string, condition: boolean): void {
    const control = this.formGroup.controls[controlName];
    if (condition) {
      control.setValidators(Validators.required);
      control.updateValueAndValidity();
    } else {
      control.setValue(null);
      control.setValidators(null);
      control.updateValueAndValidity();
    }
  }

  private validateCallerNameControl(): void {
    const callerNameControl = this.formGroup.controls.callerName;

    if (!callerNameControl.value) {
      callerNameControl.setErrors({ required: true });
    }
  }

  public hideFieldsDisplayedByCondition(): void {
    this.isShowOtherSubjectField = false;
    this.isShowOtherResultField = false;

    this.toggleRequiredValidator('otherSubject', this.isShowOtherSubjectField);
    this.toggleRequiredValidator('otherResult', this.isShowOtherResultField);
  }

  private subscribeToEmailAddedEvent(componentSelector: string): void {
    this.dragAndDropService.subscribeToDragAndDropEvents(
      componentSelector,
      (error: string) => this.store.dispatch(rootActions.Error({ error })),
      (
        file: File,
        data: MsgReader.MSGFileData,
        attachments: MsgReader.MSGAttachmentData[],
      ) => {
        this.store.dispatch(SaveAttachedEmail({ attachedEmail: { file, outlookData: data, attachments } }));
      },
    );
  }

  private subscribeToAddedEmail(): void {
    this.email$
      .pipe(
        filter((email: File) => !!email),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(async (email: File) => {
        await this.emailAttachmentService.patchEmailValues(email, this.formGroup);
        this.store.dispatch(communicationActions.ClearEmail());
      });
  }

  ngOnDestroy(): void {
    this.store.dispatch(communicationActions.ClearDropdownLists());
    this.store.dispatch(communicationActions.ClearEmail());
    this.store.dispatch(communicationActions.ClearAttachedEmail());

    this.emailAttachmentService.ngOnDestroy();

    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
