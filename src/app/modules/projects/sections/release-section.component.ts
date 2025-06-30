import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ReleaseDashboardComponent } from '@app/modules/liens-dashboards/release-dashboard/release-dashboard.component';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { Store } from '@ngrx/store';
import * as selectors from '../state/selectors';
import * as fromProjects from '../state';
import * as actions from '../state/actions';
import * as commonActions from '@app/modules/shared/state/common.actions';

@Component({
  selector: 'app-release-section',
  template: `
  <ng-container *ngIf="item$ | async as item">
    <app-release-dashboard [projectId]=item.id></app-release-dashboard>
  </ng-container>
  `,
})
export class ReleaseSectionComponent implements OnInit, OnDestroy {
  @ViewChild(ReleaseDashboardComponent) dashboard: ReleaseDashboardComponent;

  public item$ = this.store.select(selectors.item);

  private readonly actionBar: ActionHandlersMap = {
    clearFilter: {
      callback: () => this.dashboard?.clearFilters(),
      disabled: () => !this.dashboard?.hasActiveFilter,
    },
    back: () => this.store.dispatch(commonActions.GotoParentView('projects')),
  };

  constructor(private readonly store: Store<fromProjects.AppState>) {

  }

  ngOnInit() {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: this.actionBar }));
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));
  }
}
