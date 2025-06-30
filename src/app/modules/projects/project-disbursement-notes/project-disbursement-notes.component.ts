import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';

import { EntityTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { filter, takeUntil } from 'rxjs/operators';
import { PermissionService } from '@app/services';
import { ActionHandlersMap, ActionObject } from '../../shared/action-bar/action-handlers-map';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import { ProjectsState } from '../state/reducer';

@Component({
  selector: 'app-project-disbursement-notes',
  templateUrl: './project-disbursement-notes.component.html',
  styleUrls: ['./project-disbursement-notes.component.scss'],
})
export class ProjectDisbursementNotesComponent implements OnInit, OnDestroy {
  public entityTypeId = EntityTypeEnum.ProjectDisbursementNotes;
  public additionalEntityTypeIds = [EntityTypeEnum.DisbursementGroupClaimant];
  public entityId: number;

  public project$ = this.store.select(selectors.item);

  private ngUnsubscribe$ = new Subject<void>();

  constructor(
    private store: Store<ProjectsState>,
  ) { }

  public ngOnInit(): void {
    this.project$.pipe(
      filter(currentProject => !!currentProject),
      takeUntil(this.ngUnsubscribe$),
    )
      .subscribe(currentProject => {
        this.entityId = currentProject.id;
      });
  }

  public onActionBarUpdated(actionBar: ActionHandlersMap): void {
    const actionBarNew = actionBar?.new as ActionObject;
    if (actionBarNew) {
      actionBarNew.permissions = PermissionService.create(PermissionTypeEnum.ProjectDisbursementNotes, PermissionActionTypeEnum.Create);
    }
    this.store.dispatch(actions.UpdateActionBar({ actionBar }));
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
