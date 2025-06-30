import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ActionsSubject, Store } from '@ngrx/store';
import { ProbateDetails } from '@app/models/probate-details';
import { PermissionService } from '@app/services';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import * as services from '@app/services';
import { ofType } from '@ngrx/effects';
import { Claimant } from '@app/models/claimant';
import { notesListSelectors } from '@app/modules/shared/state/notes-list/selectors';
import { PermissionActionTypeEnum, PermissionTypeEnum, ProductCategory } from '@app/models/enums';
import { NEW_ID } from '@app/helpers/constants';

import * as fromAuth from '@app/modules/auth/state';
import { PacketRequest } from '@app/models/packet-request';
import { Editable } from '../../shared/_abstractions/editable';
import { ClaimantDetailsState } from '../claimant-details/state/reducer';
import { ProbateServiceInformationComponent } from './probate-service-information/probate-service-information.component';
import * as selectors from '../claimant-details/state/selectors';
import * as actions from '../claimant-details/state/actions';
import { ActionHandlersMap } from '../../shared/action-bar/action-handlers-map';
import { AdditionalClaimantInformationComponent } from './additional-claimant-information/additional-claimant-information.component';
import { ProbatePaymentInformationComponent } from './probate-payment-information/probate-payment-information.component';
import { ReleasePacketTrackingComponent } from './release-packet-tracking/release-packet-tracking.component';

@Component({
  selector: 'app-probate-details',
  templateUrl: './probate-details.component.html',
  styleUrls: ['./probate-details.component.scss'],
})
export class ProbateDetailsComponent extends Editable implements OnInit {
  @ViewChild(ProbateServiceInformationComponent) probateServiceInformationComponent: ProbateServiceInformationComponent;
  @ViewChild(AdditionalClaimantInformationComponent) additionalClaimantInformationComponent: AdditionalClaimantInformationComponent;
  @ViewChild(ProbatePaymentInformationComponent) probatePaymentInformationComponent: ProbatePaymentInformationComponent;
  @ViewChild(ReleasePacketTrackingComponent) releasePacketTrackingComponent: ReleasePacketTrackingComponent;

  public claimant: Claimant;
  public probateDetails: ProbateDetails;
  protected hasChanges: boolean;
  private note: string;
  public claimantSummaryTotalAllocation: number | undefined;

  public readonly claimant$ = this.store.select(selectors.item);
  public readonly isProductDetailsLoaded$ = this.store.select(selectors.probateDetailsItem);
  public readonly note$ = this.store.select(notesListSelectors.editableNote);
  private readonly user$ = this.store.select(fromAuth.authSelectors.getUser);

  protected ngUnsubscribe$ = new Subject<void>();

  public form: UntypedFormGroup = new UntypedFormGroup({});
  public isEditNotesEnabled = true;

  public readNotesPermission = PermissionService.create(PermissionTypeEnum.ClientNotes, PermissionActionTypeEnum.Read);
  public editNotesPermission = PermissionService.create(PermissionTypeEnum.ClientNotes, PermissionActionTypeEnum.Edit);

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  get isNewProbate(): boolean {
    return this.probateDetails?.id === NEW_ID;
  }

  constructor(
    private readonly store: Store<ClaimantDetailsState>,
    private readonly toaster: services.ToastService,
    private readonly actionsSubj: ActionsSubject,
  ) {
    super();
  }

  private actionBar: ActionHandlersMap = {
    edit: {
      ...this.editAction(),
      callback: () => this.edit(),
      hidden: () => this.canEdit || this.isNewProbate,
      permissions: PermissionService.create(PermissionTypeEnum.ProbateDetails, PermissionActionTypeEnum.Edit),
    },
    addToProbate: {
      ...this.editAction(),
      callback: () => this.edit(),
      hidden: () => this.canEdit || !this.isNewProbate,
      permissions: PermissionService.create(PermissionTypeEnum.ProbateDetails, PermissionActionTypeEnum.Create),
    },
    save: {
      callback: () => this.onSave(),
      disabled: () => !this.validate(),
      hidden: () => !this.canEdit,
    },
    cancel: {
      callback: () => this.onCancel(),
      hidden: () => !this.canEdit,
    },
  };

