import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { EntityTypeEnum } from '@app/models/enums';
import { takeUntil, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { communicationListSelectors } from '@app/modules/call-center/communication-list/state/selectors';
import { ClaimantDetailsState } from '../state/reducer';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import { GotoParentView } from '../../../shared/state/common.actions';

@Component({
  selector: 'app-communication-tab',
  templateUrl: './communication-tab.component.html',
  styleUrls: ['./communication-tab.component.scss'],
})
export class CommunicationTabComponent implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject<void>();

  public readonly entityType = EntityTypeEnum.Clients;

  public actionBar$ = this.store.select(communicationListSelectors.actionBar);
  public item$ = this.store.select(selectors.item);

  private readonly actionBar: ActionHandlersMap = { back: () => this.cancel() };

  get selector(): string {
    return this.elementRef?.nativeElement?.tagName.toLowerCase();
  }

  constructor(
    private store: Store<ClaimantDetailsState>,
    private readonly elementRef: ElementRef,
  ) { }

  ngOnInit() {
    this.actionBar$.pipe(
      filter(actionBar => !!actionBar),
      takeUntil(this.ngUnsubscribe$),
    )
      .subscribe(actionBar => {
        this.store.dispatch(actions.UpdateClaimantsActionBar({
          actionBar: {
            ...actionBar,
            ...this.actionBar,
          },
        }));
      });
  }

  private cancel(): void {
    this.store.dispatch(GotoParentView());
  }

  ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateClaimantsActionBar({ actionBar: null }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
