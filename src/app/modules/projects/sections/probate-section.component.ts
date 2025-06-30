import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ProbateDashboardComponent } from '@app/modules/liens-dashboards/probate-dashboard/probate-dashboard.component';

import * as fromProjects from '../state';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import * as commonActions from '@app/modules/shared/state/common.actions';

@Component({
  selector: 'app-probate-section',
  template: `
  <ng-container *ngIf="item$ | async as item">
    <app-probate-dashboard [projectId]=item.id></app-probate-dashboard>
  </ng-container>
  `,
})
export class ProbateSectionComponent implements OnInit, OnDestroy {
  @ViewChild(ProbateDashboardComponent) dashboard: ProbateDashboardComponent;

  public item$ = this.store.select(selectors.item);

  private readonly actionBar: ActionHandlersMap = {
    clearFilter: {
      callback: () => this.dashboard?.clearFilters(),
      disabled: () => !this.dashboard?.hasActiveFilter,
    },
    back: () => this.store.dispatch(commonActions.GotoParentView('projects')),
  };

  constructor(private store: Store<fromProjects.AppState>) {
  }

  ngOnInit() {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: this.actionBar }));
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));
  }
}
