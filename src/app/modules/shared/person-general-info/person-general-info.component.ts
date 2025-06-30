import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { Person, Email, Phone } from '@app/models';
import { PersonTemplateComponent } from '@app/modules/shared/person-template/person-template.component';
import { Entity } from '@app/modules/shared/_interfaces/entity';
import { EmailsListComponent } from '@app/modules/shared/emails-list/emails-list.component';
import { PhonesListComponent } from '@app/modules/shared/phones-list/phones-list.component';
import { Editable } from '@app/modules/shared/_abstractions/editable';
import { MessageService } from '@app/services/message.service';
import { Auditable } from '@app/models/auditable';
import * as services from '@app/services';
import { PermissionService } from '@app/services';
import { PermissionTypeEnum } from '@app/models/enums/permission-type.enum';
import { PermissionActionTypeEnum } from '@app/models/enums/permission-action-type.enum';
import { EntityTypeEnum } from '@app/models/enums';
import * as claimantSelectors from '@app/modules/claimants/claimant-details/state/selectors';
import { Claimant } from '@app/models/claimant';
import { ActionHandlersMap } from '../action-bar/action-handlers-map';
import { personGeneralInfoSelectors as selectors } from '../state/person-general-info/selectors';
import * as actions from '../state/person-general-info/actions';
import { SharedPersonGeneralInfoState } from '../state/person-general-info/state';
import { DesignatedNotesComponent } from '../designated-notes/designated-notes.component';
import { PinCodeComponent } from '../pin-code/pin-code.component';

