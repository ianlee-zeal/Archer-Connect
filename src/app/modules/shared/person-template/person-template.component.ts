/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-extraneous-dependencies */
import { Component, OnInit, Input } from '@angular/core';
import { Validators, UntypedFormGroup, UntypedFormControl, AbstractControl } from '@angular/forms';
import { Store, ActionsSubject } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { Org, Person } from '@app/models';
import { DateValidator } from '@shared/_validators/date-validator';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { DropdownHelper } from '@app/helpers/dropdown.helper';
import { ModalService, PermissionService, ServerErrorService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import * as fromRoot from '@app/state';
import isEqual from 'lodash/isEqual';
import isString from 'lodash-es/isString';
import { ValidationService } from '@app/services/validation.service';
import { ofType } from '@ngrx/effects';
import * as personActions from '@app/modules/dashboard/persons/state/actions';
import { OrganizationSelectionModalComponent } from '@app/modules/shared/entity-selection-modal/organization-selection-modal.component';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import * as entitySelectionActions from '@app/modules/shared/state/entity-selection-modal/actions';
import { SsnPipe } from '../_pipes';
import { personGeneralInfoSelectors } from '../state/person-general-info/selectors';
import * as actions from '../state/person-general-info/actions';

@Component({
  selector: 'app-person-template',
  templateUrl: './person-template.component.html',
  styleUrls: ['./person-template.component.scss'],
})
export class PersonTemplateComponent extends ValidationForm implements OnInit {
  protected _person: Person;

  public isSsnLoaded: boolean = false;
  public isOtherIdentifierLoaded: boolean = false;

  public todaysDate: Date = new Date();

  public ssnReadPermissions = PermissionService.create(PermissionTypeEnum.PersonSSN, PermissionActionTypeEnum.Read);
  public ssnEditPermissions = [
    PermissionService.create(PermissionTypeEnum.PersonSSN, PermissionActionTypeEnum.Read),
    PermissionService.create(PermissionTypeEnum.PersonSSN, PermissionActionTypeEnum.Edit),
  ];

  @Input() public editingSSN: boolean = false;
  @Input() isProbateContact = false;

  @Input() public set person(value: Person) {
    if (isEqual(value, this._person)) {
      return;
    }

    this._person = value;
    this.seedPersonInfo(value);
  }

  @Input() public canEdit: boolean = true;

  public get person(): Person {
    const { value } = this.form;
    return <Person>{
      ...value,
      id: this._person && this._person.id,
      fullName: `${value.firstName || ''} ${value.lastName || ''}`,
      orgId: value.organizationId,
    };
  }

  public get validationForm(): UntypedFormGroup {
    return this.form;
  }

  private dobValidator = (control: AbstractControl) => (!!this.form && this.dateValidator.sameOrBefore(control, this.form.value.dateOfDeath)
    ? { error: 'Date of Birth cannot be greater than Date of Death' }
    : null);

  private dodValidator = (control: AbstractControl) => (!!this.form && this.dateValidator.sameOrAfter(control, this.form.value.dateOfBirth)
    ? { error: 'Date of Death cannot be less than Date of Birth' }
    : null);

  public form: UntypedFormGroup = new UntypedFormGroup({
    firstName: new UntypedFormControl('', Validators.required),
    middleName: new UntypedFormControl('', ValidationService.onlyAlphabetics),
    lastName: new UntypedFormControl('', Validators.required),
    prefix: new UntypedFormControl(''),
    suffix: new UntypedFormControl(''),
    ssn: new UntypedFormControl(''),
    otherIdentifier: new UntypedFormControl(''),
    dateOfBirth: new UntypedFormControl(null, [this.dateValidator.valid, this.dateValidator.notFutureDate, this.dobValidator]),
    dateOfDeath: new UntypedFormControl(null, [this.dateValidator.valid, this.dateValidator.notFutureDate, this.dodValidator]),
    gender: new UntypedFormControl(null),
    maritalStatus: new UntypedFormControl(null),
    attentionTo: new UntypedFormControl(''),
    organizationName: new UntypedFormControl(null),
    organizationId: new UntypedFormControl(null),
  });

  public genders$ = this.store.select(fromRoot.genderDropdownValues);
  public maritalStatuses$ = this.store.select(fromRoot.maritalStatusesDropdownValues);
  public isFullSsnLoaded$ = this.store.select(personGeneralInfoSelectors.isFullSsnLoaded);
  public isFullOtherIdentifierLoaded$ = this.store.select(personGeneralInfoSelectors.isFullOtherIdentifierLoaded);

  protected ngUnsubscribe$ = new Subject<void>();

  public dropdownComparator = DropdownHelper.compareOptions;

  constructor(
    protected store: Store<fromRoot.AppState>,
    private dateValidator: DateValidator,
    private ssnPipe: SsnPipe,
    public serverErrorService: ServerErrorService,
    private actionsSubj: ActionsSubject,
    private readonly modalService: ModalService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.seedPersonInfo(this._person);
    this.subscribeFullSsnLoaded();
    this.subscribeFullOtherIdentifierLoaded();
    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(personActions.Error, actions.PersonDetailsError),
      filter(action => !isString(action.error)),
    ).subscribe(data => {
      this.serverErrorService.showServerErrors(this.form, data);
    });
  }

  protected seedPersonInfo(info: Person): void {
    if (!info) {
      return;
    }

    this.form.patchValue({ ...info });

    if (info.organization) {
      this.form.patchValue({ organizationName: info.organization.name, organizationId: info.organization.id });
    }
  }

  protected subscribeFullSsnLoaded(): void {
    this.isFullSsnLoaded$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((isFullSsnLoaded: boolean) => {
        this.isSsnLoaded = isFullSsnLoaded;
        this.toggleSsnValidators(isFullSsnLoaded);
      });
  }

  protected subscribeFullOtherIdentifierLoaded(): void {
    this.isFullOtherIdentifierLoaded$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((isFullOtherIdentifierLoaded: boolean) => {
        this.isOtherIdentifierLoaded = isFullOtherIdentifierLoaded;
        this.toggleOtherIdentifierValidators(isFullOtherIdentifierLoaded);
      });
  }

  protected toggleOtherIdentifierValidators(isSet: boolean): void {
    const { otherIdentifier } = this.form.controls;

    otherIdentifier.setValidators(isSet ? Validators.minLength(9) : null);
    otherIdentifier.updateValueAndValidity();
  }

  protected toggleSsnValidators(isSet: boolean): void {
    const { ssn } = this.form.controls;

    ssn.setValidators(isSet ? Validators.minLength(9) : null);
    ssn.updateValueAndValidity();
  }

  public validateDateRange(): void {
    if (this.form == null) {
      return;
    }

    this.form.get('dateOfBirth').updateValueAndValidity();
    this.form.get('dateOfDeath').updateValueAndValidity();
  }

  public viewFullSSN(): void {
    if (this._person) {
      this.store.dispatch(actions.GetPersonFullSSN({ personId: this._person.id }));
    } else {
      this.isSsnLoaded = true;
    }
  }

  public formatSsn(ssn: string, showFullValue: boolean): string {
    return this.ssnPipe.transform(ssn, showFullValue);
  }

  public viewFullOtherIdentifier(): void {
    if (this._person) {
      this.store.dispatch(actions.GetPersonFullOtherIdentifier({ personId: this._person.id }));
    } else {
      this.isOtherIdentifierLoaded = true;
    }
  }

  public formatOtherIdentifier(otherIdentifier: string, showFullValue: boolean): string {
    return this.ssnPipe.transform(otherIdentifier, showFullValue);
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.ResetPersonFullSSN());
    this.store.dispatch(actions.ResetPersonFullOtherIdentifier());

    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  onOpenOrganizationSearchModal(): void {
    this.modalService.show(OrganizationSelectionModalComponent, {
      initialState: {
        onEntitySelected: (org: Org) => {
          this.form.patchValue({ organizationName: org.name, organizationId: org.id });
          this.form.updateValueAndValidity();
          this.form.markAsDirty();
        },
        gridDataFetcher: (params: IServerSideGetRowsParamsExtended) => {
          this.store.dispatch(entitySelectionActions.SearchOrganizations({ params }));
        },
      },
      class: 'entity-selection-modal',
    });
  }

  onOrganizationClear(): void {
    this.form.patchValue({ organizationName: null, organizationId: null });
    this.form.updateValueAndValidity();
    this.form.markAsDirty();
  }
}
