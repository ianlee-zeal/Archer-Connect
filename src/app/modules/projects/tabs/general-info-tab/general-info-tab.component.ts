import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActionsSubject, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import { Editable } from '@app/modules/shared/_abstractions/editable';
import { Project, Org, Settlement } from '@app/models';
import { ProjectDetails } from '@app/models/projects/project-details';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { ModalService, PermissionService, ToastService, ValidationService } from '@app/services';
import { ProjectDto } from '@app/models/projects/project-dto';
import { ofType } from '@ngrx/effects';
import * as rootActions from '@app/state/root.actions';
import * as rootSelectors from '@app/state/index';
import { Attorney } from '@app/models/attorney';
import { CustomerSelectionModalComponent } from '@app/modules/shared/entity-selection-modal/customer-selection-modal.component';
import { AttorneySelectionModalComponent } from '@app/modules/shared/entity-selection-modal/attorney-selection-modal.component';
import { SettlementSelectionModalComponent } from '@app/modules/shared/entity-selection-modal/settlement-selection-modal.component';
import { QsfOrgSelectionModalComponent } from '@app/modules/shared/entity-selection-modal/qsf-org-selection-modal.component';
import { OrgType } from '@app/models/enums/org-type.enum';
import * as selectors from '../../state/selectors';
import * as actions from '../../state/actions';
import * as fromProjects from '../../state';
import { OrgIdNameAlt } from '@app/models/orgIdNameAlt';

@Component({
  selector: 'app-general-info-tab',
  templateUrl: './general-info-tab.component.html',
  styleUrls: ['./general-info-tab.component.scss'],
})
export class GeneralInfoTabComponent extends Editable implements OnInit, OnDestroy {
  public item$ = this.store.select(selectors.item);
  public projectDetails$ = this.store.select(selectors.projectDetails);
  public types$ = this.store.select(rootSelectors.projectTypesDropdownValues);
  public statuses$ = this.store.select(rootSelectors.projectStatusDropdownValues);
  public error$ = this.store.select(selectors.error);
  public projectDetails: ProjectDetails;

  private ngUnsubscribe$ = new Subject<void>();
  private item: Project;

  public removableInputWidth = '270';

  protected get hasChanges(): boolean {
    if (!this.canEdit) {
      return false;
    }

    return this.validationForm.dirty || !this.validationForm.pristine;
  }

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public form: UntypedFormGroup = new UntypedFormGroup({
    name: new UntypedFormControl(null, [Validators.required, ValidationService.noWhitespaceBeforeTextValidator]),
    projectCode: new UntypedFormControl(null),
    type: new UntypedFormControl(null, Validators.required),
    status: new UntypedFormControl(null, Validators.required),
    primaryFirm: new UntypedFormControl(null),
    primaryAttorney: new UntypedFormControl(null),
    settlement: new UntypedFormControl(null, Validators.required),
    qsfAdminOrg: new UntypedFormControl(null),
    qsfOrg: new UntypedFormControl(null),
    taxIdNumber: new UntypedFormControl(null),
    qsfFundedDate: new UntypedFormControl(null),
    QSFFundedDate: new UntypedFormControl(null),
    primaryFirmId: new UntypedFormControl(null),
    primaryAttorneyId: new UntypedFormControl(null),
    settlementId: new UntypedFormControl(null, Validators.required),
    qsfAdminOrgId: new UntypedFormControl(null),
    qsfOrgId: new UntypedFormControl(null),
    qsfAdministrator: new UntypedFormControl(null),
    fundName: new UntypedFormControl(null),
    isManagedInAC: new UntypedFormControl(null),
    finalStatusLetters: new UntypedFormControl(null),
    paymentCoverSheets: new UntypedFormControl(null),
    checkTable: new UntypedFormControl(null),
    assignedPhoneNumber: new UntypedFormControl(null, Validators.minLength(10)),
  });

  constructor(
    private store: Store<fromProjects.AppState>,
    private actionsSubj: ActionsSubject,
    private modalService: ModalService,
    private toaster: ToastService,
  ) {
    super();
  }

