import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';

import { Router } from '@angular/router';
import { SatisfactionRatingHelper } from '@app/helpers/satisfaction-rating-helper.helper';
import { SelectHelper } from '@app/helpers/select.helper';
import { UrlHelper } from '@app/helpers/url-helper';
import { IdValue, Org } from '@app/models';
import { ProjectCommunicationRecord } from '@app/models/communication-center/project-communication-record';
import { CommunicationDirectionEnum, CommunicationMethodEnum, EntityTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { CommunicationEscalationStatusEnum } from '@app/models/enums/communication-escalation-status.enum';
import { CommunicationLevelEnum } from '@app/models/enums/communication-level.enum';
import { CommunicationSentimentEnum } from '@app/models/enums/communication-sentiment.enum';
import { ProjectContactReference } from '@app/models/project-contact-reference';
import * as projectActions from '@app/modules/projects/state/actions';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { OrganizationSelectionModalComponent } from '@app/modules/shared/entity-selection-modal/organization-selection-modal.component';
import * as actions from '@app/modules/shared/state/entity-selection-modal/actions';
import * as fromShared from '@app/modules/shared/state/index';
import { DragAndDropService, ModalService, PermissionService } from '@app/services';
import { EmailAttachmentService } from '@app/services/email-attachment.service';
import * as rootSelectors from '@app/state/index';
import * as rootActions from '@app/state/root.actions';
import { DateValidator } from '@shared/_validators/date-validator';
import * as MsgReader from '@sharpenednoodles/msg.reader-ts';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { Subject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, first, startWith, takeUntil } from 'rxjs/operators';
import { CommonHelper } from '../../../../helpers/common.helper';
import { ClaimantsState } from '../../../claimants/state/reducer';
import * as communicationActions from '../../communication/state/actions';
import { SaveAttachedEmail } from '../../communication/state/actions';
import { communicationSelectors } from '../../communication/state/selectors';

const { sharedActions } = fromShared;

const OTHER_OPTION_NAME = 'Other';

@Component({
  selector: 'app-projects-communication-details',
  templateUrl: './projects-communication-details.component.html',
  styleUrls: ['./projects-communication-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProjectsCommunicationDetailsComponent extends ValidationForm implements OnInit, OnDestroy, OnChanges {
  @Input() projectCommunicationRecord: ProjectCommunicationRecord;
  @Input() canEdit: boolean;
  private ngUnsubscribe$ = new Subject<void>();

  // ngbDatepicker reset time value each time on date changed. This object will help to restore the time.
  private dateRange = {
    startDate: null,
    endDate: null,
  };

  public parentId;
  public communicationContactsOptions: IdValue[];
  public communicationContacts: ProjectContactReference[];
  public documentTypes;

  public directionsSelector$ = this.store.select(communicationSelectors.communicationDirectionsOptions);
  public methodsSelector$ = this.store.select(communicationSelectors.communicationMethodsOptions);
  public communicationPartyListSelector$ = this.store.select(communicationSelectors.communicationPartiesOptions);
  public communicationResultListSelector$ = this.store.select(communicationSelectors.communicationResultsOptions);
  public communicationSubjectListSelector$ = this.store.select(communicationSelectors.communicationSubjectsOptions);
  public communicationLevelsOptions$ = this.store.select(communicationSelectors.communicationLevelsOptions);
  public communicationSentimentsOptions$ = this.store.select(communicationSelectors.communicationSentimentsOptions);
  public communicationContactsOptions$ = this.store.select(communicationSelectors.communicationContactsOptions);
  public attachedEmails$ = this.store.select(communicationSelectors.attachedEmails);
  public email$ = this.store.select(communicationSelectors.email);
  public documentTypes$ = this.store.select(fromShared.sharedSelectors.documentsListSelectors.documentTypes);
  readonly businessImpactStatuses$ = this.store.select<IdValue[]>(rootSelectors.statusesByEntityType({ entityType: EntityTypeEnum.ProjectCommunicationsBusinessImpact }));
  public escalationStatusDropdownValues: SelectOption[] = SelectHelper.enumToOptions(CommunicationEscalationStatusEnum, (option: SelectOption) => option.id, (option: SelectOption) => option.name);
  public satisfactionRatingList = SatisfactionRatingHelper.getSatisfactionRatingList();
  public satisfactionRating: SelectOption | null;

  public formGroup: UntypedFormGroup;
  public isShowOtherSubjectField: boolean;
  public isShowOtherResultField: boolean;
  public isShowPartyNameField: boolean;
  public isShowPartyTypeField: boolean;
  public isShowPartyTypeSelect: boolean;
  public isOtherResultIsOptional: boolean;
  public disableOrganizationField: boolean;

  public subscriptionToEmailAddedEvent;

  public canReadSatisfactionRating = this.permissionService.canRead(PermissionTypeEnum.OrganizationRating);

  public get projectContactName(): string {
    return this.projectCommunicationRecord?.projectContact
      ? this.communicationContactsOptions?.find((contact: IdValue) => this.projectCommunicationRecord?.projectContact.id === contact.id)?.name
      : OTHER_OPTION_NAME;
  }

  public get projectContactReference(): ProjectContactReference {
    return this.communicationContacts?.find((contact: ProjectContactReference) => contact.projectContact.id === this.projectCommunicationRecord.projectContact?.id);
  }

  public get isShowOrganizationField(): boolean {
    return this.communicationContactsOptions?.some((contact: IdValue) => contact.id === this.formGroup.controls.projectContact.value);
  }

  public get hasAttachedEmail(): boolean {
    return this.formGroup.controls.method.value === CommunicationMethodEnum.Email;
  }

  constructor(
    private readonly store: Store<ClaimantsState>,
    private readonly fb: UntypedFormBuilder,
    private readonly router: Router,
    private readonly dateValidator: DateValidator,
    private readonly permissionService: PermissionService,
    private readonly modalService: ModalService,
    private readonly dragAndDropService: DragAndDropService,
    private readonly emailAttachmentService: EmailAttachmentService,

  ) {
    super();

    this.formGroup = this.fb.group({
      projectContact: new UntypedFormControl(null, Validators.required),
      callerName: new UntypedFormControl(null, Validators.maxLength(255)),
      direction: new UntypedFormControl(null, Validators.required),
      method: new UntypedFormControl(null, Validators.required),
      level: new UntypedFormControl(null, Validators.required),
      sentiment: new UntypedFormControl({ value: CommunicationSentimentEnum.Neutral, disabled: false }, Validators.required),
      partyType: new UntypedFormControl(null),
      subject: new UntypedFormControl('', this.getSubjectAndResultValidator.bind(this)),
      otherSubject: new UntypedFormControl(''),
      result: new UntypedFormControl('', this.getSubjectAndResultValidator.bind(this)),
      otherResults: new UntypedFormControl(''),
      notes: new UntypedFormControl(''),
      startDate: new UntypedFormControl(new Date(), this.startDateRangeValidator.bind(this)),
      endDate: new UntypedFormControl(null, this.endDateRangeValidator.bind(this)),
      businessImpactId: new UntypedFormControl(null),
      escalationStatusId: new UntypedFormControl(null),
      resolutionDate: new UntypedFormControl(new Date()),
      resolutionSummary: new UntypedFormControl(null),
      operationRootCause: new UntypedFormControl(null),
      rootCauseCategory: new UntypedFormControl(null),
      csTrainingNeeds: new UntypedFormControl(null),
      csTrainingNeedsCategory: new UntypedFormControl(null),
      csAgentNextActionTracker: new UntypedFormControl(null),
      primaryDepartmentResponsibleForFixing: new UntypedFormControl(null),
      secondaryDepartmentResponsible: new UntypedFormControl(null),
      updateNotes: new UntypedFormControl(''),
      organization: new UntypedFormControl(null, Validators.required),
      organizationId: new UntypedFormControl(null),
      satisfactionRating: new UntypedFormControl(null),
      emailSubject: new UntypedFormControl(null),
      emailFrom: new UntypedFormControl(null),
      emailTo: new UntypedFormControl(null),
      emailBody: new UntypedFormControl(null),
    });
  }

  public calculateMiddleColumnLabelWidth(): number {
    if (!this.isShowOtherSubjectField && !this.isShowOtherResultField) {
      return 200;
    }

    if (this.isShowOtherSubjectField) {
      return 230;
    }

    return 223;
  }

  public startDateRangeValidator(control: AbstractControl): { error: string } {
    return !!this.formGroup && this.dateValidator.sameOrBefore(control, this.formGroup.value.endDate)
      ? { error: 'Start Date cannot be after End Date' }
      : null;
  }

  public endDateRangeValidator(control: AbstractControl): { error: string } {
    return !!this.formGroup && this.dateValidator.sameOrAfter(control, this.formGroup.value.startDate)
      ? { error: 'End Date cannot be prior to Start Date' }
      : null;
  }

  public checkDirectionAndMethodValidator(): { error: string } {
    return this.formGroup && this.formGroup.controls.direction.value && this.formGroup.controls.method.value
      ? null
      : { error: 'Select the direction and method of the communication first' };
  }

  public getSubjectAndResultValidator(): { error: string } {
    return this.formGroup && !this.hasAttachedEmail
      ? this.checkDirectionAndMethodValidator()
      : null;
  }

  ngOnInit(): void {
    this.parentId = +UrlHelper.getParent(this.router.url, '/overview');

    this.store.dispatch(sharedActions.documentsListActions.GetDocumentTypesByEntityId({ entityTypeId: EntityTypeEnum.Communications }));

    this.store.dispatch(communicationActions.GetCommunicationDirectionListRequest());
    this.store.dispatch(communicationActions.GetCommunicationMethodListRequest());
    this.store.dispatch(communicationActions.GetCommunicationPartyTypeListRequest());
    this.store.dispatch(communicationActions.GetCommunicationLevelsRequest());
    this.store.dispatch(communicationActions.GetCommunicationSentimentsRequest());
    this.store.dispatch(communicationActions.GetContactsList({ projectId: this.parentId }));
    this.store.dispatch(rootActions.GetStatuses({ entityType: EntityTypeEnum.ProjectCommunicationsBusinessImpact }));

    this.initSubjectDropdown();
    this.initResultDropdown();
    this.initProjectContactDropdowns();

    this.formGroup.get('level').valueChanges.subscribe(value => {
      if (value === CommunicationLevelEnum.Standard) {
        this.formGroup.controls.sentiment.setValue(CommunicationSentimentEnum.Neutral);
      }
    });

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
      this.emailAttachmentService.subscribeToAttachedEmailMethod(this.formGroup, emails, this.projectCommunicationRecord?.id);
    });

    let clearValues: boolean = false;

    this.formGroup.controls.method.valueChanges.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(value => {
      if (value === CommunicationMethodEnum.Email) {
        this.formGroup.controls.subject.clearValidators();
        this.formGroup.controls.subject.updateValueAndValidity();
      } else {
        this.formGroup.controls.subject.setValidators([this.checkDirectionAndMethodValidator.bind(this), Validators.required]);
      }
      this.formGroup.updateValueAndValidity();
    });

    if (this.projectCommunicationRecord?.id) {
      combineLatest([
        this.formGroup.get('direction').valueChanges.pipe(startWith(this.projectCommunicationRecord.direction.id)),
        this.formGroup.get('method').valueChanges.pipe(startWith(this.projectCommunicationRecord.method.id))])
        .pipe(
          debounceTime(200),
          distinctUntilChanged(),
          takeUntil(this.ngUnsubscribe$),
        )
        .subscribe(([direction, method]) => {
          this.getResultAndSubject(direction, method, clearValues);
          clearValues = true;
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
        .subscribe(([direction, method]) => {
          this.getResultAndSubject(direction, method, clearValues);
          clearValues = true;
        });
    }

    this.setDateRange();

    this.documentTypes$
      .pipe(
        first(value => !!value),
      )
      .subscribe(documentTypes => { this.documentTypes = documentTypes; });

    this.communicationContactsOptions$
      .pipe(
        filter(contacts => !!contacts),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(contacts => {
        this.communicationContacts = contacts;

        this.communicationContactsOptions = contacts.map(contact => new IdValue(contact.projectContact.id, contact.projectContact.displayName));
        this.communicationContactsOptions.push({ id: 0, name: 'Other' });

        if (this.projectCommunicationRecord?.id) {
          this.formGroup.controls.projectContact.setValue(this.projectCommunicationRecord?.projectContact?.id || 0);
          this.formGroup.controls.projectContact.markAsPristine();
        }
      });

    const escalationDetailsRequiredFields = ['escalationStatusId', 'businessImpactId'];

    if (this.projectCommunicationRecord?.level?.id === CommunicationLevelEnum.Escalation) {
      escalationDetailsRequiredFields.forEach(field => {
        this.formGroup.get(field).setValidators(Validators.required);
        this.formGroup.get(field).updateValueAndValidity();
      });

      if (this.projectCommunicationRecord.escalationStatus?.id === CommunicationEscalationStatusEnum.Resolved) {
        this.formGroup.get('resolutionDate').setValidators(Validators.required);
        this.formGroup.get('resolutionDate').updateValueAndValidity();
        this.formGroup.get('resolutionSummary').setValidators(Validators.required);
        this.formGroup.get('resolutionSummary').updateValueAndValidity();
      }
    }

    this.formGroup.get('level').valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(value => {
        if (value === CommunicationLevelEnum.Escalation) {
          escalationDetailsRequiredFields.forEach(field => {
            this.formGroup.get(field).setValidators(Validators.required);
            this.formGroup.get(field).updateValueAndValidity();
          });
          if (!this.projectCommunicationRecord?.id) {
            this.formGroup.get('escalationStatusId').patchValue(CommunicationEscalationStatusEnum.Active);
          }
        } else {
          escalationDetailsRequiredFields.forEach(field => {
            this.formGroup.get(field).removeValidators(Validators.required);
            this.formGroup.get(field).updateValueAndValidity();
          });
          if (!this.projectCommunicationRecord?.id) {
            this.formGroup.get('escalationStatusId').patchValue(null);
          }
        }
      });

    this.formGroup.get('escalationStatusId').valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(value => {
        if (value === CommunicationEscalationStatusEnum.Resolved) {
          this.formGroup.get('resolutionDate').setValidators(Validators.required);
          this.formGroup.get('resolutionDate').updateValueAndValidity();
          this.formGroup.get('resolutionSummary').setValidators(Validators.required);
          this.formGroup.get('resolutionSummary').updateValueAndValidity();
        } else {
          this.formGroup.get('resolutionDate').removeValidators(Validators.required);
          this.formGroup.get('resolutionDate').updateValueAndValidity();
          this.formGroup.get('resolutionSummary').removeValidators(Validators.required);
          this.formGroup.get('resolutionSummary').updateValueAndValidity();
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.canEdit) {
      if (this.canEdit) {
        setTimeout(() => {
          if (this.projectCommunicationRecord?.id) {
            this.subscribeToEmailAddedEvent('app-communication-view-edit-page');
          } else {
            this.subscribeToEmailAddedEvent('app-communication-view-create-page');
          }
        });
      }

      setTimeout(() => {
        this.toggleRequiredValidatorForResult();
        this.isShowOtherResultField = !!this.projectCommunicationRecord?.otherResults;
      });
    }

    if (this.canEdit && this.projectCommunicationRecord?.id) {
      this.onOrgSelect(this.projectCommunicationRecord.org);
      this.setProjectContactRelatedFields(this.projectCommunicationRecord.projectContact?.id, true);
    }
  }

  public setFormValue(): void {
    if (this.projectCommunicationRecord?.id) {
      this.formGroup.patchValue({
        callerName: this.projectCommunicationRecord.callerName,
        direction: this.projectCommunicationRecord.direction?.id,
        method: this.projectCommunicationRecord.method?.id,
        level: this.projectCommunicationRecord.level?.id,
        sentiment: this.projectCommunicationRecord.sentiment?.id,
        subject: this.projectCommunicationRecord.subject?.id,
        otherSubject: this.projectCommunicationRecord.otherSubject,
        otherResults: this.projectCommunicationRecord.otherResults,
        result: this.projectCommunicationRecord.result?.id,
        notes: this.projectCommunicationRecord.notes,
        startDate: this.projectCommunicationRecord.startTime,
        endDate: this.projectCommunicationRecord.endTime,
        businessImpactId: this.projectCommunicationRecord.businessImpactId,
        escalationStatusId: this.projectCommunicationRecord.escalationStatus?.id || CommunicationEscalationStatusEnum.Active,
        resolutionDate: this.projectCommunicationRecord.resolutionDate || new Date(),
        resolutionSummary: this.projectCommunicationRecord.resolutionSummary,
        operationRootCause: this.projectCommunicationRecord.operationRootCause,
        rootCauseCategory: this.projectCommunicationRecord.rootCauseCategory,
        csTrainingNeeds: this.projectCommunicationRecord.csTrainingNeeds,
        csTrainingNeedsCategory: this.projectCommunicationRecord.csTrainingNeedsCategory,
        csAgentNextActionTracker: this.projectCommunicationRecord.csAgentNextActionTracker,
        primaryDepartmentResponsibleForFixing: this.projectCommunicationRecord.primaryDepartmentResponsibleForFixing,
        secondaryDepartmentResponsible: this.projectCommunicationRecord.secondaryDepartmentResponsible,
        organizationId: this.projectCommunicationRecord.org?.id,
        organization: this.projectCommunicationRecord.org?.name,
        satisfactionRating: this.projectCommunicationRecord.org?.satisfactionRating?.name,
        emailBody: this.projectCommunicationRecord.emailBody,
        emailTo: this.projectCommunicationRecord.emailTo,
        emailFrom: this.projectCommunicationRecord.emailFrom,
        emailSubject: this.projectCommunicationRecord.emailSubject,
      });
    }
  }

  private setProjectContactRelatedFields(projectContactId: number, initProjectContactRelatedFields = false): void {
    const projectContactReference: ProjectContactReference = this.communicationContacts?.find(contact => contact.projectContact.id === projectContactId);
    this.isShowPartyTypeSelect = !projectContactReference;

    if (projectContactReference || initProjectContactRelatedFields) {
      this.formGroup.patchValue({
        callerName: projectContactReference ? projectContactReference.projectContact.displayName : this.projectCommunicationRecord.callerName,
        partyType: projectContactReference ? projectContactReference.contactRole?.name : this.projectCommunicationRecord.partyType.id,
      });
    }

    if (projectContactReference) {
      this.formGroup.controls.callerName.disable();
      this.formGroup.controls.partyType.disable();
    } else {
      this.formGroup.controls.callerName.enable();
      this.formGroup.controls.partyType.enable();
    }

    this.formGroup.updateValueAndValidity();
    this.formGroup.markAsDirty();
  }

  public getResultAndSubject(direction: number, method: number, clearValues: boolean): void {
    if (direction && method) {
      this.store.dispatch(communicationActions.GetCommunicationResultListRequest({ directionId: direction, methodId: method }));
      this.store.dispatch(communicationActions.GetCommunicationSubjectListRequest({ directionId: direction, methodId: method }));
    } else {
      this.store.dispatch(communicationActions.GetCommunicationResultListSuccess({ communicationResults: [] }));
      this.store.dispatch(communicationActions.GetCommunicationSubjectListSuccess({ communicationSubjects: [] }));
    }

    this.isOtherResultIsOptional = direction === CommunicationDirectionEnum.Incoming || this.hasAttachedEmail;
    this.toggleRequiredValidator('result', !this.isOtherResultIsOptional, clearValues);
    this.toggleRequiredValidator('otherResults', !this.isOtherResultIsOptional, clearValues);
  }

  markAsTouched(fields: string[]): void {
    if (!this.formGroup.controls.direction.value && !this.formGroup.controls.method.value) {
      fields.forEach(field => this.formGroup.controls[field].markAsTouched());
    }
  }

  public get validationForm(): UntypedFormGroup {
    return this.formGroup;
  }

  public get escalationDetailsEnabledEditView(): boolean {
    return this.formGroup.get('level').value === CommunicationLevelEnum.Escalation;
  }

  public get escalationDetailsEnabledReadView(): boolean {
    return this.projectCommunicationRecord.level?.id === CommunicationLevelEnum.Escalation;
  }

  public get isEscalationStatusResolvedEditView(): boolean {
    return this.formGroup.get('escalationStatusId').value === CommunicationEscalationStatusEnum.Resolved;
  }

  public get isEscalationStatusResolvedReadView(): boolean {
    return this.projectCommunicationRecord.escalationStatus?.id === CommunicationEscalationStatusEnum.Resolved;
  }

  filterFromSelectOptions(options: SelectOption[], id: number): SelectOption {
    if (!!options && options.length > 0) {
      const selectedOptions = options?.filter(i => i.id === id);
      const option: SelectOption = selectedOptions.length > 0 ? selectedOptions[0] : null;
      return option;
    }
    return null;
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
    return super.validate();
  }

  private setDateRange(): void {
    this.startDateChanged();
    this.endDateChanged();
  }

  private initSubjectDropdown(): void {
    combineLatest(
      this.formGroup.controls.subject.valueChanges,
      this.communicationSubjectListSelector$,
    ).pipe(
      filter(([, communicationSubjectList]) => communicationSubjectList?.length > 0),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(([subjectFormValueId, communicationSubjectList]) => {
      const selectedOption = communicationSubjectList.find(subject => subject.id === +subjectFormValueId);

      const { subject } = this.formGroup.controls;

      if (!selectedOption) {
        subject.setValue(null, { emitEvent: false });
        subject.updateValueAndValidity({ emitEvent: false });
      } else {
        subject.setValue(subjectFormValueId, { emitEvent: false });
      }

      this.isShowOtherSubjectField = selectedOption ? selectedOption.name === OTHER_OPTION_NAME && !this.hasAttachedEmail : false;
      this.toggleRequiredValidator('otherSubject', this.isShowOtherSubjectField);
    });
  }

  private initResultDropdown(): void {
    combineLatest([
      this.formGroup.controls.result.valueChanges,
      this.communicationResultListSelector$,
    ]).pipe(
      filter(([, communicationResultList]) => communicationResultList?.length > 0),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(([resultFormValueId, communicationResultList]) => {
      const selectedOption = communicationResultList?.find(result => result.id === +resultFormValueId);
      const { result } = this.formGroup.controls;
      const valueWasChanged = result.value !== resultFormValueId;

      if (!selectedOption) {
        result.setValue(null, { emitEvent: false });
        result.updateValueAndValidity({ emitEvent: false });
      } else {
        result.setValue(resultFormValueId, { emitEvent: false });
      }
      this.isShowOtherResultField = selectedOption ? selectedOption.name === OTHER_OPTION_NAME : false;
      this.toggleRequiredValidator('otherResults', this.isShowOtherResultField && !this.isOtherResultIsOptional, valueWasChanged);
    });
  }

  private initProjectContactDropdowns(): void {
    this.formGroup.controls.projectContact.valueChanges.pipe(
      filter(value => !CommonHelper.isNullOrUndefined(value)),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(value => {
      const selectedOption = this.communicationContactsOptions?.find(result => result.id === +value);
      const projectContact = this.communicationContacts.find(contact => contact.projectContact.id === selectedOption?.id)?.projectContact;
      let organization: Org = projectContact?.organizationResponse;
      const { result } = this.formGroup.controls;

      if (value && !selectedOption) {
        result.setValue(null);
        result.updateValueAndValidity();
      }

      this.isShowPartyNameField = !!selectedOption;
      this.isShowPartyTypeField = !!selectedOption;
      this.isShowPartyTypeSelect = selectedOption?.name === OTHER_OPTION_NAME;

      if (!this.isShowPartyNameField) {
        this.formGroup.controls.callerName.setValue('');
      }

      if (!organization) {
        organization = this.projectCommunicationRecord?.org;
      }

      if (selectedOption?.name !== OTHER_OPTION_NAME && organization) {
        this.onOrgSelect(organization);
        this.disableOrganizationField = true;
      } else {
        this.disableOrganizationField = false;
        this.onClear();
      }

      this.setProjectContactRelatedFields(projectContact?.id);

      this.toggleRequiredValidator('callerName', this.isShowPartyNameField);
      this.toggleRequiredValidator('partyType', this.isShowPartyTypeField);
    });
  }

  private toggleRequiredValidator(controlName: string, condition: boolean, clearValue = true): void {
    const control = this.formGroup.controls[controlName];
    if (condition) {
      control.setValidators(Validators.required);
      control.updateValueAndValidity();
      if (controlName === 'callerName') {
        control.setValidators([Validators.required, Validators.maxLength(255)]);
        control.updateValueAndValidity();
      }
    } else {
      if (clearValue) {
        control.setValue(null);
      }
      control.setValidators(null);
      control.updateValueAndValidity();
    }
  }

  onResultCleared(): void {
    this.toggleRequiredValidatorForResult();
  }

  public hideFieldsDisplayedByCondition(): void {
    this.isShowOtherSubjectField = !!this.projectCommunicationRecord?.otherSubject;
    this.isShowOtherResultField = !!this.projectCommunicationRecord?.otherResults;
    this.isShowPartyNameField = !!this.projectCommunicationRecord?.projectContact?.id;
    this.isShowPartyTypeField = !!this.projectCommunicationRecord?.projectContact?.id;

    this.toggleRequiredValidator('otherSubject', this.isShowOtherSubjectField);
    this.toggleRequiredValidator('otherResults', this.isShowOtherResultField);
    this.toggleRequiredValidator('callerName', this.isShowPartyNameField);
    this.toggleRequiredValidator('partyType', this.isShowPartyTypeField);
  }

  public onOpenQSFAdminModal(): void {
    if (this.disableOrganizationField) {
      return;
    }

    this.modalService.show(OrganizationSelectionModalComponent, {
      initialState: {
        onEntitySelected: (org: Org) => this.onOrgSelect(org),
        gridDataFetcher: (params: IServerSideGetRowsParamsExtended) => this.store.dispatch(actions.SearchOrganizations({ params })),
      },
      class: 'entity-selection-modal',
    });
  }

  public onClear(): void {
    if (this.disableOrganizationField) {
      return;
    }

    this.formGroup.patchValue({ organization: null, organizationId: null, callerName: null, partyType: null });
    this.formGroup.updateValueAndValidity();
    this.formGroup.controls.callerName.enable();
    this.formGroup.controls.partyType.enable();
    this.formGroup.markAsDirty();
    this.satisfactionRating = null;
  }

  private onOrgSelect(org: Org): void {
    this.formGroup.patchValue({
      organization: org?.name,
      organizationId: org?.id,
      satisfactionRating: org?.satisfactionRating?.name,
    });
    this.satisfactionRating = this.satisfactionRatingList.find(rating => rating.id === org?.satisfactionRating?.id);
    this.formGroup.controls.satisfactionRating.disable();
    this.formGroup.updateValueAndValidity();
    this.formGroup.markAsDirty();
  }

  private toggleRequiredValidatorForResult(): void {
    const valueWasChanged = this.formGroup?.get('result')?.value !== this.projectCommunicationRecord?.result?.id;
    this.toggleRequiredValidator('result', !this.isOtherResultIsOptional, valueWasChanged);
  }

  private subscribeToAddedEmail(): void {
    this.email$
      .pipe(
        filter(email => !!email),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(async (email: File) => {
        await this.emailAttachmentService.patchEmailValues(email, this.formGroup);
        this.store.dispatch(communicationActions.ClearAttachedEmail());
      }
      );
  }

  private subscribeToEmailAddedEvent(componentSelector: string): void {
    this.subscriptionToEmailAddedEvent = this.dragAndDropService.subscribeToDragAndDropEvents(
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

  ngOnDestroy(): void {
    this.store.dispatch(communicationActions.ClearDropdownLists());
    this.store.dispatch(communicationActions.ClearEmail());
    this.store.dispatch(communicationActions.ClearAttachedEmail());
    this.store.dispatch(projectActions.UpdateContextBar({ contextBar: null }));

    this.emailAttachmentService.ngOnDestroy();

    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
