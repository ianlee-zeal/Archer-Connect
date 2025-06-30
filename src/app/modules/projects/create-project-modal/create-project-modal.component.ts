import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup, Validators, UntypedFormControl } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ActionsSubject, Store } from '@ngrx/store';

import { ModalService, ToastService, ValidationService } from '@app/services';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { Subject } from 'rxjs';
import { autoFocusFieldAsyncValidator } from '@app/validators/auto-focus-field.validator';
import { takeUntil } from 'rxjs/operators';
import { ProjectDto } from '@app/models/projects/project-dto';
import { ofType } from '@ngrx/effects';
import * as rootActions from '@app/state/root.actions';
import * as rootSelectors from '@app/state/index';
import { Org, Settlement } from '@app/models';
import { CustomerSelectionModalComponent } from '@app/modules/shared/entity-selection-modal/customer-selection-modal.component';
import { SettlementSelectionModalComponent } from '@app/modules/shared/entity-selection-modal/settlement-selection-modal.component';
import { FormInvalid } from '@app/modules/shared/state/common.actions';
import * as projectActions from '../state/actions';
import { ProjectsCommonState } from '../state/reducer';

@Component({
  selector: 'app-create-project-modal',
  templateUrl: './create-project-modal.component.html',
  styleUrls: ['./create-project-modal.component.scss'],
})
export class CreateProjectModalComponent extends ValidationForm implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject<void>();

  public title: string;

  public types$ = this.store.select(rootSelectors.projectTypesDropdownValues);
  public statuses$ = this.store.select(rootSelectors.projectStatusDropdownValues);

  public form: UntypedFormGroup = new UntypedFormGroup({
    name: new UntypedFormControl(null, [ValidationService.requiredAndNoWhitespaceBeforeTextValidator], autoFocusFieldAsyncValidator),
    type: new UntypedFormControl(null, [Validators.required]),
    customer: new UntypedFormControl(null, [Validators.required]),
    settlement: new UntypedFormControl(null, [Validators.required]),
    status: new UntypedFormControl(null, [Validators.required]),
    customerId: new UntypedFormControl(null, [Validators.required]),
    settlementId: new UntypedFormControl(null, [Validators.required]),
  });

  public readonly awaitedActionTypes = [
    projectActions.CreateProjectSuccess.type,
    projectActions.Error.type,
    FormInvalid.type,
  ];

  constructor(
    public createProjectModal: BsModalRef,
    private store: Store<ProjectsCommonState>,
    private toaster: ToastService,
    private actionsSubj: ActionsSubject,
    private modalService: ModalService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.subscribeToCreateProjectSuccess();
    this.store.dispatch(rootActions.GetProjectTypes());
    this.store.dispatch(rootActions.GetProjectStatuses());
  }

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public onSave(): void {
    if (!super.validate()) {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      this.store.dispatch(FormInvalid());
      return;
    }

    const project: ProjectDto = {
      name: this.form.value.name,
      typeId: this.form.value.type.id,
      primaryFirmId: this.form.value.customerId,
      settlementId: this.form.value.settlementId,
      statusId: this.form.value.status.id
    };

    this.store.dispatch(projectActions.CreateProject({ project }));
  }

  public onOpenCustomerModal(): void {
    this.modalService.show(CustomerSelectionModalComponent, {
      initialState: { onEntitySelected: (entity: Org) => this.onCustomerSelected(entity) },
      class: 'entity-selection-modal',
    });
  }

  public onOpenSettlementModal(): void {
    this.modalService.show(SettlementSelectionModalComponent, {
      initialState: { onEntitySelected: (settlement: Settlement) => this.onSettlementSelected(settlement) },
      class: 'entity-selection-modal',
    });
  }

  private onSettlementSelected(settlement: Settlement): void {
    this.form.patchValue({ settlement: settlement.name, settlementId: settlement.id });
    this.form.updateValueAndValidity();
  }

  private onCustomerSelected(customer: Org): void {
    this.form.patchValue({ customer: customer.name, customerId: customer.id });
    this.form.updateValueAndValidity();
  }

  private subscribeToCreateProjectSuccess(): void {
    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(projectActions.CreateProjectSuccess),
    ).subscribe(() => {
      this.createProjectModal.hide();
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
