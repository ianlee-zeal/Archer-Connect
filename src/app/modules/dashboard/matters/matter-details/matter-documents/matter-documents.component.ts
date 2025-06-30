import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { IdValue } from '@app/models';
import * as fromRoot from '@app/state';
import { EntityTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ActionHandlersMap, ActionObject } from '@app/modules/shared/action-bar/action-handlers-map';
import { PermissionService } from '@app/services';
import { actions } from '../../state';
import * as selectors from '../../state/selectors';

@Component({
  selector: 'app-matter-documents',
  templateUrl: './matter-documents.component.html',
})
export class MatterDocumentsComponent implements OnInit, OnDestroy {
  protected ngUnsubscribe$ = new Subject<void>();
  public matter$ = this.store.select(selectors.matter);
  public matter: IdValue;
  public entityTypeId: number = EntityTypeEnum.Matter;
  public entityId: number;
  public gridId: string = GridId.MatterDocuments;

  constructor(
    protected store: Store<fromRoot.AppState>,
  ) {
  }

  public ngOnInit(): void {
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
      actionBarNew.permissions = PermissionService.create(PermissionTypeEnum.MatterDocuments, PermissionActionTypeEnum.Create);
    }
    this.store.dispatch(actions.UpdateActionBar({ actionBar }));
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
