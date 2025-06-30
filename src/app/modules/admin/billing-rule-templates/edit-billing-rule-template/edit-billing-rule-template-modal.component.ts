import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { Subject } from 'rxjs';
import { ActionsSubject, Store } from '@ngrx/store';
import * as fromShared from '@app/state';
import { filter, first, takeUntil } from 'rxjs/operators';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ofType } from '@ngrx/effects';
import { PermissionService, ServerErrorService, ModalService } from '@app/services';
import { BillingRuleTemplate } from '@app/models/billing-rule/billing-rule-template';
import { KeyValuePair } from '@app/models/utils';
import { BillingRuleTemplateDto } from '@app/models/billing-rule/billing-rule-template-dto';
import { RelatedServicesModalComponent } from '@app/modules/shared/entity-selection-modal/related-services-modal.component';
import { IdValue } from '@app/models';
import { ChipListOption } from '@app/models/chip-list-option';
import * as actions from '../state/actions';
import * as selectors from '../state/selectors';

export interface BillingRuleTemplateFormValue {
  name: string;
  description: string;
  status: IdValue;
  services: ChipListOption[];
  invoicingItem: IdValue;
  feeScope: IdValue;
  revRecItem: IdValue;
  revRecMethod: IdValue;
}

@Component({
  selector: 'app-edit-billing-rule-template-modal',
  templateUrl: './edit-billing-rule-template-modal.component.html',
  styleUrls: ['./edit-billing-rule-template-modal.component.scss'],
})
export class EditBillingRuleTemplateModalComponent implements OnInit, OnDestroy {
  public title: string;
  public billingRuleTemplateId: number;

  public editPermission = PermissionService.create(PermissionTypeEnum.BillingRuleTemplate, PermissionActionTypeEnum.Edit);
  public createPermission = PermissionService.create(PermissionTypeEnum.BillingRuleTemplate, PermissionActionTypeEnum.Create);
  public deletePermission = PermissionService.create(PermissionTypeEnum.BillingRuleTemplate, PermissionActionTypeEnum.Delete);
  public statuses$ = this.store.select(selectors.statuses);
  public services$ = this.store.select(selectors.services);
  public invoicingItems$ = this.store.select(selectors.invoicingItems);
  public revRecItems$ = this.store.select(selectors.revRecItems);
  public revRecMethods$ = this.store.select(selectors.revRecMethods);
  public billingRuleTemplate$ = this.store.select(selectors.billingRuleTemplate);

  public existingBillingRuleTemplate: BillingRuleTemplate;

  private ngUnsubscribe$ = new Subject<void>();

  public form: UntypedFormGroup = new UntypedFormGroup({
    name: new UntypedFormControl(null, [Validators.required]),
    description: new UntypedFormControl(null),
    status: new UntypedFormControl(null),
    services: new UntypedFormControl([]),
    invoicingItem: new UntypedFormControl(null),
    revRecItem: new UntypedFormControl(null),
    revRecMethod: new UntypedFormControl(null),
  });

  public readonly awaitedActionTypes = [
    actions.CreateBillingRuleTemplateSuccess,
    actions.UpdateBillingRuleTemplateSuccess,
    actions.Error,
  ];

  constructor(
    public modal: BsModalRef,
    private store: Store<fromShared.AppState>,
    private actionsSubj: ActionsSubject,
    private serverErrorService: ServerErrorService,
    private permissionService: PermissionService,
    private modalService: ModalService,
  ) {}

  public get isAllowedToSave(): boolean {
    return this.permissionService.has(this.createPermission) || this.permissionService.has(this.editPermission);
  }

  public ngOnInit(): void {
    this.store.dispatch(actions.GetBillingRuleTemplateStatuses());
    this.store.dispatch(actions.GetRevRecMethods());
    this.subscribeToActions();

    if (this.billingRuleTemplateId) {
      this.subscribeToBillingRuleTemplate();
      this.getExistingBillingRuleTemplate();
    }
  }

