import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { Store } from '@ngrx/store';
import * as projectActions from '../../state/actions';
import * as actions from '../state/actions';
import { BillingRuleFormComponent } from '../billing-rule-form/billing-rule-form.component';

@Component({
  selector: 'app-billing-rule-creation',
  templateUrl: './billing-rule-creation.component.html',
})
export class BillingRuleCreationComponent implements OnInit, OnDestroy {
  @ViewChild(BillingRuleFormComponent) billingRuleForm: BillingRuleFormComponent;

  private actionBarActionHandlers: ActionHandlersMap = {
    cancel: { callback: () => this.navigateToList() },
    back: { callback: () => this.navigateToList() },
    save: {
      callback: () => this.saveBillingRule(),
      disabled: () => !this.billingRuleForm?.isFormValid,
      awaitedActionTypes: [actions.CreateBillingRuleSuccess.type, actions.Error.type],
    },
  };

  constructor(
    private store: Store<any>,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  public ngOnInit(): void {
    this.store.dispatch(projectActions.UpdateActionBar({ actionBar: this.actionBarActionHandlers }));
  }

  private navigateToList(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  private saveBillingRule(): void {
    this.billingRuleForm.onSave();
  }

  public ngOnDestroy(): void {
    this.store.dispatch(projectActions.UpdateActionBar({ actionBar: null }));
  }
}
