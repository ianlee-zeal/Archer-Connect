import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ActionsSubject, Store } from '@ngrx/store';
import { filter, takeUntil } from 'rxjs/operators';
import { ofType } from '@ngrx/effects';
import { Subject } from 'rxjs';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { IdValue } from '@app/models';
import { BillingRule, BillingRuleRelatedServiceGridItem, OutcomeBasedPricing } from '@app/models/billing-rule';
import { VariablePricingFormValue } from '@app/modules/shared/variable-pricing-form/variable-pricing-form.component';
import { GridId } from '@app/models/enums/grid-id.enum';
import * as projectSelectors from '@app/modules/projects/state/selectors';
import * as projectActions from '../../state/actions';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import { BillingRuleFormComponent } from '../billing-rule-form/billing-rule-form.component';
import { FormatService } from '../services/format.service';
import { CommonHelper } from '@app/helpers';

@Component({
  selector: 'app-billing-rule-details',
  templateUrl: './billing-rule-details.component.html',
  styleUrls: ['./billing-rule-details.component.scss'],
})
export class BillingRuleDetailsComponent implements OnInit, OnDestroy {
  @ViewChild(BillingRuleFormComponent) billingRuleForm: BillingRuleFormComponent;

  private ngUnsubscribe$ = new Subject<void>();

  private actionBarActionHandlers: ActionHandlersMap = {
    cancel: {
      callback: () => this.cancelEditing(),
      hidden: () => !this.canEdit,
    },
    edit: {
      callback: () => this.startEditing(),
      hidden: () => this.canEdit,
      disabled: () => !this.billingRule,
      permissions: PermissionService.create(PermissionTypeEnum.BillingRule, PermissionActionTypeEnum.Edit),
    },
    save: {
      callback: () => this.saveBillingRule(),
      hidden: () => !this.canEdit,
      disabled: () => !this.billingRuleForm?.isFormValid,
      awaitedActionTypes: [actions.UpdateBillingRuleSuccess.type, actions.Error.type],
    },
    back: { callback: () => this.navigateToList() },
  };

  public readonly billingRule$ = this.store.select(selectors.billingRule);
  public readonly project$ = this.store.select(projectSelectors.item);
  public billingRule: BillingRule;
  public canEdit = false;
  public relatedServices: BillingRuleRelatedServiceGridItem[] = [];
  public outcomeBasedPricings: OutcomeBasedPricing[];
  public variablePricing: VariablePricingFormValue;
  public readonly additionalPageItemsCountValues = [5];

  public billingTriggersList: IdValue[] = [];
  public pricingTriggersList: IdValue[] = [];
  public gridId = GridId;
  public tortId: number;

  constructor(
    private store: Store<any>,
    private router: Router,
    private route: ActivatedRoute,
    private actionsSubj: ActionsSubject,
    public format: FormatService,
  ) { }

  public ngOnInit(): void {
    this.billingRule$.pipe(
      filter(b => !!b),
    ).subscribe(b => {
      this.billingRule = b;
      const services = this.billingRule.relatedServices;

      this.createDefaultFee();
      this.relatedServices = BillingRuleRelatedServiceGridItem.convertToItems(services);
      this.outcomeBasedPricings = this.billingRule.outcomeBasedPricings;

      this.billingTriggersList = this.billingRule.billingTriggers.map(value => value.triggerType);
      this.pricingTriggersList = this.billingRule.pricingTriggers.map(value => value.triggerType);

      this.variablePricing = {
        tieredPricings: b.details?.tieredPricings ?? [],
        percentageOfSavingsPricings: b.details?.percentageOfSavingsPricings ?? [],
        slidingScalePricings: b.details?.slidingScalePricings ?? [],
        variablePricingType: b.variablePricingType,
        variablePricingTypeId: b.variablePricingTypeId,
        defaultPrice: b.details?.defaultPrice,
        defaultPriceType: b.details?.defaultPriceType,
      };
    });

    this.actionsSubj.pipe(
      ofType(actions.UpdateBillingRuleSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.cancelEditing();
    });

    this.project$.subscribe(project => {
      this.tortId = project?.tortId;
    });

    this.store.dispatch(projectActions.UpdateActionBar({ actionBar: this.actionBarActionHandlers }));
    const brId = Number(this.route.snapshot.params.id);
    this.store.dispatch(actions.GetBillingRule({ id: brId }));
  }

  private cancelEditing(): void {
    this.canEdit = false;
    this.store.dispatch(actions.GetBillingRule({ id: this.billingRule.id }));
  }

  private startEditing(): void {
    this.canEdit = true;
  }

  private saveBillingRule(): void {
    this.billingRuleForm.onSave();
  }

  private navigateToList(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  // eslint-disable-next-line consistent-return
  private createDefaultFee() {
    if (this.billingRule.feeSplit && this.billingRule.feeSplits && this.billingRule.feeSplits.length) {
      return null;
    }

    this.billingRule.feeSplits = [{
      id: CommonHelper.createEntityUniqueId(),
      feePercentage: 1,
      org: this.billingRule.org,
      orgName: this.billingRule.org?.name,
      billTo: this.billingRule.billTo,
    }];
  }

  public ngOnDestroy(): void {
    this.store.dispatch(projectActions.UpdateActionBar({ actionBar: null }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
