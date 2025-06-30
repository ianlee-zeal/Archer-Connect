import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state';
import { filter, first, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { BankAccount } from '@app/models/bank-account';
import * as commonActions from '@app/modules/shared/state/common.actions';
import { BankAccountDetailsComponent } from '../bank-account-details/bank-account-details.component';

import * as actions from '../state/actions';
import * as selectors from '../state/selectors';
import * as fromBankAccountActions from '../../user-access-policies/orgs/state/actions';
import * as fromUserAccessPolicies from '../../user-access-policies/orgs/state';

import * as services from '@app/services';

@Component({
  selector: 'app-bank-accounts-create',
  templateUrl: './bank-accounts-create.component.html',
  styleUrls: ['./bank-accounts-create.component.scss'],
})
export class BankAccountsCreateComponent implements OnInit, OnDestroy {
  @ViewChild(BankAccountDetailsComponent)
  bankAccountDetailsComponent: BankAccountDetailsComponent;

  private readonly organization$ = this.store.select(fromUserAccessPolicies.item);

  private orgId: number;

  public title: string;
  public bankAccount: BankAccount;
  private ngUnsubscribe$ = new Subject<void>();

  public actionBarActionHandlersForBankAccounts: ActionHandlersMap = {
    save: {
      callback: () => this.save(),
      disabled: () => false,
      awaitedActionTypes: [
        actions.CreateBankAccountComplete.type,
        actions.Error.type,
        commonActions.FormInvalid.type,
      ],
    },
    cancel: {
      callback: () => this.goToParentView(),
      disabled: () => false,
    },
    back: { callback: () => this.goToParentView() },
  };

  constructor(
    private store: Store<AppState>,
    private readonly toaster: services.ToastService,
  ) { }

  ngOnInit(): void {
    this.title = 'Create Bank Account';
    this.store.select(selectors.item).pipe(
      filter(x => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(bankAccount => {
      this.bankAccount = bankAccount;
    });

    this.organization$.pipe(
      filter(x => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(organization => {
      this.orgId = organization.id;
    });
  }

  private save(): void {
    if (this.bankAccountDetailsComponent.validate() && this.orgId){
      const bankAccountToCreate = this.bankAccountDetailsComponent.bankAccount;
      const dragAndDropComponent = this.bankAccountDetailsComponent.dragAndDropComponent;

      bankAccountToCreate.orgId = this.orgId;
      this.store.dispatch(actions.CreateBankAccount({ bankAccount: bankAccountToCreate, w9File: dragAndDropComponent ? dragAndDropComponent.selectedFile : null }));
    } else {
      this.store.dispatch(commonActions.FormInvalid());
    }
  }

  private goToParentView() {
    this.organization$.pipe(
      first(),
    ).subscribe(organization => {
      if (organization) {
        this.store.dispatch(fromBankAccountActions.GoToOrganizationBankAccounts({ organizationId: organization.id }));
      } else {
        this.store.dispatch(commonActions.GotoParentView());
      }
    });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
