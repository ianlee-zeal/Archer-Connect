import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { Action, ActionsSubject, Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { ModalService, ServerErrorService, ToastService } from '@app/services';
import { takeUntil } from 'rxjs/operators';
import { ClearCreateUpdateContactError, CreateOrUpdateContact, CreateOrUpdateContactError, CreateOrUpdateContactSuccess, GetProjectContactRoles } from '@app/modules/projects/state/actions';
import { ProjectContactSelectionModalComponent } from '@app/modules/shared/entity-selection-modal/project-contact-selection-modal.component';
import { ofType } from '@ngrx/effects';
import { projectContactRoles } from '@app/modules/projects/state/selectors';
import { StringHelper } from '@app/helpers';
import { ProjectContact } from '@app/models/project-contact';
import * as fromRoot from '../../../../../state';
import { ValidationForm } from '../../../../shared/_abstractions/validation-form';
@Component({
  selector: 'add-contact-modal',
  templateUrl: './add-contact-modal.component.html',
  styleUrls: ['./add-contact-modal.component.scss'],
})
export class AddContactModalComponent extends ValidationForm implements OnInit, OnDestroy {
  public form: UntypedFormGroup;
  public projectId: number;
  public ngDestroyed$ = new Subject<void>();
  projectContact: ProjectContact;
  public projectContactRoles$ = this.store.select(projectContactRoles);

  public get isRoleDisabled(): boolean {
    return !this.projectContact;
  }

  readonly awaitedActionTypes = [
    CreateOrUpdateContactSuccess.type,
    CreateOrUpdateContactError.type,
  ];

  constructor(
    private store: Store<fromRoot.AppState>,
    private fb: UntypedFormBuilder,
    public modal: BsModalRef,
    private modalService: ModalService,
    private toaster: ToastService,
    private actionsSubj: ActionsSubject,
    private readonly serverErrorService: ServerErrorService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.actionsSubj.pipe(
      takeUntil(this.ngDestroyed$),
      ofType(CreateOrUpdateContactError),
    ).subscribe(data => {
      if (StringHelper.equal(data.error, 'This Case Contact already added.')) {
        const error = { error: { errorMessages: { contact: [{ fieldName: 'contact', errorLevel: 0, content: 'This Project Contact already added' }] } } };
        this.serverErrorService.showServerErrors(this.form, error);
      } else {
        this.serverErrorService.showServerErrors(this.form, data);
      }
    });

    this.form = this.fb.group({
      contact: new UntypedFormControl(null, [Validators.required]),
      contactId: new UntypedFormControl(null, [Validators.required]),
      roleId: [null],
      ccOnLienStatusReport: [false],
      ccOnInvoice: [false],
      ccOnDeficiencyReport: [false],
      ccOnQsfReport: [false],
    });
  }

  public onOpenContactSelectModal(): void {
    this.form.patchValue({ roleId: null });
    this.modalService.show(ProjectContactSelectionModalComponent, {
      initialState: { onEntitySelected: (entity: ProjectContact) => this.onContactSelected(entity) },
      class: 'entity-selection-modal',
    });
  }

  private onContactSelected(projectContact: ProjectContact): void {
    this.projectContact = projectContact;
    if (projectContact.viewPrimaryOrgTypeId) {
      this.store.dispatch(GetProjectContactRoles({ id: projectContact.viewPrimaryOrgTypeId, isMaster: projectContact.viewOrgIsMaster }));
    }
    this.form.patchValue({ contact: projectContact.fullName, contactId: projectContact.id });
    this.form.updateValueAndValidity();
  }

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public save(): void {
    if (super.validate()) {
      this.store.dispatch(CreateOrUpdateContact({
        contact: {
          active: true,
          caseContactId: this.projectContact.id,
          caseId: this.projectId,
          reportCc: this.form.controls.ccOnLienStatusReport.value,
          contactRoleId: this.form.controls.roleId.value,
          invoiceCc: this.form.controls.ccOnInvoice.value,
          deficiencyReportCc: this.form.controls.ccOnDeficiencyReport.value,
          qsfReport:this.form.controls.ccOnQsfReport.value
        },
      }));
    } else {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
    }
  }

  onCancel(action: Action = null) {
    if (action?.type === CreateOrUpdateContactError.type) {
      return;
    }
    this.modal.hide();
  }

  public ngOnDestroy(): void {
    this.store.dispatch(ClearCreateUpdateContactError());
    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
  }
}
