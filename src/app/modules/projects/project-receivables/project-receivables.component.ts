import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { IDictionary } from '@app/models/utils';
import { ProjectReceivable } from '@app/models/projects/project-receivable/project-receivable';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import * as fromProjects from '../state';

@Component({
  selector: 'app-project-receivables',
  templateUrl: './project-receivables.component.html',
  styleUrls: ['./project-receivables.component.scss'],
})
export class ProjectReceivablesComponent implements OnInit, OnDestroy {
  private projectId: number;
  public changedItems: IDictionary<number, boolean>;
  public receivables: ProjectReceivable[];

  public readonly project$ = this.store.select(selectors.item);
  public readonly item$ = this.store.select(selectors.projectReceivables);
  public readonly changedItems$ = this.store.select(selectors.projectReceivablesModified);
  private readonly ngUnsubscribe$ = new Subject<void>();

  private readonly actionBar: ActionHandlersMap = {
    save: {
      callback: () => this.save(),
      disabled: () => !this.changedItems || !this.changedItems.count(),
    },
  };

  constructor(
    private readonly store: Store<fromProjects.AppState>,
  ) {}

  public ngOnInit(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: this.actionBar }));

    this.project$
      .pipe(filter(item => !!item), takeUntil(this.ngUnsubscribe$))
      .subscribe(item => {
        this.projectId = item.id;
        this.store.dispatch(actions.GetProjectReceivables({ id: this.projectId }));
      });

    this.item$
      .pipe(filter(item => !!item), takeUntil(this.ngUnsubscribe$))
      .subscribe(item => {
        this.receivables = item;
      });

    this.changedItems$
      .pipe(filter(item => !!item), takeUntil(this.ngUnsubscribe$))
      .subscribe(item => {
        this.changedItems = item;
      });
  }

  public expandSection(sectionIndex: number) {
    this.store.dispatch(actions.ExpandProjectReceivablesSection({ sectionIndex }));
  }

  public onCheck(sectionIndex: number, groupIndex: number, itemId: number, isChecked: boolean) {
    this.store.dispatch(actions.UpdateProjectReceivables({ sectionIndex, groupIndex, itemId, isChecked }));
  }

  public resetToDefault(sectionId: number, groupId: number) {
    this.store.dispatch(actions.SetProjectReceivablesToDefault({ projectId: this.projectId, sectionId, groupId }));
  }

  protected save() {
    this.store.dispatch(actions.SaveProjectReceivables({ id: this.projectId, changedItems: this.changedItems }));
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
