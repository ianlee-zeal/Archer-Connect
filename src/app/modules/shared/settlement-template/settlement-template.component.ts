import { Component, OnInit, Input } from '@angular/core';
import { Validators, UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { Store, ActionsSubject } from '@ngrx/store';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ValidationService } from '@app/services/validation.service';
import { Org, Settlement, Matter } from '@app/models';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { DropdownHelper } from '@app/helpers/dropdown.helper';
import { ModalService, PermissionService, ServerErrorService } from '@app/services';
import * as fromRoot from '@app/state';
import isEqual from 'lodash/isEqual';
import { ofType } from '@ngrx/effects';
import * as settlementActions from '@app/modules/settlements/state/actions';
import { MatterSelectionModalComponent } from '@app/modules/shared/entity-selection-modal/matter-selection-modal.component';
import { CustomerSelectionModalComponent } from '@app/modules/shared/entity-selection-modal/customer-selection-modal.component';
import { PermissionTypeEnum } from '@app/models/enums/permission-type.enum';
import { PermissionActionTypeEnum } from '@app/models/enums';
import * as actions from '../state/settlement-info/actions';
import { autoFocusFieldAsyncValidator } from '../../../validators/auto-focus-field.validator';

@Component({
  selector: 'app-settlement-template',
  templateUrl: './settlement-template.component.html',
  styleUrls: ['./settlement-template.component.scss'],
})
export class SettlementTemplateComponent extends ValidationForm implements OnInit {
  protected entity: Settlement;
  protected canShowFinancialSummaryToggle: boolean = false;

  @Input() public set settlement(value: Settlement) {
    if (isEqual(value, this.settlement)) {
      return;
    }

    this.entity = value;
    this.seedSettlementInfo(value);
  }

  @Input() public canEdit: boolean = true;

  public get settlement(): Settlement {
    const { value } = this.form;
    return <Settlement>{
      ...value,
      id: this.entity?.id,
    };
  }

  public get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public form: UntypedFormGroup = new UntypedFormGroup({
    name: new UntypedFormControl('', [Validators.required, ValidationService.notEmptyValidator], autoFocusFieldAsyncValidator),
    matter: new UntypedFormControl(null, [Validators.required]),
    matterId: new UntypedFormControl(null, Validators.required),
    org: new UntypedFormControl(null, [Validators.required]),
    orgId: new UntypedFormControl(null, Validators.required),
    showFinancialSummary: new UntypedFormControl(true, Validators.required),
  });

  protected ngUnsubscribe$ = new Subject<void>();

  public dropdownComparator = DropdownHelper.compareOptions;

  constructor(
    protected store: Store<fromRoot.AppState>,
    public serverErrorService: ServerErrorService,
    private actionsSubj: ActionsSubject,
    private modalService: ModalService,
    private router: Router,
    private permissionService: PermissionService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.canShowFinancialSummaryToggle = this.permissionService.has(PermissionService.create(PermissionTypeEnum.Settlements, PermissionActionTypeEnum.ShowFinancialSummaryToggle));
    this.seedSettlementInfo(this.entity);

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(settlementActions.Error, actions.SettlementInfoError),
    ).subscribe(data => this.serverErrorService.showServerErrors(this.form, data));
  }

  protected seedSettlementInfo(info: Settlement): void {
    if (!info) {
      return;
    }

    this.form.patchValue({ ...info });
  }

  public onClear(controlName: string): void {
    this.form.patchValue({ [controlName]: null, [`${controlName}Id`]: null });
    this.form.updateValueAndValidity();
  }

  public onOpenFirmModal(): void {
    this.modalService.show(CustomerSelectionModalComponent, {
      initialState: { onEntitySelected: (entity: Org) => this.onFirmSelect(entity) },
      class: 'entity-selection-modal',
    });
  }

  private onFirmSelect(firm: Org) {
    this.form.patchValue({ org: firm.name, orgId: firm.id });
    this.form.updateValueAndValidity();
  }

  public onOpenMatterModal(): void {
    this.modalService.show(MatterSelectionModalComponent, {
      initialState: { onEntitySelected: (entity: Matter) => this.onMatterSelect(entity) },
      class: 'entity-selection-modal',
    });
  }

  private onMatterSelect(matter: Matter) {
    this.form.patchValue({ matter: matter.name, matterId: matter.id });
    this.form.updateValueAndValidity();
  }

  public onShowFinancialSummaryCheck(isChecked: boolean) {
    this.form.patchValue({ showFinancialSummary: isChecked });
  }

  public redirectToMatter() {
    this.router.navigate(['dashboard', 'matters', this.settlement.matterId, 'tabs', 'matter-information']);
  }

  public redirectToFirm() {
    this.router.navigate(['admin', 'user', 'orgs', this.settlement.orgId, 'my-organization', 'tabs', 'details']);
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
