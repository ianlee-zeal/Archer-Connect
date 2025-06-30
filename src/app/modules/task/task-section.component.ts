import { Component } from '@angular/core';
import { TabItem } from '@app/models';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { AppState } from '@app/state';
import { Store } from '@ngrx/store';
import * as selectors from './state/selectors';

@Component({
  selector: 'app-task-section',
  templateUrl: './task-section.component.html',
})
export class TasksSectionComponent {
  public actionbar$ = this.store.select(selectors.actionBar);
  protected readonly tabsUrl = './tabs';

  public title: string = 'Task Management';

  public readonly tabs: TabItem[] = [
    {
      title: 'Task Management',
      link: `${this.tabsUrl}/task-management`,
      permission: PermissionService.create(PermissionTypeEnum.GlobalDisbursementSearch, PermissionActionTypeEnum.Read),
    },

  ];

  constructor(
    private readonly store: Store<AppState>,
  ) {
  }
}
