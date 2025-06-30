/* eslint-disable no-param-reassign */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Validators, UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { ActionsSubject, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, first, takeUntil } from 'rxjs/operators';
import { Editable } from '@app/modules/shared/_abstractions/editable';
import { DocumentType, EntityTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { IdValue, Org } from '@app/models';
import * as services from '@app/services';
import { PermissionService } from '@app/services';
import * as commonActions from '@app/modules/shared/state/common.actions';
import * as fromOrgs from '@app/modules/admin/user-access-policies/orgs/state';
import * as orgActions from '@app/modules/admin/user-access-policies/orgs/state/actions';
import { Document } from '@app/models/documents';
import { sharedActions } from 'src/app/modules/shared/state/index';
import * as fromRoot from '@app/state';
import * as rootActions from '@app/state/root.actions';
import { ofType } from '@ngrx/effects';
import { OrgPaymentBatchTypeEnum } from '@app/models/enums/org-payment-batch-type.enum';
import * as actions from '../state/actions';
import { OrganizationTabHelper } from '../../user-access-policies/orgs/organization-tab.helper';
import { CheckMemoState } from './check-memo-state';

interface IOrgPaymentSettingsFormValue {
  nameOnCheck: string;
  erpVendorName: string;
  defaultCheckMemo: string;
  batchPayments: IdValue;
  frequency: IdValue;
  scheduling: string;
  advancedPaymentInstructionsDocument: Document;
}

@Component({
  selector: 'app-org-payment-settings',
  templateUrl: './org-payment-settings.component.html',
  styleUrls: ['./org-payment-settings.component.scss'],
})
export class OrgPaymentSettingsComponent extends Editable implements OnInit, OnDestroy {
  public readonly currentOrg$ = this.store.select(fromOrgs.item);
  public readonly batchPaymentsOptions$ = this.store.select(fromRoot.batchPaymentsOptions);
  public readonly frequencyOptions$ = this.store.select(fromRoot.frequencyOptions);

  private readonly ngUnsubscribe$ = new Subject<void>();

  public readonly form = new UntypedFormGroup({
    nameOnCheck: new UntypedFormControl('', [Validators.minLength(4), Validators.maxLength(100)]),
    erpVendorName: new UntypedFormControl('', [Validators.maxLength(100)]),
    defaultCheckMemo: new UntypedFormControl(null),
    batchPayments: new UntypedFormControl(null, Validators.required),
    frequency: new UntypedFormControl(null),
    scheduling: new UntypedFormControl(null),
    advancedPaymentInstructionsDocument: new UntypedFormControl(null),
  });

  public readonly checkMemoState = new CheckMemoState(this.form);
  public readonly documentTypeEnum = DocumentType;
  public currentOrg: Org;
  public entityTypeOrg = EntityTypeEnum.Organizations;

  constructor(
    private readonly store: Store<any>,
    private readonly toaster: services.ToastService,
    private readonly permissionService: PermissionService,
    private readonly actionsSubject: ActionsSubject,
  ) {
    super();
  }

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public get hasEditNameOnCheckPermission(): boolean {
    return this.permissionService.canEdit(PermissionTypeEnum.NameOnCheck);
  }

  public get hasEditERPVendorNamePermission(): boolean {
    return this.permissionService.canEdit(PermissionTypeEnum.ERPVendorName);
  }

  protected get hasChanges(): boolean {
    if (!this.canEdit) {
      return false;
    }

    return this.validationForm.dirty || !this.validationForm.pristine;
  }

  public ngOnInit(): void {
    this.initComponentState();
    this.updateActionBar();
    this.setHeaderTitle();

    this.subscribeToActions();
    this.subscribeToFormChange();
    this.subscribeToCurrentOrg();

    this.store.dispatch(rootActions.GetBatchPaymentOptions());
    this.store.dispatch(rootActions.GetFrequencyOptions());
  }

  public onSave(): void {
    if (this.validate()) {
      this.store.dispatch(orgActions.SaveOrg({ callback: () => { this.canEdit = false; } }));
    } else {
      this.store.dispatch(commonActions.FormInvalid());
      this.toaster.showWarning('Form is not valid', 'Cannot save');
    }
  }

  public validate(): boolean {
    return super.validate();
  }

  public onDownloadDocument(): void {
    this.store.dispatch(sharedActions.documentsListActions.DownloadDocument({ id: this.currentOrg.paymentInstructionDoc.id }));
  }

  private subscribeToFormChange(): void {
    this.form.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((value: IOrgPaymentSettingsFormValue) => {
        const orgPatch: Partial<Org> = {
          paymentGroupType: value.batchPayments,
          paymentFrequency: value.frequency,
          paymentSchedulingNotes: value.scheduling,
          defaultCheckMemoFormat: value.defaultCheckMemo,
          paymentInstructionDoc: value.advancedPaymentInstructionsDocument,
          nameOnCheck: value.nameOnCheck,
          erpVendorName: value.erpVendorName,
        };

        this.store.dispatch(orgActions.UpdateOrg({ item: { ...this.currentOrg, ...orgPatch } }));
      });
  }

  private subscribeToCurrentOrg(): void {
    this.currentOrg$
      .pipe(
        filter(val => !!val),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(org => {
        this.currentOrg = org;
        this.checkMemoState.initCheckMemos(org);
      });
  }

  private initComponentState(): void {
    this.currentOrg$
      .pipe(
        first(org => !!org),
      ).subscribe(org => {
        this.currentOrg = org;

        this.checkMemoState.initCheckMemos(org);

        const patch: IOrgPaymentSettingsFormValue = {
          nameOnCheck: this.currentOrg.nameOnCheck,
          erpVendorName: this.currentOrg.erpVendorName,
          defaultCheckMemo: this.currentOrg.defaultCheckMemoFormat,
          batchPayments: this.currentOrg.paymentGroupType,
          frequency: this.currentOrg.paymentFrequency,
          scheduling: this.currentOrg.paymentSchedulingNotes,
          advancedPaymentInstructionsDocument: this.currentOrg.paymentInstructionDoc,
        };

        this.form.patchValue(patch, { emitEvent: false });
        this.form.updateValueAndValidity({ emitEvent: false });

        if (!patch.batchPayments) {
          this.setDefaultBatchPaymentsValue();
        }
      });
  }

  private onCancel(): void {
    if (this.canEdit) {
      this.canEdit = false;
      this.store.dispatch(orgActions.RefreshOrg());
    } else {
      OrganizationTabHelper.handleBackClick(this.store);
    }
  }

  private updateActionBar(): void {
    this.store.dispatch(actions.UpdateBankAccountsActionBar({
      actionBar: {
        edit: this.editAction(),
        save: {
          callback: () => this.onSave(),
          hidden: () => !this.canEdit,
          disabled: () => this.canLeave,
          awaitedActionTypes: [
            orgActions.SaveOrgComplete.type,
            orgActions.Error.type,
            actions.Error.type,
            commonActions.FormInvalid.type,
          ],
        },
        back: {
          callback: () => this.onCancel(),
          disabled: () => !this.canLeave,
        },
        cancel: {
          callback: () => this.onCancel(),
          hidden: () => !this.canEdit,
        },
      },
    }));
  }

  private setHeaderTitle(): void {
    this.store.select(fromOrgs.item)
      .pipe(first(org => !!org))
      .subscribe(org => {
        const headerTitle = OrganizationTabHelper.createTitle(org.name, 'Payment Instructions / Payment Settings');
        this.store.dispatch(actions.UpdateHeaderTitle({ headerTitle }));
      });
  }

  private subscribeToActions(): void {
    this.actionsSubject
      .pipe(
        ofType(orgActions.SaveOrgComplete),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(() => {
        this.canEdit = false;
      });
  }

  private setDefaultBatchPaymentsValue(): void {
    this.batchPaymentsOptions$
      .pipe(first(options => !!options && !!options.length))
      .subscribe(options => {
        const groupOption = options.find(o => o.id === OrgPaymentBatchTypeEnum.Group);
        this.form.controls.batchPayments.setValue(groupOption, { emitEvent: false });
      });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
