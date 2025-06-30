
import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormControl, Validators, AbstractControl, UntypedFormGroup } from '@angular/forms';
import { PersonTemplateComponent } from '@app/modules/shared/person-template/person-template.component';
import { Person, Country } from '@app/models';
import { TypeAheadHelper } from '@app/helpers/type-ahead.helper';
import { Observable } from 'rxjs';
import { EntityTypeEnum } from '@app/models/enums';
import { countriesDropdownValues } from '@app/state';
import { takeUntil, filter } from 'rxjs/operators';
import { ValidationService } from '@app/services/validation.service';
// eslint-disable-next-line import/no-extraneous-dependencies
import isEqual from 'lodash/isEqual';
import * as fromContacts from '../state';
import * as fromShared from '@app/state';

@Component({
  selector: 'app-contacts-person-template',
  templateUrl: './contacts-person-template.component.html',
  styleUrls: ['./contacts-person-template.component.scss'],
})
export class ContactsPersonTemplateComponent extends PersonTemplateComponent implements OnInit {
  public readonly entityType = EntityTypeEnum.Persons;
  countrySearch = (search$: Observable<string>) => TypeAheadHelper.search(this.countries, search$);
  countryValidator = (control: AbstractControl) => TypeAheadHelper.getValidationError(control, this.countries);

  public readonly statesDropdownValues$ = this.store.select(fromShared.statesDropdownValues);

  private isToggleableMode: boolean;

  @Input() public isPrimaryContact: boolean;
  @Input() public showEmailWarning: boolean;

  @Input() public set canToggleMode(value: boolean) {
    this.isToggleableMode = value;
    this.canEdit = this.isToggleableMode ? false : this.canEdit;
  }

  public get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public get canToggleMode(): boolean {
    return this.isToggleableMode;
  }

  @Input() public set person(value: Person) {
    if (isEqual(value, this._person)) {
      return;
    }

    this._person = value;

    if (value) {
      this.seedPersonInfo({ ...value });
    }
  }

  public get person(): Person {
    const { value } = this.form;

    return <Person>{
      ...value,
      id: this._person && this._person.id,
      fullName: `${value.firstName || ''} ${value.lastName || ''}`,
      primaryPhone: {
        ...(this._person ? this._person.primaryPhone : []),
        number: value?.phoneNumber,
        entityType: this.entityType,
        isPrimary: true,
      },
      primaryAddress: this.getPrimaryAddress(value),
      primaryEmail: {
        ...(this._person ? this._person.primaryEmail : []),
        email: value?.email,
        entityType: this.entityType,
        isPrimary: true,
      },
      orgId: value.organizationId,
    };
  }

  public isFullSsnLoaded$ = this.store.select(fromContacts.selectors.isFullSsnLoaded);

  ngOnInit(): void {
    this.form.addControl('phoneNumber', new UntypedFormControl('', Validators.minLength(10)));
    this.form.addControl('line1', new UntypedFormControl(''));
    this.form.addControl('line2', new UntypedFormControl(''));
    this.form.addControl('city', new UntypedFormControl(''));
    this.form.addControl('email', new UntypedFormControl('', ValidationService.emailValidator));
    this.form.addControl('state', new UntypedFormControl(''));
    this.form.addControl('zip', new UntypedFormControl('', ValidationService.zipCodeValidator));
    this.form.addControl('country', new UntypedFormControl(''));
    this.form.addControl('countryName', new UntypedFormControl('', this.countryValidator));
    this.form.addControl('isPrimaryContact', new UntypedFormControl(false));

    if (this.isProbateContact) {
      this.form.addControl('companyName', new UntypedFormControl(null));
      this.form.addControl('organizationName', new UntypedFormControl(null));
      this.form.addControl('organizationId', new UntypedFormControl(null));
    }

    this.store.select(countriesDropdownValues).pipe(
      filter(x => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(results => {
      this.countries = <Country[]>results;
    });

    this.subscribeFullSsnLoaded();
  }

  public toggleViewMode(): void {
    this.canEdit = !this.canEdit;
  }

  public onChange(): void {
    this.store.dispatch(
      fromContacts.actions.LinkPerson({ person: this.person }),
    );
  }

  protected seedPersonInfo(info: Person): void {
    if (!info) {
      return;
    }

    this.form.patchValue({ ...Person.toModel(info) });

    if (info.primaryAddress) {
      this.form.patchValue({ ...info.primaryAddress });

      if (info.primaryAddress.country) {
        this.form.patchValue({
          ...info.primaryAddress.country,
          countryName: info.primaryAddress.country.name,
          country: info.primaryAddress.country,
        });
      }
    }

    if (info.primaryPhone) {
      this.form.patchValue({ phoneNumber: info.primaryPhone.number });
    }

    if (info.primaryEmail) {
      this.form.patchValue({ email: info.primaryEmail.email });
    }

    if (info.organization) {
      this.form.patchValue({ organizationName: info.organization.name, organizationId: info.organization.id });
    }

    super.validate();
  }

  public viewFullSSN(): void {
    if (this._person && this._person.id) {
      this.store.dispatch(fromContacts.actions.GetPersonFullSSN({ personId: this.person.id }));
    } else {
      this.isSsnLoaded = true;
      this.toggleSsnValidators(this.isSsnLoaded);
    }
  }

  protected subscribeFullSsnLoaded(): void {
    this.isFullSsnLoaded$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(isFullSsnLoaded => {
        this.isSsnLoaded = isFullSsnLoaded;
        this.toggleSsnValidators(isFullSsnLoaded);
        this.seedPersonInfo(this._person);
      });
  }

  public countries: Country[] = [];

  public getPrimaryAddress(value: any): any {
    return {
      ...(this._person ? this._person.primaryAddress : []),
      line1: value.line1,
      line2: value.line2,
      city: value.city,
      state: value.state,
      zip: value.zip,
      country: value.country,
      entityType: this.entityType,
      isPrimary: true,
    };
  }

  public onCountryChange(event) {
    const search = event.srcElement.value;
    const country = TypeAheadHelper.get(this.countries, search.toLowerCase());

    this.form.patchValue({
      countryName: country ? country.name : search,
      country,
    });
  }
}
