import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
import { ModalService, ToastService } from '@app/services';
import { OrganizationSelectionModalComponent } from '@app/modules/shared/entity-selection-modal/organization-selection-modal.component';
import { Org } from '@app/models';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { ActionsSubject, Store } from '@ngrx/store';
import * as entitySelectionActions from '@app/modules/shared/state/entity-selection-modal/actions';
import { ProjectsCommonState } from '@app/modules/projects/state/reducer';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ofType } from '@ngrx/effects';
import { IdValue } from '../../../../models/idValue';
import * as actions from '../../state/actions';

@Component({
  selector: 'app-organization-message-modal',
  templateUrl: './organization-message-modal.component.html',
  styleUrls: ['./organization-message-modal.component.scss'],
})
export class OrganizationMessageModalComponent extends ValidationForm implements OnInit {
  @Input() projectId: number;
  @Input() canEdit: boolean;
  id: number;
  active: boolean;
  message: string;
  primaryOrg: IdValue;

  public ngUnsubscribe$ = new Subject<void>();

  readonly awaitedActionTypes = [
    actions.CreateProjectOrganizationMessageSuccess.type,
    actions.EditProjectOrganizationMessageSuccess.type,
    actions.Error.type,
  ];

  public form = new UntypedFormGroup({
    organization: new UntypedFormControl(null),
    organizationId: new UntypedFormControl(null, Validators.required),
    message: new UntypedFormControl(null, Validators.required),
  });

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public get title(): string {
    return this.id ? "Message" : "Create New Message";
  }

  constructor(
    private readonly store: Store<ProjectsCommonState>,
    private modalService: ModalService,
    public modal: BsModalRef,
    private toaster: ToastService,
    private actionsSubj: ActionsSubject,
  ) { super(); }

  ngOnInit(): void {
    if (this.id) {
      this.form.patchValue({
        organization: this.primaryOrg.name,
        organizationId: this.primaryOrg.id,
        message: this.message,
      });
    }
    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(actions.CreateProjectOrganizationMessageSuccess, actions.EditProjectOrganizationMessageSuccess),
    ).subscribe(() => {
      this.modal.hide();
    });
  }

  public onOpenOrgModal(): void {
    this.modalService.show(OrganizationSelectionModalComponent, {
      initialState: {
        onEntitySelected: (entity: Org) => this.onOrgSelect(entity, 'organization', 'organizationId'),
        gridDataFetcher: (params: IServerSideGetRowsParamsExtended) => this.store.dispatch(entitySelectionActions.SearchOrganizations({ params })),
        title: 'Organization Selection',
      },
      class: 'entity-selection-modal',
    });
  }

  public onClear(controlName: string): void {
    this.form.patchValue({ [controlName]: null, [`${controlName}Id`]: null });
    this.form.updateValueAndValidity();
    this.form.markAsDirty();
  }

  private onOrgSelect(org: Org, name: string, id: string) {
    this.form.patchValue({ [name]: org.name, [id]: org.id });
    this.form.updateValueAndValidity();
    this.form.markAsDirty();
  }

  public save(): void {
    if (super.validate()) {
      const message = {
        message: this.form.controls.message.value,
        primaryOrgId: this.form.controls.organizationId.value,
        projectId: this.projectId,
        active: true,
      };

      if (this.id) {
        this.store.dispatch(actions.EditProjectOrganizationMessage({ id: this.id, message }));
      } else {
        this.store.dispatch(actions.CreateProjectOrganizationMessage({ message }));
      }
    } else {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
    }
  }

  public onCancel() {
    this.modal.hide();
  }
}