  ngOnInit(): void {
    this.claimant$.pipe(
      filter(claimant => !!claimant),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(item => {
      this.claimant = item;
    });

    this.user$.pipe(
      filter(user => !!user),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(user => {
      this.isEditNotesEnabled = user.defaultOrganization?.isMaster;
    });

    this.isProductDetailsLoaded$
      .pipe(
        filter(probateDetails => !!probateDetails),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(probateDetails => {
        this.probateDetails = probateDetails;
      });

    this.store
      .select(selectors.claimantSummary)
      .pipe(
        filter(summary => !!summary),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(summary => {
        this.claimantSummaryTotalAllocation = summary?.totalAllocation;
      });

    this.note$.pipe(
      filter(note => !!note),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(note => {
      this.note = note.html;
    });

    this.actionsSubj
      .pipe(
        ofType(actions.CreateOrUpdateProbateDetailsSuccess),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(probateDetails => {
        this.store.dispatch(actions.GetClaimantServices({ clientId: this.claimant.id }));
        this.probateDetails = probateDetails.probateDetailsItem;
        this.canEdit = false;
        this.store.dispatch(actions.GetClaimantWorkflow({
          productCategoryId: ProductCategory.Probate,
          claimantId: this.probateDetails.clientId,
        }));
      });

    this.actionsSubj
      .pipe(
        ofType(actions.UpdateProbatePacketRequestsSuccess),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(({ packetRequests }) => {
        this.probateDetails.packetRequests = packetRequests || [];
      });

    this.store.dispatch(actions.UpdateClaimantsActionBar({ actionBar: this.actionBar }));
  }

  public validate() {
    return this.probateServiceInformationComponent?.validate()
      && this.probatePaymentInformationComponent.validate()
      && this.additionalClaimantInformationComponent.validate();
  }

  onProbateStageChanged(probateStageId: number) {
    this.probateDetails = { ...this.probateDetails, probateStageId };
  }

  onPacketRequestsSave(packetRequests: PacketRequest[]) {
    const probateId = this.probateDetails.id;
    PacketRequest.beforeSave(packetRequests);
    this.store.dispatch(actions.UpdateProbatePacketRequests({ probateId, packetRequests }));
  }

  private onCancel() {
    if (this.canEdit) {
      this.canEdit = false;
      if (this.probateServiceInformationComponent && this.probateServiceInformationComponent.form) {
        this.probateServiceInformationComponent.form.markAsPristine();
      }
      this.store.dispatch(actions.GetClaimantWorkflow({
        productCategoryId: ProductCategory.Probate,
        claimantId: this.probateDetails.clientId,
      }));
    }
  }

  protected onSave(): void {
    if (this.validate()) {
      const {
        productId,
        probateStageId,
        assignedToId,
        deathCertificateReceived,
        documentsApproved,
        estateOpened,
        willProbated,
        decendentHaveAWill,
        statusId,
        inactiveReasonId,
        inactiveDate,
        localCounselInvoice,
      } = this.probateServiceInformationComponent.form.getRawValue();

      const additionalClaimantInformationForm = this.additionalClaimantInformationComponent.form.getRawValue();
      const paymentInformationForm = this.probatePaymentInformationComponent.form.getRawValue();
      const { dateOfDeath: dod } = additionalClaimantInformationForm;

      const probateDetails = new ProbateDetails({
        id: this.probateDetails?.id,
        clientId: this.claimant.id,
        client: { ...this.claimant, dod },
        resolution: this.probateDetails?.resolution,
        stateOfAccident: this.probateDetails?.stateOfAccident,
        invoicedNotes: this.probateDetails?.invoicedNotes,
        note: this.isNewProbate ? this.note : null,
        assignedToId,
        deathCertificateReceived,
        documentsApproved,
        estateOpened,
        probateStageId,
        productId,
        willProbated,
        decendentHaveAWill,
        statusId,
        inactiveReasonId: this.probateServiceInformationComponent.isInactiveStatusSelected ? inactiveReasonId : null,
        inactiveDate: this.probateServiceInformationComponent.isInactiveStatusSelected ? inactiveDate : null,
        packetRequests: this.probateDetails?.packetRequests || [],
        localCounselInvoice,
        ...additionalClaimantInformationForm,
        ...paymentInformationForm,
      });

      this.store.dispatch(actions.CreateOrUpdateProbateDetails({ probateDetails }));
    } else {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
    this.canEdit = false;
    if (this.probateServiceInformationComponent && this.probateServiceInformationComponent.form) {
      this.probateServiceInformationComponent.form.markAsPristine();
    }

    this.store.dispatch(actions.UpdateClaimantsActionBar({ actionBar: null }));
  }
}
