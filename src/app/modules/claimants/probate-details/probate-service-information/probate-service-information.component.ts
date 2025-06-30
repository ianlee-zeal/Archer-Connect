import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { EventEmitter, OnDestroy, Component, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { filter, first, takeUntil } from 'rxjs/operators';

import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { User } from '@app/models';
import { ProbateDetails } from '@app/models/probate-details';

import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { ProductCategory, EntityTypeEnum, StatusEnum, PermissionActionTypeEnum, PermissionTypeEnum, StagesEnum } from '@app/models/enums';
import { Subject } from 'rxjs';
import { Claimant } from '@app/models/claimant';
import { ModalService, PermissionService } from '@app/services';
import { UserSelectionModalComponent } from '@app/modules/shared/entity-selection-modal/user-selection-modal.component';
import * as rootSelectors from '@app/state/index';
import * as rootActions from '@app/state/root.actions';
import { CommonHelper } from '@app/helpers';
import { GetInactiveReasons } from '../../claimant-details/state/actions';
import * as selectors from '../../claimant-details/state/selectors';
import * as actions from '../../claimant-details/state/actions';
import { ClaimantDetailsState } from '../../claimant-details/state/reducer';

@Component({
  selector: 'app-probate-service-information',
  templateUrl: './probate-service-information.component.html',
  styleUrls: ['./probate-service-information.component.scss'],
})
export class ProbateServiceInformationComponent extends ValidationForm implements OnInit, OnChanges, OnDestroy {
  @Input() public canEdit: boolean = true;
  @Input() public claimant: Claimant;
  @Input() public probateDetails: ProbateDetails;

  @Output() readonly probateStageChanged = new EventEmitter<number>();

  public localCounselContacts: string = '';
  public privateCounselContacts: string = '';

  private archerId: number;
  private probateDetailsId: number;

  get isInactiveStatusSelected(): boolean {
    return this.form && this.form.get('statusId').value === StatusEnum.ProbateInactive;
  }

  get hasEditProbateStatusPermission(): boolean {
    return this.permissionService.has(PermissionService.create(PermissionTypeEnum.ProbateDetails, PermissionActionTypeEnum.EditProbateStatus));
  }

  public form: UntypedFormGroup = new UntypedFormGroup({
    productId: new UntypedFormControl('', Validators.required),
    probateStageId: new UntypedFormControl('', Validators.required),
    assignedTo: new UntypedFormControl(''),
    assignedToId: new UntypedFormControl(''),
    deathCertificateReceived: new UntypedFormControl(''),
    willProbated: new UntypedFormControl(''),
    decendentHaveAWill: new UntypedFormControl(''),
    estateOpened: new UntypedFormControl(''),
    documentsApproved: new UntypedFormControl(''),
    statusId: new UntypedFormControl(''),
    inactiveReasonId: new UntypedFormControl(''),
    inactiveDate: new UntypedFormControl(''),
    localCounselInvoice: new UntypedFormControl(''),
  });

  public get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public probateServiceTypes$ = this.store.select(selectors.probateServiceTypes);
  public probateStages$ = this.store.select(selectors.probateStages);
  public inactiveReasons$ = this.store.select(selectors.inactiveReasons);
  public probateAssignUser$ = this.store.select(selectors.probateAssignUser);
  public probateStatuses$ = this.store.select(rootSelectors.statusesByEntityType({ entityType: EntityTypeEnum.Probates }));
  public archerId$ = this.store.select(selectors.archerId);
  private ngUnsubscribe$ = new Subject<void>();

  constructor(
    private readonly store: Store<ClaimantDetailsState>,
    private readonly modalService: ModalService,
    private readonly permissionService: PermissionService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribeToProbateAssignUser();
    this.subscribeToArcherId();
    this.store.dispatch(rootActions.GetStatuses({ entityType: EntityTypeEnum.Probates }));
    this.store.dispatch(GetInactiveReasons({ entityTypeId: EntityTypeEnum.Probates }));

    const isEditingExistingProbate = this.probateDetails.id !== -1;
    if (!isEditingExistingProbate) {
      this.form.controls.statusId.setValue(StatusEnum.ProbateActive, { emitEvent: false });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.probateDetails && this.probateDetails && this.probateDetails?.id !== this.probateDetailsId) {
      this.initData();
    }
  }

  private initData(): void {
    const { assignedToId, localCounselContacts = [], privateCounselContacts = [] } = this.probateDetails || {};

    if (assignedToId) {
      this.store.dispatch(actions.GetUserRequest({ userId: assignedToId }));
    } else {
      this.form.patchValue({ assignedTo: '' });
    }

    this.localCounselContacts = localCounselContacts.length > 0
      ? localCounselContacts.map(contact => `${contact.person.firstName} ${contact.person.lastName}`).join(', ')
      : '';

    this.privateCounselContacts = privateCounselContacts.length > 0
      ? privateCounselContacts.map(contact => `${contact.person.firstName} ${contact.person.lastName}`).join(', ')
      : '';

    this.store.dispatch(actions.GetProductTypesList({ productCategoryId: ProductCategory.ProbateService }));
    this.store.dispatch(actions.GetProbateStages());
    this.store.dispatch(actions.GetArcherOrgId());

    this.initForm();
    this.probateDetailsId = this.probateDetails.id;
  }

  private initForm() {
    this.form.patchValue({
      productId: this.probateDetails?.productId,
      probateStageId: this.probateDetails?.probateStageId,
      assignedToId: this.probateDetails?.assignedToId,
      deathCertificateReceived: this.probateDetails?.deathCertificateReceived,
      willProbated: this.probateDetails?.willProbated,
      decendentHaveAWill: this.probateDetails?.decendentHaveAWill,
      estateOpened: this.probateDetails?.estateOpened,
      documentsApproved: this.probateDetails?.documentsApproved,
      statusId: this.probateDetails.statusId,
      inactiveReasonId: this.probateDetails.inactiveReasonId,
      inactiveDate: CommonHelper.isNullOrUndefined(this.probateDetails.inactiveDate) ? new Date() : this.probateDetails.inactiveDate,
      localCounselInvoice: this.probateDetails?.localCounselInvoice,
    });

    if (!this.form.controls.decendentHaveAWill.value) {
      this.form.controls.willProbated.disable();
    }

    this.onProbateStatusChanged(this.probateDetails.statusId);
  }

  private subscribeToArcherId() {
    this.archerId$.pipe(
      filter(id => !!id),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(id => {
      this.archerId = id;
    });
  }

  private subscribeToProbateAssignUser() {
    this.probateAssignUser$.pipe(
      filter(user => !!user),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(user => {
      this.form.patchValue({ assignedTo: user.displayName });
    });
  }

  public onOpenModal(): void {
    this.modalService.show(UserSelectionModalComponent, {
      initialState: {
        onEntitySelected: (user: User) => this.onUserSelect(user),
        orgId: this.archerId,
      },
      class: 'user-selection-modal',
    });
  }

  private onUserSelect(user: User) {
    this.form.patchValue({
      assignedTo: user.displayName,
      assignedToId: user.id,
    });
    this.form.updateValueAndValidity();
    this.form.markAsDirty();
  }

  onProbateStatusChanged(status: number) {
    const inactiveReason = this.form.get('inactiveReasonId');
    if (status === StatusEnum.ProbateInactive && CommonHelper.isNullOrUndefined(inactiveReason.value)) {
      this.inactiveReasons$.pipe(
        first(),
      ).subscribe(inactiveReasons => {
        inactiveReason.setValue(inactiveReasons[0].id);
      });
    }
    ['inactiveReasonId', 'inactiveDate'].forEach(element => {
      const control = this.form.get(element);
      if (status === StatusEnum.ProbateActive) {
        control.clearValidators();
      } else if (status === StatusEnum.ProbateInactive) {
        control.setValidators(Validators.required);
      }
      control.updateValueAndValidity();
    });
  }

  onPobateStageChanged(stage: number) {
    if ([StagesEnum.ProbateNonProbate, StagesEnum.ProbateWithdrawn].includes(stage)) {
      this.form.patchValue({ statusId: StatusEnum.ProbateInactive });
    }
    this.probateStageChanged.emit(stage);
  }

  public onClear(controlName: string): void {
    this.form.patchValue({ [controlName]: null, [`${controlName}Id`]: null });
    this.form.updateValueAndValidity();
    this.form.markAsDirty();
  }

  filterFromSelectOptions(options: SelectOption[], id: number): SelectOption {
    if (!!options && options.length > 0) {
      const selectedOptions = options?.filter(i => i.id === id);
      const option: SelectOption = selectedOptions.length > 0 ? selectedOptions[0] : null;
      return option;
    }
    return null;
  }

  public decedentChanged() {
    if (this.form.controls.decendentHaveAWill.value) {
      this.form.controls.willProbated.enable();
    } else {
      this.form.controls.willProbated.disable();
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();

    this.store.dispatch(actions.UpdateHeader({ headerElements: [] }));
  }
}
