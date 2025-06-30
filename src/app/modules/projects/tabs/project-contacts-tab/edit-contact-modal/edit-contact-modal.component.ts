import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormGroup, Validators, UntypedFormControl } from '@angular/forms';
import { Action, Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { ToastService } from '@app/services';
import { CreateOrUpdateContact, CreateOrUpdateContactError, CreateOrUpdateContactSuccess } from '@app/modules/projects/state/actions';
import { ProjectContactReference } from '@app/models/project-contact-reference';
import * as fromRoot from '../../../../../state';
import { ValidationForm } from '../../../../shared/_abstractions/validation-form';

@Component({
  selector: 'edit-contact-modal',
  templateUrl: './edit-contact-modal.component.html',
  styleUrls: ['./edit-contact-modal.component.scss'],
})
export class EditContactModalComponent extends ValidationForm implements OnInit, OnDestroy {
  public ngDestroyed$ = new Subject<void>();
  public contact: ProjectContactReference;
  public isDeficiencyReport: boolean = false;

  readonly awaitedActionTypes = [
    CreateOrUpdateContactSuccess.type,
    CreateOrUpdateContactError.type,
  ];

  public form: UntypedFormGroup = new UntypedFormGroup({
    status: new UntypedFormControl(null, [Validators.required]),
    ccOnLienStatusReport: new UntypedFormControl(false),
    ccOnInvoice: new UntypedFormControl(false),
    ccOnDeficiencyReport: new UntypedFormControl(false),
    ccOnQsfReport : new UntypedFormControl(false),
  });

  statusOptions = [
    {
      id: true,
      name: 'Active',
    },
    {
      id: false,
      name: 'Inactive',
    },
  ];
  constructor(
    private store: Store<fromRoot.AppState>,
    public modal: BsModalRef,
    private toaster: ToastService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.form.patchValue({
      status: this.statusOptions.find(status => status?.id === this.contact.active),
      ccOnLienStatusReport: this.contact.reportCc,
      ccOnInvoice: this.contact.invoiceCc,
      ccOnDeficiencyReport: this.contact.deficiencyReportCc,
      ccOnQsfReport: this.contact.qsfReport,
    });
  }

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public save(): void {
    if (super.validate()) {
      this.store.dispatch(CreateOrUpdateContact({
        contact: {
          contactRoleId: this.contact.contactRole?.id,
          id: this.contact?.id,
          caseContactId: this.contact.projectContactId,
          caseId: this.contact.projectId,
          reportCc: this.form.controls.ccOnLienStatusReport.value,
          active: this.form.controls.status.value?.id,
          invoiceCc: this.form.controls.ccOnInvoice.value,
          deficiencyReportCc: this.form.controls.ccOnDeficiencyReport.value,
          qsfReport: this.form.controls.ccOnQsfReport.value
        },
        isDeficiencyReport: this.isDeficiencyReport,
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
    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
  }
}
