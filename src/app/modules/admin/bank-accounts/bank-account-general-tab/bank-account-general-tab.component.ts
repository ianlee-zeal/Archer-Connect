import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { BankAccount } from '@app/models/bank-account';
import { ContextBarElement } from '@app/entities/context-bar-element';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import * as selectors from '../state/selectors';
import { AppState } from '../../../../state/index';

@Component({
  selector: 'app-bank-account-general-tab',
  templateUrl: './bank-account-general-tab.component.html',
  styleUrls: ['./bank-account-general-tab.component.scss'],
})
export class BankAccountGeneralTabComponent implements OnInit, OnDestroy {
  public title: string;
  public bankAccount: BankAccount;
  private ngUnsubscribe$ = new Subject<void>();
  public headerElements: ContextBarElement[];
  public readonly notesPermission = PermissionService.create(PermissionTypeEnum.BankAccountNotes, PermissionActionTypeEnum.Read);

  public actionBar$ = this.store.select(selectors.actionBar);

  constructor(private store: Store<AppState>) { }

  public ngOnInit(): void {
    this.store.select(selectors.itemDetailsHeader).pipe(
      filter(item => !!item),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(bankAccount => {
      this.bankAccount = bankAccount;
      this.title = this.bankAccount.name;
      this.headerElements = [
        { column: 'Status', valueGetter: () => (this.bankAccount.status ? this.bankAccount.status.name : '') },
        { column: 'Account', valueGetter: () => this.bankAccount.hiddenAccountNumber },
      ];
    });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