  public onOpenRelatedServicesModal(): void {
    const services: ChipListOption[] = this.form.controls.services.value;

    const selectedEntities: { key: string, value: string, selected: boolean }[] = services.map(service => ({
      key: service.id,
      value: service.name,
      selected: true,
    }));

    this.modalService.show(RelatedServicesModalComponent, {
      initialState: {
        selectedEntities,
        onEntitySelected: (entities: KeyValuePair<string, string>[]) => this.onServiceChanged(entities),
      },
      class: 'entity-selection-modal',
    });
  }

  public onSave(): void {
    const value: BillingRuleTemplateFormValue = this.form.value;

    const dto: BillingRuleTemplateDto = {
      id: this.billingRuleTemplateId,
      name: value.name,
      description: value.description,
      feeScopeId: value.feeScope.id,
      revRecItemId: value.revRecItem?.id,
      revRecMethodId: value.revRecMethod?.id,
      invoicingItemId: value.invoicingItem?.id,
      statusId: value.status?.id,
      relatedServices: [],
    };

    const servicesOpts: ChipListOption[] = value.services;

    dto.relatedServices = servicesOpts.map(o => {
      const [productCategoryId, productId] = o.id.split('-');
      return {
        productCategoryId: +productCategoryId,
        productId: +productId,
        billingRuleTemplateId: this.billingRuleTemplateId,
      };
    });

    if (this.billingRuleTemplateId) {
      this.store.dispatch(actions.UpdateBillingRuleTemplate({ dto }));
    } else {
      this.store.dispatch(actions.CreateBillingRuleTemplate({ dto }));
    }
  }

  public onDelete(): void {
    this.store.dispatch(actions.DeleteBillingRuleTemplate({ id: this.billingRuleTemplateId }));
  }

  public searchFn() {
    return true;
  }

  public searchInvoicingItems(term: string): void {
    this.store.dispatch(actions.SearchInvoicingItems({ searchTerm: term }));
  }

  public searchRevRecItems(term: string): void {
    this.store.dispatch(actions.SearchRevRecItems({ searchTerm: term }));
  }

  private onServiceChanged(services: KeyValuePair<string, string>[]): void {
    const chipListOptions: ChipListOption[] = services.map(s => ({ id: s.key, name: s.value, isRemovable: true }));
    this.form.patchValue({ services: chipListOptions });
    this.form.updateValueAndValidity();
  }

  private initForm(brt: BillingRuleTemplate): void {
    const formInitializer: BillingRuleTemplateFormValue = {
      name: brt.name,
      description: brt.description,
      services: brt.relatedServices.map(ChipListOption.serviceToModel),
      status: brt.status,
      feeScope: brt.feeScope,
      invoicingItem: brt.invoicingItem,
      revRecItem: brt.revRecItem,
      revRecMethod: brt.revRecMethod,
    };

    this.form.patchValue(formInitializer);
    this.form.updateValueAndValidity();
  }

  private subscribeToBillingRuleTemplate(): void {
    this.billingRuleTemplate$
      .pipe(
        filter(item => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(brt => {
        this.existingBillingRuleTemplate = brt;
        this.initForm(brt);
      });
  }

  private getExistingBillingRuleTemplate(): void {
    this.store.dispatch(actions.GetBillingRuleTemplate({ id: this.billingRuleTemplateId }));
  }

  private subscribeToActions(): void {
    this.actionsSubj.pipe(
      ofType(
        actions.CreateBillingRuleTemplateSuccess,
        actions.UpdateBillingRuleTemplateSuccess,
        actions.DeleteBillingRuleTemplateSuccess,
      ),
      first(),
    ).subscribe(() => {
      this.modal.hide();
    });

    this.actionsSubj.pipe(
      ofType(actions.Error),
      filter(action => typeof action.error !== 'string'),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(error => {
      this.serverErrorService.showServerErrors(this.form, error);
    });
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.ClearBillingRuleTemplate());
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
