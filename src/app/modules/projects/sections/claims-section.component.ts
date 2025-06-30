import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as selectors from '../state/selectors';
import * as fromProjects from '../state';
import * as actions from '../state/actions';
import * as commonActions from '@app/modules/shared/state/common.actions';
import { Actions } from '@ngrx/effects';
import { ContextBarElement } from '@app/entities/context-bar-element';

@Component({
  selector: 'app-Claims-section',
  template: `
  <div class="page">
    <app-context-bar [title]="'Claims'"></app-context-bar>
    <app-claims-power-bi></app-claims-power-bi>
  </div>
  `,
})
export class ClaimsSectionComponent implements OnInit, OnDestroy {
  // @ViewChild(ClaimsDashboardComponent) dashboard: ClaimsDashboardComponent;

  public readonly item$ = this.store.select(selectors.item);
  public readonly contextBar$ = this.store.select(selectors.contextBar);
  private readonly ngUnsubscribe$ = new Subject<void>();
  public projectId;

  private readonly actionBar: ActionHandlersMap = {
    clearFilter: {
      // callback: () => this.dashboard?.clearFilters(),
      // disabled: () => !this.dashboard?.hasActiveFilter,
    },
    back: () => this.store.dispatch(commonActions.GotoParentView('projects')),
  };

  constructor(
    private readonly store: Store<fromProjects.AppState>,
    private actions$: Actions
  ) {

  }

  ngOnInit() {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: this.actionBar }));
    this.addContextBarListener();
  }

  private addContextBarListener(): void {
    this.contextBar$.pipe(
      takeUntil(this.ngUnsubscribe$),
    )
      .subscribe((contextBar: ContextBarElement[]) => {
        if (contextBar) {
          this.projectId = contextBar.find(obj => obj['column'] == 'ID').valueGetter()
        }
      });
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));
  }
}