  ngOnInit() {
    this.subscribe();
    this.updateActionBar();
    this.store.dispatch(rootActions.GetProjectTypes());
    this.store.dispatch(rootActions.GetProjectStatuses());
  }

  protected save(): void {
    if (!super.validate()) {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      return;
    }

    const updatedProject: ProjectDto = {
      id: this.item.id,
      name: this.form.controls.name.value,
      projectCode: this.form.controls.projectCode.value,
      typeId: this.form.controls.type.value?.id,
      statusId: this.form.controls.status.value?.id,
      primaryFirmId: this.form.value.primaryFirmId,
      primaryAttorneyId: this.form.value.primaryAttorneyId,
      qsfAdminOrgId: this.form.value.qsfAdminOrgId,
      qsfOrgId: this.form.value.qsfOrgId,
      taxIdNumber: this.form.controls.taxIdNumber.value,
      qsfFundedDate: this.form.controls.qsfFundedDate.value,
      settlementId: this.form.value.settlementId,
      qsfAdministrator: this.form.value.qsfAdministrator,
      fundName: this.form.value.fundName,
      isManagedInAC: this.form.value.isManagedInAC,
      finalStatusLetters : this.form.value.finalStatusLetters,
      paymentCoverSheets :this.form.value.paymentCoverSheets,
      checkTable : this.form.value.checkTable,
      assignedPhoneNumber: this.form.value.assignedPhoneNumber,
    };

    this.store.dispatch(actions.SaveItem({ item: updatedProject }));
  }

  public onOpenSettlementModal(): void {
    this.modalService.show(SettlementSelectionModalComponent, {
      initialState: { onEntitySelected: (settlement: Settlement) => this.onSettlementSelect(settlement) },
      class: 'entity-selection-modal',
    });
  }

  public onOpenAttorneyModal(): void {
    this.modalService.show(AttorneySelectionModalComponent, {
      initialState: { onEntitySelected: (attorney: Attorney) => this.onAttorneySelect(attorney) },
      class: 'entity-selection-modal',
    });
  }

  public onOpenFirmModal(): void {
    this.modalService.show(CustomerSelectionModalComponent, {
      initialState: { onEntitySelected: (entity: Org) => this.onOrgSelect(entity, 'primaryFirm', 'primaryFirmId') },
      class: 'entity-selection-modal',
    });
  }

  public onOpenQSFAdminModal(): void {
    this.modalService.show(QsfOrgSelectionModalComponent, {
      initialState: {
        onEntitySelected: (entity: Org) => this.onOrgSelect(entity, 'qsfAdminOrg', 'qsfAdminOrgId'),
        orgTypeIds: [OrgType.QSFAdministrator],
        title: 'QSF Administration Organization Selection',
      },
      class: 'qsf-org-selection-modal',
    });
  }

  public onOpenQSFModal(): void {
    this.modalService.show(QsfOrgSelectionModalComponent, {
      initialState: {
        onEntitySelected: (entity: Org) => this.onOrgSelect(entity, 'qsfOrg', 'qsfOrgId', true),
        orgTypeIds: [OrgType.QualifiedSettlementFund],
        title: 'Qualified Settlement Fund Selection',
      },
      class: 'qsf-org-selection-modal',
    });
  }

  public onClear(controlName: string): void {
    this.form.patchValue({ [controlName]: null, [`${controlName}Id`]: null });
    this.form.updateValueAndValidity();
    this.form.markAsDirty();
  }

  private onOrgSelect(org: Org, name: string, id: string, showAltName: boolean = false) {
    let orgName = showAltName ? OrgIdNameAlt.getQsfOrgName(org.name, org.altName) : org.name;

    this.form.patchValue({ [name]: orgName, [id]: org.id });
    this.form.updateValueAndValidity();
    this.form.markAsDirty();
  }

