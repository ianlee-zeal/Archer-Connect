import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';

import { PermissionService } from '@app/services';
import { EntityTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { filter, takeUntil } from 'rxjs/operators';
import { Project } from '@app/models';
import { ActionHandlersMap, ActionObject } from '@app/modules/shared/action-bar/action-handlers-map';
import { GotoParentView } from '@app/modules/shared/state/common.actions';
import * as selectors from '../../state/selectors';
import * as fromProjects from '../../state';
import * as actions from '../../state/actions';

@Component({
  selector: 'app-project-notes',
  templateUrl: './project-notes.component.html',
  styleUrls: ['./project-notes.component.scss'],
})
export class ProjectNotesComponent implements OnInit, OnDestroy {
  public entityTypeId = EntityTypeEnum.Projects;
  public entityId: number;

  private project$ = this.store.select(selectors.item);

  private ngUnsubscribe$ = new Subject<void>();

  constructor(
    private store: Store<fromProjects.AppState>,
  ) { }

  public ngOnInit(): void {
    this.project$.pipe(
      filter(project => !!project),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((project: Project) => {
      this.entityId = project.id;
    });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public onActionBarUpdated(actionBar: ActionHandlersMap): void {
    const actionBarNew = actionBar?.new as ActionObject;
    if (actionBarNew) {
      actionBarNew.permissions = PermissionService.create(PermissionTypeEnum.ProjectNotes, PermissionActionTypeEnum.Create);
    }
    this.store.dispatch(actions.UpdateActionBar({ actionBar: { ...actionBar, back: () => this.onCancel() } }));
  }

  private onCancel(): void {
    this.store.dispatch(GotoParentView());
  }
}