@Component({
  selector: 'app-person-general-info',
  templateUrl: './person-general-info.component.html',
  styleUrls: ['./person-general-info.component.scss'],
})
export class PersonGeneralInfoComponent
  extends Editable
  implements OnInit, OnDestroy {
  @Input() public editOnlyMode: boolean;

  @Input() public specialDesignationsSection = false;

  @Input() public disallowDeleteAction: boolean;

  @Output() public cancel: EventEmitter<any> = new EventEmitter();

  @Output() public saveComplete: EventEmitter<boolean> = new EventEmitter();

  @ViewChild(PersonTemplateComponent) personComponent: PersonTemplateComponent;

  @ViewChild(EmailsListComponent) emailsComponent: EmailsListComponent;

  @ViewChild(PhonesListComponent) phonesComponent: PhonesListComponent;
  @ViewChild(DesignatedNotesComponent) designatedNotesComponent: DesignatedNotesComponent;

  @ViewChild(PinCodeComponent) pinCodeComponent: PinCodeComponent;

  readonly canEditPhonesPermissions = PermissionService.create(
    PermissionTypeEnum.PersonPhoneNumber,
    PermissionActionTypeEnum.Edit,
  );
  protected readonly canViewAuditInfoPermission = this.permissionsService.has(PermissionService.create(PermissionTypeEnum.AuditInfo, PermissionActionTypeEnum.ClaimantDetails));

  public person$ = this.store.select(selectors.person);

  public claimantDetailsItem$ = this.store.select(claimantSelectors.item);
  public designatedNotes$ = this.store.select(claimantSelectors.designatedNotes);

  public person: Person;

  public claimantDetails: any;

  public entityParams: Entity;

  public editingSSN: boolean;

  public personItem: Auditable;

  private pristine: boolean = true;

  private specialDesignations;

  private actionBar: ActionHandlersMap = {
    save: {
      callback: () => this.onSave(),
      disabled: () => this.canLeave || !this.validate(),
      hidden: () => !this.canEdit,
      awaitedActionTypes: [
        actions.SaveUpdatedPersonComplete.type,
        actions.PersonDetailsError.type,
      ],
    },
    back: {
      callback: () => this.goBack(),
      disabled: () => !this.canLeave,
    },
    cancel: {
      callback: () => this.onCancel(),
      hidden: () => !this.canEdit,
    },
  };

  private ngUnsubscribe$ = new Subject<void>();

  protected get hasChanges(): boolean {
    if (!this.canEdit || !this.personComponent) {
      return false;
    }

    return (
      this.personComponent.validationForm.dirty
      || this.emailsComponent.validationForm.dirty
      || this.phonesComponent.validationForm.dirty
      || this.designatedNotesComponent.validationForm.dirty
      || this.pinCodeComponent.validationForm.dirty
      || !this.pristine
    );
  }

  protected get validationForm(): UntypedFormGroup {
    return null;
  }

  constructor(
    private readonly store: Store<SharedPersonGeneralInfoState>,
    private readonly messageService: MessageService,
    private readonly toaster: services.ToastService,
    private readonly permissionsService: PermissionService,
  ) {
    super();
  }

  public ngOnInit(): void {
    const { editOnlyMode, disallowDeleteAction } = this;

    this.canEdit = editOnlyMode || false;

    if (!editOnlyMode) {
      this.actionBar.edit = {
        ...this.editAction(),
        permissions: PermissionService.create(
          PermissionTypeEnum.Persons,
          PermissionActionTypeEnum.Edit,
        ),
      };
    }

    if (!disallowDeleteAction) {
      this.actionBar.delete = {
        callback: () => this.onDelete(),
        permissions: PermissionService.create(
          PermissionTypeEnum.Persons,
          PermissionActionTypeEnum.Delete,
        ),
      };
    }

    this.store.dispatch(
      actions.UpdatePersonDetailsActionBar({ actionBar: this.actionBar }),
    );

    this.claimantDetailsItem$
      .pipe(
        filter((claimantDetails: Claimant) => claimantDetails != null),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((claimantDetails: Claimant) => {
        this.claimantDetails = claimantDetails;
      });

    this.person$
      .pipe(
        filter((person: Person) => person != null),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((person: Person) => {
        this.person = person;
        this.entityParams = {
          entityId: person.id,
          entityType: EntityTypeEnum.Persons,
        };
        this.personItem = {
          createdBy: this.person.createdBy,
          createdDate: this.person.createdDate,
          lastModifiedBy: this.person.lastModifiedBy || null,
          lastModifiedDate: this.person.lastModifiedDate || null,
        };
      });
  }

  private buildPerson(): Person {
    return (
      this.person
      && <Person>{
        ...this.personComponent.person,
        ...(this.specialDesignations ?? {
          minor: this.person.minor,
          incapacitatedAdult: this.person.incapacitatedAdult,
          deceased: this.person.deceased,
          spanishSpeakerOnly: this.person.spanishSpeakerOnly,
        }),
        emails: this.person.emails,
        phones: this.person.phones,
        clientId: this.claimantDetails?.id,
        pin: this.pinCodeComponent?.isPinLoaded ? this.pinCodeComponent?.form.value.pin : null,
        designatedNotes: this.designatedNotesComponent?.form.value.designatedNotes,
      }
    );
  }

  private onDelete(): void {
    this.messageService
      .showDeleteConfirmationDialog(
        'Confirm delete',
        'Are you sure you want to delete the person?',
      )
      .subscribe((answer: boolean) => {
        if (answer) {
          this.delete();
        }
      });
  }

  private onCancel(): void {
    this.editModeOff();
    this.saveComplete.emit();
  }

  protected onSave(): void {
    if (this.validate()) {
      this.store.dispatch(
        actions.SaveUpdatedPerson({
          person: this.buildPerson(),
          callback: () => {
            this.editModeOff();
            this.saveComplete.emit(true);
          },
        }),
      );
    } else {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
    }
  }

  private delete(): void {
    this.store.dispatch(
      actions.DeletePerson({
        personId: this.person.id,
        callback: () => this.editModeOff(),
      }),
    );
  }

  private goBack(): void {
    if (this.canEdit) {
      this.editModeOff();
    } else {
      this.cancel.emit();
    }
  }

  public validate(): boolean {
    return (
      this.personComponent.validate()
      && this.emailsComponent.validate()
      && this.designatedNotesComponent.validate()
      && this.pinCodeComponent.validate()
      && (!this.permissionsService.has(this.canEditPhonesPermissions)
        || this.phonesComponent.validate())
    );
  }

  private editModeOff(): void {
    if (!this.editOnlyMode) {
      this.canEdit = false;
      this.editingSSN = false;
      this.pristine = true;
      if (this.personComponent && this.personComponent.form) {
        this.personComponent.form.markAsPristine();
      }
    }
  }

  public onChange(): void {
    const newPerson = this.buildPerson();

    if (newPerson) {
      this.store.dispatch(
        actions.UpdatePersonDetails({
          person: newPerson,
          isPersonValid: true,
        }),
      );
    }
  }

  public onEmailsChanged(emails: Email[]): void {
    this.person.emails = emails;
    this.pristine = false;
  }

  public onPhonesChanged(phones: Phone[]): void {
    this.person.phones = phones;
    this.pristine = false;
  }

  public onSpecialDesignationsChanged(specialDesignations): void {
    this.specialDesignations = specialDesignations;
    this.pristine = false;
  }

  public ngOnDestroy(): void {
    this.store.dispatch(
      actions.UpdatePersonDetailsActionBar({ actionBar: null }),
    );

    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
