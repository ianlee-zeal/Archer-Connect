import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { IdValue } from '@app/models';
import * as fromRoot from '@app/state';
import { ActionHandlersMap, ActionObject } from '@app/modules/shared/action-bar/action-handlers-map';
import { EntityTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { sharedActions } from '@app/modules/shared/state';
import { PermissionService } from '@app/services';
import { actions } from '../../state';
import * as selectors from '../../state/selectors';

@Component({
  selector: 'app-matter-notes',
  templateUrl: './matter-notes.component.html',
})
export class MatterNotesComponent implements OnInit, OnDestroy {
  protected ngUnsubscribe$ = new Subject<void>();
  public matter$ = this.store.select(selectors.matter);

  public matter: IdValue;
  public entityTypeId = EntityTypeEnum.Matter;
  public notePermissions;
  public entityId: number;

  constructor(
    protected store: Store<fromRoot.AppState>,
  ) {
  }

  public ngOnInit(): void {
    this.notePermissions = PermissionService.create(PermissionTypeEnum.MatterNotes, PermissionActionTypeEnum.Read);

    this.matter$
      .pipe(
        filter(matter => !!matter),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(matter => {
        this.entityId = matter.id;
      });
  }

  public onActionBarUpdated(actionBar: ActionHandlersMap): void {
    const actionBarNew = actionBar?.new as ActionObject;
    if (actionBarNew) {
      actionBarNew.permissions = PermissionService.create(PermissionTypeEnum.MatterNotes, PermissionActionTypeEnum.Create);
    }
    this.store.dispatch(actions.UpdateActionBar({ actionBar }));
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));
    this.store.dispatch(sharedActions.notesListActions.CloseEditMode());
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
