import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromProjects from '../state';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import { BankruptcyDashboardComponent } from '@app/modules/liens-dashboards/bankruptcy-dashboard/bankruptcy-dashboard.component';
import * as commonActions from '@app/modules/shared/state/common.actions';

@Component({
  selector: 'app-bankruptcy-section',
  template: `
  <ng-container *ngIf="item$ | async as item">
    <app-bankruptcy-dashboard [projectId]=item.id></app-bankruptcy-dashboard>
  </ng-container>
  `,
})
export class BankruptcySectionComponent implements OnInit, OnDestroy {
  @ViewChild(BankruptcyDashboardComponent) dashboard: BankruptcyDashboardComponent;


  public claimantId: number;

  public actionBar$ = this.store.select(selectors.actionBar);
  protected ngUnsubscribe$ = new Subject<void>();
  public item$ = this.store.select(selectors.item);

  private readonly actionBar: ActionHandlersMap = {
    clearFilter: {
      callback: () => this.dashboard?.clearFilters(),
      disabled: () => !this.dashboard?.hasActiveFilter,
    },
    back: () => this.store.dispatch(commonActions.GotoParentView('projects')),
  };

  constructor(private readonly store: Store<fromProjects.AppState>) {}

  ngOnInit() {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: this.actionBar }));
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));
  }
}