  private onAttorneySelect(attorney: Attorney) {
    this.form.patchValue({
      primaryAttorney: `${attorney.firstName} ${attorney.lastName}`,
      primaryAttorneyId: attorney.id,
    });
    this.form.updateValueAndValidity();
    this.form.markAsDirty();
  }

  private onSettlementSelect(settlement: Settlement) {
    this.form.patchValue({ settlement: settlement.name, settlementId: settlement.id });
    this.form.updateValueAndValidity();
    this.form.markAsDirty();
  }

  private seedForm(projectDetails: ProjectDetails): void {
    if (!projectDetails) return;

    let qsfOrgName = projectDetails.qsfOrg ?
      projectDetails.qsfOrg.getQsfOrgName() :
      '';

    let assignedPhoneNumber = this.cleanPhoneNumber(projectDetails?.assignedPhoneNumber);

    this.form.patchValue({
      name: projectDetails.name,
      projectCode: projectDetails.projectCode,
      type: projectDetails.projectType,
      status: projectDetails.projectStatus,
      matter: projectDetails.matter,
      settlementDate: projectDetails.settlementDate,
      settlementAmount: projectDetails.settlementAmount,
      primaryFirm: projectDetails.primaryFirm?.name,
      primaryAttorney: projectDetails.primaryAttorney?.name,
      settlement: projectDetails.settlement?.name,
      qsfAdminOrg: projectDetails.qsfAdminOrg?.name,
      qsfOrg: qsfOrgName,
      taxIdNumber: projectDetails.taxIdNumber,
      qsfFundedDate: projectDetails.qsfFundedDate,
      primaryAttorneyId: projectDetails.primaryAttorney?.id,
      primaryFirmId: projectDetails.primaryFirm?.id,
      settlementId: projectDetails.settlement?.id,
      qsfAdminOrgId: projectDetails.qsfAdminOrg?.id,
      qsfOrgId: projectDetails.qsfOrg?.id,
      qsfAdministrator: projectDetails.qsfAdministrator,
      fundName: projectDetails.fundName,
      isManagedInAC: projectDetails?.isManagedInAC,
      finalStatusLetters:projectDetails?.finalStatusLetters,
      paymentCoverSheets:projectDetails?.paymentCoverSheets,
      checkTable:projectDetails?.checkTable,
      assignedPhoneNumber: assignedPhoneNumber,
    });

    if (this.form.controls.isManagedInAC.value === null) {
      this.form.controls.isManagedInAC.disable();
    }

    this.form.updateValueAndValidity();
  }

  private cleanPhoneNumber(assignedPhoneNumber: string) {
    return !!assignedPhoneNumber ? assignedPhoneNumber.replace(/\D/g, '') : '';
  }

  private subscribe(): void {
    this.item$.pipe(
      filter(x => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(item => {
      this.item = item;
      this.store.dispatch(actions.GetProjectDetailsRequest({ projectId: this.item.id }));
    });

    this.projectDetails$.pipe(
      filter(x => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(item => {
      this.projectDetails = item;
      this.seedForm(item);
    });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(actions.SaveItemCompleted),
    ).subscribe(() => {
      this.canEdit = false;
    });
  }

  private updateActionBar(): void {
    this.store.dispatch(actions.UpdateActionBar({
      actionBar: {
        save: {
          callback: () => this.save(),
          hidden: () => !this.canEdit,
          disabled: () => !this.form.valid || !this.hasChanges,
          awaitedActionTypes: [
            actions.SaveItemCompleted.type,
            actions.Error.type,
          ],
        },
        cancel: {
          callback: () => {
            this.seedForm(this.projectDetails);
            this.canEdit = false;
          },
          hidden: () => !this.canEdit,
        },
        edit: {
          ...super.editAction(),
          permissions: PermissionService.create(PermissionTypeEnum.Projects, PermissionActionTypeEnum.Edit),
        },
      },
    }));
  }

  get qsfOrgName() {
    return this.projectDetails?.qsfOrg ?
      this.projectDetails.qsfOrg.getQsfOrgName() :
      '';
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
