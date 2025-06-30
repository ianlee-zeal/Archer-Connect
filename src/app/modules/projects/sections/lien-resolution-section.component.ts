import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { LienResolutionDashboardComponent } from '@app/modules/liens-dashboards/lien-resolution-dashboard/lien-resolution-dashboard.component';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';

import * as fromProjects from '../state';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import * as commonActions from '@app/modules/shared/state/common.actions';

@Component({
  selector: 'app-lien-resolution-section',
  template: `
  <ng-container *ngIf="item$ | async as item">
    <app-lien-resolution-dashboard [projectId]=item.id></app-lien-resolution-dashboard>
  </ng-container>
  `,
})
export class LienResolutionSectionComponent implements OnInit, OnDestroy {
  @ViewChild(LienResolutionDashboardComponent) dashboard: LienResolutionDashboardComponent;

  public readonly item$ = this.store.select(selectors.item);

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
