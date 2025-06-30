import { Component } from '@angular/core';

import { EntityTypeEnum } from '@app/models/enums';
import * as paymentsGridSelectors from '@app/modules/payments/state/selectors';
import { EntityPaymentsBase } from '@app/modules/payments/base';
import { Project } from '@app/models';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ProjectsCommonState } from '../state/reducer';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';

@Component({
  selector: 'app-project-payments',
  templateUrl: './project-payments.component.html',
})
export class ProjectPaymentsComponent extends EntityPaymentsBase<Project, ProjectsCommonState> {
  public readonly entityTypeId = EntityTypeEnum.Projects;
  public readonly entity$ = this.store.select(selectors.item);
  public readonly actionBar$ = this.store.select(paymentsGridSelectors.actionBar);

  protected onUpdateActionBar(actionBar: ActionHandlersMap): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar }));
  }

  ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
