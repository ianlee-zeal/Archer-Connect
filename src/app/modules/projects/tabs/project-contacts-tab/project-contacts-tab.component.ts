/* eslint-disable no-restricted-globals */
/* eslint-disable no-param-reassign */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter, first } from 'rxjs/operators';

import { AppState } from '@shared/state';

import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';

import { GridId } from '@app/models/enums/grid-id.enum';
import { Store } from '@ngrx/store';
import { ModalService } from '@app/services';
import { GotoParentView } from '@app/modules/shared/state/common.actions';
import { LPMHelper } from '@app/helpers/lpm.helper';
import { Project } from '@app/models';
import * as selectors from '../../state/selectors';
import * as actions from '../../state/actions';

@Component({
  selector: 'app-project-contacts-tab',
  templateUrl: './project-contacts-tab.component.html',
  styleUrls: ['./project-contacts-tab.component.scss'],
})
export class ProjectContactsTabComponent implements OnInit {
  public readonly gridId: GridId = GridId.ProjectContacts;

  readonly actionBar$ = this.store.select(selectors.actionBar);

  public project$ = this.store.select(selectors.item);

  public ngUnsubscribe$ = new Subject<void>();
  public projectId: number;

  constructor(
    public store: Store<AppState>,
    public route: ActivatedRoute,
    public modalService: ModalService,
  ) {
  }

  ngOnInit(): void {
    this.actionBar$.pipe(first())
      .subscribe((actionBar: ActionHandlersMap) => this.store.dispatch(actions.UpdateActionBar({ actionBar: this.getActionBar(actionBar) })));

    this.project$
      .pipe(
        filter((item: Project) => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((item: Project) => {
        this.projectId = item.id;
      });
  }

  private getActionBar(actionBar: ActionHandlersMap): ActionHandlersMap {
    return {
      ...actionBar,
      back: () => this.onBackClicked(),
      viewInLPM: { callback: () => LPMHelper.viewInLPM('/#case-details', { caseId: this.projectId }) },
    };
  }

  private onBackClicked(): void {
    this.store.dispatch(GotoParentView());
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));

    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
