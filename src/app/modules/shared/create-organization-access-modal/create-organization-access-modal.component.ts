import { Component, OnInit, OnDestroy } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Action, Store } from '@ngrx/store';
import * as actions from 'src/app/modules/claimants/claimant-details/state/actions';
import { EntityTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import * as fromClaimants from 'src/app/modules/claimants/claimant-details/state/selectors';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { OrganizationEntityAccess } from '@app/models/organization-entity-access';
import { MessageService, ModalService, PermissionService, ServerErrorService, ToastService } from '@app/services';
import { IdValue, Org } from '@app/models';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import * as sharedActions from '@app/modules/shared/state/entity-selection-modal/actions';
import * as fromRoot from '../../../state';
import { ValidationForm } from '../_abstractions/validation-form';
import { OrganizationSelectionModalComponent } from '../entity-selection-modal/organization-selection-modal.component';
import { OrgType } from '@app/models/enums/ledger-settings/org-type';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { FilterModel } from '@app/models/advanced-search/filter-model';

interface OrganizationAccessFormValue {
  organization: string;
  organizationTypeId: number;
  externalId: string;
}
@Component({
  selector: 'app-create-organization-access-modal',
  templateUrl: './create-organization-access-modal.component.html',
  styleUrls: ['./create-organization-access-modal.component.scss'],
})
export class CreateOrganizationAccessModalComponent extends ValidationForm implements OnInit, OnDestroy {
  public clientOrgAccessDeletePermission = PermissionService.create(PermissionTypeEnum.ClientOrgAccess, PermissionActionTypeEnum.Delete);

  public organizationAccess: OrganizationEntityAccess;
  private claimantId: number;
  public orgId: number;

  private item$ = this.store.select(fromClaimants.item);
  public orgAccessOrganizations$ = this.store.select(fromClaimants.orgAccessOrganizationsSelector);
  private orgTypesValues$ = this.store.select(fromRoot.organizationTypeDropdownValues);
  public orgTypesValues = [];
  public editMode: boolean = false;
  public errorMessage: string = null;

  private ngUnsubscribe$ = new Subject<void>();

  public get isRemoveableOrganizationTypeId(): boolean {
    return this.organizationAccess.organizationTypeId != OrgType.Company;
  }

  readonly awaitedActionTypes = [
    actions.CreateOrganizationAccessRequestSuccess.type,
    actions.UpdateOrganizationAccessRequestSuccess.type,
    actions.DeleteOrganizationAccessRequestSuccess.type,
    actions.Error.type,
  ];

  constructor(
    private store: Store<fromRoot.AppState>,
    public modal: BsModalRef,
    private fb: UntypedFormBuilder,
    private messageService: MessageService,
    private toaster: ToastService,
    private errService: ServerErrorService,
    private modalService: ModalService,
  ) { super(); }

  public form = this.fb.group({
    organization: [null, [Validators.required]],
    organizationTypeId: [''],
    externalId: ['', [Validators.maxLength(255)]],
  });

  ngOnInit() {
    this.filterOrgTypesValues();
    this.item$.pipe(
      takeUntil(this.ngUnsubscribe$),
    )
      .subscribe(claimant => {
        this.claimantId = claimant.id;
      });

    if (this.organizationAccess) {
      this.form.patchValue({
        organization: this.organizationAccess.organizationName,
        organizationTypeId: this.organizationAccess.organizationTypeId,
        externalId: this.organizationAccess.externalId,
      });

      this.orgId = this.organizationAccess.organizationId;
      this.onPrimaryOrgTypeChanged(this.organizationAccess.organizationTypeId)
    }

    this.subscribeToFormChanges();
  }

  public get isEditMode(): boolean {
    return this.editMode || !this.organizationAccess;
  }

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public get canSaveOrDelete(): boolean {
    return this.form && this.form.valid;
  }

  public get isOrgTypesValuesClearable(): boolean {
    return this.orgTypesValues.length !== 1;
  }

  public save(): void {
    if (!super.validate()) {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      return;
    }

    const val: OrganizationAccessFormValue = this.form.value;

    const newOrganizationAccess = {
      organizationId: this.orgId,
      organizationTypeId: +val.organizationTypeId,
      entityTypeId: EntityTypeEnum.Clients,
      entityId: this.claimantId,
      externalId: val.externalId,
      displayName: val.organization.trim(),
    };

    if (this.organizationAccess) {
      const updatedOrganizationAccess = { ...this.organizationAccess, ...newOrganizationAccess };
      this.store.dispatch(actions.UpdateOrganizationAccessRequest({ item: updatedOrganizationAccess }));
      return;
    }

    this.store.dispatch(actions.CreateOrganizationAccessRequest({ item: newOrganizationAccess }));
  }

  public onDelete(): void {
    if (!this.isRemoveableOrganizationTypeId) {
      return;
    }

    this.messageService.showDeleteConfirmationDialog(
      'Confirm delete',
      'Are you sure you want to delete this organization access?',
    )
      .subscribe(answer => {
        if (!answer) {
          return;
        }

        this.store.dispatch(actions.DeleteOrganizationAccessRequest({ id: this.organizationAccess.id }));
      });
  }

  public searchFn() {
    return true;
  }

  public onActionFinished(action: Action): void {
    switch (action.type) {
      case actions.UpdateOrganizationAccessRequestSuccess.type:
      case actions.CreateOrganizationAccessRequestSuccess.type:
      case actions.DeleteOrganizationAccessRequestSuccess.type:
        this.modal.hide();
        break;
      case actions.Error.type: {
        const errorAction: any = action;
        if (errorAction.error?.errorMessages) {
          const errors = this.errService.getFormErrors('organizationEntityAccess', errorAction.error);
          this.errorMessage = errors[0];
        }
      }
        break;
      default:
        break;
    }
  }

  private subscribeToFormChanges(): void {
    this.form.valueChanges
      .pipe(
        filter(() => !!this.errorMessage),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(() => {
        this.errorMessage = null;
      });
  }

  public onOpenOrganizationModal(): void {
    this.modalService.show(OrganizationSelectionModalComponent, {
      initialState: {
        onEntitySelected: (entity: Org) => this.onOrganizationSelected(entity),
        gridDataFetcher: (params: IServerSideGetRowsParamsExtended) => {
          params.request.filterModel.push(new FilterModel({
            filter: true,
            filterType: FilterTypes.Boolean,
            type: 'equals',
            key: 'active',
          }));
          this.store.dispatch(sharedActions.SearchFirms({ params }));
        },
      },
      class: 'entity-selection-modal',
    });
  }

  private onOrganizationSelected(organization: Org): void {
    this.form.patchValue({ organization: organization.name });
    this.onPrimaryOrgTypeChanged(organization.primaryOrgTypeId);
    this.orgId = organization.id;
    this.form.updateValueAndValidity();
  }

  private onPrimaryOrgTypeChanged(primaryOrgTypeId: number): void {
    if (primaryOrgTypeId === OrgType.QualifiedSettlementFund) {
      this.form.patchValue({
        organizationTypeId: primaryOrgTypeId
      });
      this.filterOrgTypesValues(p => p.id === OrgType.QualifiedSettlementFund);
    }
    else {
      this.filterOrgTypesValues();
    }
  }

  private filterOrgTypesValues(predicate: (value: IdValue) => boolean | null = null)
  {
    this.orgTypesValues$.subscribe(values => this.orgTypesValues = predicate == null ? values : values.filter(predicate));
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
