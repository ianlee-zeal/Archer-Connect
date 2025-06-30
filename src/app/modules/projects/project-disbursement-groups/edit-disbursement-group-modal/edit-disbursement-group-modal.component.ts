import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup, Validators, UntypedFormControl } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';

import { ModalService, PermissionService, ToastService, ValidationService } from '@app/services';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { Subject } from 'rxjs';
import { DisbursementGroup } from '@app/models/disbursement-group';
import { filter, takeUntil } from 'rxjs/operators';
import { autoFocusFieldAsyncValidator } from '@app/validators/auto-focus-field.validator';
import { DisbursementGroupTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import * as disbursementGroupSelectors from '@app/modules/disbursement-groups/state/selectors';
import { DateValidator } from '@app/modules/shared/_validators/date-validator';
import moment from 'moment-timezone';
import { FormInvalid } from '@app/modules/shared/state/common.actions';
import { ProjectsCommonState } from '../../state/reducer';
import * as projectSelectors from '../../state/selectors';
import * as projectActions from '../../state/actions';
import { SelectOption } from '../../../shared/_abstractions/base-select';
import { DeleteDisbursementGroupModalComponent } from '../delete-disbursement-group-modal/delete-disbursement-group-modal.component';

@Component({
  selector: 'app-edit-disbursement-group-modal',
  templateUrl: './edit-disbursement-group-modal.component.html',
  styleUrls: ['./edit-disbursement-group-modal.component.scss'],
})
export class EditDisbursementGroupModalComponent extends ValidationForm implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject<void>();
  private disbursementGroup$ = this.store.select(projectSelectors.disbursementGroup);

  public isProvisionalDisbursementGroup?: boolean = null;
  public isLienHoldbackGroup?: boolean = false;

  readonly awaitedActionTypes = [
    projectActions.Error.type,
    projectActions.CreateOrUpdateDisbursementGroupError.type,
    FormInvalid.type,
  ];

  public title: string;
  public disbursementGroupId: number;
  public disbursementGroup: DisbursementGroup;
  public types$ = this.store.select(disbursementGroupSelectors.disbursementGroupTypes);
  public stages$ = this.store.select(disbursementGroupSelectors.disbursementGroupStages);
  public error$ = this.store.select(projectSelectors.error);
  public deficiencySettingsTemplates$ = this.store.select(disbursementGroupSelectors.deficiencySettingsTemplates);
  public deletePermission = PermissionService.create(PermissionTypeEnum.DisbursementGroups, PermissionActionTypeEnum.Delete);
  public deficienciesTemplatePermission = PermissionService.create(PermissionTypeEnum.ProjectQsfDeficiencies, PermissionActionTypeEnum.ManageDeficienciesSettingsTemplates);
  public form: UntypedFormGroup = new UntypedFormGroup({
    name: new UntypedFormControl(null, [ValidationService.notEmptyValidator], autoFocusFieldAsyncValidator),
    type: new UntypedFormControl(null, [Validators.required]),
    stage: new UntypedFormControl(null, [Validators.required]),
    defenseApprovedDate: new UntypedFormControl(null),
    settlementApprovedDate: new UntypedFormControl(null),
    archerApprovedDate: new UntypedFormControl(null),
    followUpDate: new UntypedFormControl(null, [this.dateValidator.notPastDate]),
    sequence: new UntypedFormControl(null),
    isActive: new UntypedFormControl(null),
    isPaymentEnabled: new UntypedFormControl(false),
    electionFormRequired: new UntypedFormControl(null),
    deficiencySettingsTemplate: new UntypedFormControl(null, [Validators.required]),
    isPrimaryFirmApprovalRequiredForPayment: new UntypedFormControl(false),
  });
  public readonly minDate = moment().toDate();

  constructor(
    public editDisbursementGroupModal: BsModalRef,
    private store: Store<ProjectsCommonState>,
    private toaster: ToastService,
    private modalService: ModalService,
    public dateValidator: DateValidator,
  ) {
    super();
  }

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  ngOnInit(): void {
    this.disbursementGroup$
      .pipe(
        filter((d: DisbursementGroup) => !!d),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((d: DisbursementGroup) => {
        this.disbursementGroup = d;
        this.seedForm(d);
      });

    this.store.dispatch(projectActions.GetDisbursementGroup({ disbursementGroupId: this.disbursementGroupId }));
  }

  public onTypeChanged(value: SelectOption): void {
    this.isProvisionalDisbursementGroup = (value && value.id === DisbursementGroupTypeEnum.Provisional) || null;
    this.isLienHoldbackGroup = (value && value.id === DisbursementGroupTypeEnum.LienHoldbackRelease);

    if (this.isProvisionalDisbursementGroup) {
      this.form.patchValue({ isPaymentEnabled: false });
    }
    if (!this.isLienHoldbackGroup) {
      this.form.patchValue({ isPrimaryFirmApprovalRequiredForPayment: false });
    }
  }

  public onSave(): void {
    if (!super.validate()) {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      this.store.dispatch(FormInvalid());
      return;
    }

    const disbursementGroup: Partial<DisbursementGroup> = {
      id: this.disbursementGroupId,
      name: this.form.value.name,
      typeId: this.form.value.type.id,
      stageId: this.form.value.stage.id,
      deficiencyTypeTemplateId: this.form.value.deficiencySettingsTemplate,
      projectId: this.disbursementGroup.projectId,
      defenseApprovedDate: this.form.value.defenseApprovedDate,
      settlementApprovedDate: this.form.value.settlementApprovedDate,
      archerApprovedDate: this.form.value.archerApprovedDate,
      followUpDate: this.form.value.followUpDate,
      sequence: this.form.value.sequence,
      isActive: this.form.value.isActive,
      isPaymentEnabled: !this.isProvisionalDisbursementGroup && this.form.value.isPaymentEnabled,
      electionFormRequired: this.form.value.electionFormRequired,
      isPrimaryFirmApprovalRequiredForPayment: this.isLienHoldbackGroup && this.form.value.isPrimaryFirmApprovalRequiredForPayment,
    };
    this.store.dispatch(projectActions.UpdateDisbursementGroup({
      disbursementGroup: disbursementGroup as DisbursementGroup,
      modal: this.editDisbursementGroupModal,
    }));
  }

  public onDelete(): void {
    this.modalService.show(DeleteDisbursementGroupModalComponent, {
      initialState: { disbursementGroupId: this.disbursementGroupId, projectId: this.disbursementGroup.projectId },
      class: 'modal-lg small-modal',
    });
  }

  public onClose(): void {
    this.editDisbursementGroupModal.hide();
  }

  private seedForm(d: DisbursementGroup): void {
    this.form.patchValue({
      name: d.name,
      type: { id: d.typeId, name: d.typeName },
      stage: { id: d.stageId, name: d.stageName },
      defenseApprovedDate: d.defenseApprovedDate,
      settlementApprovedDate: d.settlementApprovedDate,
      archerApprovedDate: d.archerApprovedDate,
      followUpDate: d.followUpDate,
      sequence: d.sequence,
      isActive: d.isActive,
      isPaymentEnabled: d.isPaymentEnabled,
      electionFormRequired: d.electionFormRequired,
      deficiencySettingsTemplate: d.deficiencyTypeTemplateId ?? -1,
      isPrimaryFirmApprovalRequiredForPayment: d.isPrimaryFirmApprovalRequiredForPayment,
    });

    this.form.updateValueAndValidity();

    this.form.markAllAsTouched();

    this.isProvisionalDisbursementGroup = d.typeId === DisbursementGroupTypeEnum.Provisional || null;
    this.isLienHoldbackGroup = d.typeId === DisbursementGroupTypeEnum.LienHoldbackRelease;
  }

  ngOnDestroy(): void {
    this.store.dispatch(projectActions.ClearDisbursementGroup());
    this.store.dispatch(projectActions.CreateOrUpdateDisbursementGroupError({ error: null }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
