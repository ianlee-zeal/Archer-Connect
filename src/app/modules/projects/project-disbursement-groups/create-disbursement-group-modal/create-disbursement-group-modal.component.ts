import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup, Validators, UntypedFormControl } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';

import { PermissionService, ToastService, ValidationService } from '@app/services';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { DisbursementGroupTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { DisbursementGroup } from '@app/models/disbursement-group';
import { autoFocusFieldAsyncValidator } from '@app/validators/auto-focus-field.validator';
import * as disbursementGroupSelectors from '@app/modules/disbursement-groups/state/selectors';
import { filter, map, takeUntil } from 'rxjs/operators';
import { DeficiencySettingsTemplate } from '@app/models/deficiencies/deficiency-settings-template';
import { FormInvalid } from '../../../shared/state/common.actions';
import { SelectOption } from '../../../shared/_abstractions/base-select';
import { ProjectsCommonState } from '../../state/reducer';
import * as projectActions from '../../state/actions';
import * as projectSelectors from '../../state/selectors';

@Component({
  selector: 'app-create-disbursement-group-modal',
  templateUrl: './create-disbursement-group-modal.component.html',
  styleUrls: ['./create-disbursement-group-modal.component.scss'],
})
export class CreateDisbursementGroupModalComponent extends ValidationForm implements OnDestroy, OnInit {
  private ngUnsubscribe$ = new Subject<void>();

  public isProvisionalDisbursementGroup?: boolean = null;
  public isLienHoldbackGroup?: boolean = false;

  public title: string;
  public projectId: number;
  public sequence: number;
  public electionFormRequired: boolean;

  public error$ = this.store.select(projectSelectors.error);
  public types$ = this.store.select(disbursementGroupSelectors.disbursementGroupTypes);
  public stages$ = this.store.select(disbursementGroupSelectors.disbursementGroupStages);
  public deficiencySettingsTemplates$ = this.store.select(disbursementGroupSelectors.deficiencySettingsTemplates);

  public deficienciesTemplatePermission = PermissionService.create(PermissionTypeEnum.ProjectQsfDeficiencies, PermissionActionTypeEnum.ManageDeficienciesSettingsTemplates);

  public form: UntypedFormGroup = new UntypedFormGroup({
    name: new UntypedFormControl(null, [ValidationService.notEmptyValidator], autoFocusFieldAsyncValidator),
    type: new UntypedFormControl(null, [Validators.required]),
    stage: new UntypedFormControl(null, [Validators.required]),
    deficiencySettingsTemplate: new UntypedFormControl(null, [Validators.required]),
    isPaymentEnabled: new UntypedFormControl(true, [Validators.required]),
    electionFormRequired: new UntypedFormControl(null, [Validators.required]),
    isPrimaryFirmApprovalRequiredForPayment: new UntypedFormControl(false),
  });

  readonly awaitedActionTypes = [
    projectActions.Error.type,
    projectActions.CreateOrUpdateDisbursementGroupError.type,
    FormInvalid.type,
  ];

  constructor(
    public createDisbursementGroupModal: BsModalRef,
    private store: Store<ProjectsCommonState>,
    private toaster: ToastService,
  ) {
    super();

    this.deficiencySettingsTemplates$.pipe(
      takeUntil(this.ngUnsubscribe$),
      filter((templates: DeficiencySettingsTemplate[]) => !!templates),
      map((res: DeficiencySettingsTemplate[]) => res.find((i: DeficiencySettingsTemplate) => !!i.isDefault)),
      filter((template: DeficiencySettingsTemplate) => !!template),
    ).subscribe((template: DeficiencySettingsTemplate) => {
      this.form.patchValue({
        deficiencySettingsTemplate: template.id,
      });
      this.form.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.form.patchValue({
      electionFormRequired: this.electionFormRequired,
    });
    this.form.updateValueAndValidity();
  }

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public onSave(): void {
    if (!super.validate()) {
      this.store.dispatch(FormInvalid());
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      return;
    }

    const disbursementGroup: Partial<DisbursementGroup> = {
      name: this.form.value.name,
      projectId: this.projectId,
      typeId: this.form.value.type.id,
      stageId: this.form.value.stage.id,
      deficiencyTypeTemplateId: this.form.value.deficiencySettingsTemplate,
      sequence: this.sequence,
      isPaymentEnabled: !this.isProvisionalDisbursementGroup && this.form.value.isPaymentEnabled,
      electionFormRequired: this.form.value.electionFormRequired,
      isPrimaryFirmApprovalRequiredForPayment: this.isLienHoldbackGroup && this.form.value.isPrimaryFirmApprovalRequiredForPayment,
    };

    this.store.dispatch(projectActions.CreateDisbursementGroup({
      disbursementGroup: disbursementGroup as DisbursementGroup,
      modal: this.createDisbursementGroupModal,
    }));
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

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
    this.store.dispatch(projectActions.CreateOrUpdateDisbursementGroupError({ error: null }));
  }
}
