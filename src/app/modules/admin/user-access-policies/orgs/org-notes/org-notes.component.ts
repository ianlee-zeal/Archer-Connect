import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';

import { PermissionService } from '@app/services';
import { EntityTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { filter, takeUntil } from 'rxjs/operators';
import { Org } from '@app/models';
import { ActionHandlersMap, ActionObject } from '@app/modules/shared/action-bar/action-handlers-map';
import * as selectors from '../state/index';
import * as actions from '../state/actions';
import { OrganizationTabHelper } from '../organization-tab.helper';

@Component({
  selector: 'app-org-notes',
  templateUrl: './org-notes.component.html',
  styleUrls: ['./org-notes.component.scss'],
})
export class OrgNotesComponent implements OnInit, OnDestroy {
  public entityTypeId = EntityTypeEnum.Organizations;
  public entityId: number;

  private org$ = this.store.select(selectors.item);

  private ngUnsubscribe$ = new Subject<void>();

  constructor(
    private readonly store: Store<selectors.AppState>,
  ) { }

  public ngOnInit(): void {
    this.org$.pipe(
      filter(org => !!org),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((org: Org) => {
      this.entityId = org.id;
    });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public onActionBarUpdated(actionBar: ActionHandlersMap): void {
    const actionBarNew = actionBar?.new as ActionObject;
    if (actionBarNew) {
      actionBarNew.permissions = PermissionService.create(PermissionTypeEnum.OrganizationNotes, PermissionActionTypeEnum.Create);
    }
    this.store.dispatch(actions.UpdateOrgsActionBar({ actionBar: { ...actionBar, back: () => OrganizationTabHelper.handleBackClick(this.store) } }));
  }
}
