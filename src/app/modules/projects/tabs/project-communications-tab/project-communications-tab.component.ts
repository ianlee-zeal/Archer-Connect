import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { EntityTypeEnum } from '@app/models/enums';
import { Store } from '@ngrx/store';
import { RelatedPage } from '@app/modules/shared/grid-pager';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { communicationListSelectors } from '@app/modules/call-center/communication-list/state/selectors';
import * as actions from '../../state/actions';
import * as fromProjects from '../../state';
import * as selectors from '../../state/selectors';

@Component({
  selector: 'app-project-communications-tab',
  templateUrl: './project-communications-tab.component.html',
})
export class ProjectCommunicationsTabComponent implements OnInit, OnDestroy {
  public entityType = EntityTypeEnum.Projects;
  public relatedPage = RelatedPage.ProjectCommunications;

  public actionBar$ = this.store.select(communicationListSelectors.actionBar);
  public item$ = this.store.select(selectors.item);
  public ngUnsubscribe$ = new Subject<void>();

  get selector(): string {
    return this.elementRef?.nativeElement?.tagName.toLowerCase();
  }

  constructor(
    private readonly store: Store<fromProjects.AppState>,
    private readonly elementRef: ElementRef,
  ) { }

  ngOnInit() {
    this.actionBar$.pipe(
      filter(actionBar => !!actionBar),
      takeUntil(this.ngUnsubscribe$),
    )
      .subscribe(actionBar => {
        this.store.dispatch(actions.UpdateActionBar({ actionBar: { ...actionBar } }));
      });
  }

  ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
