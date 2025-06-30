import { Component, OnInit } from '@angular/core';
import { TabItem } from '@app/models';
import { Store } from '@ngrx/store';
import { CommunicationHubState } from '../state/reducer';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import * as fromAuth from '@app/modules/auth/state';
import { Subject, filter, first, takeUntil } from 'rxjs';

@Component({
  selector: 'app-andi-messaging-section',
  templateUrl: './andi-messaging-section.component.html',
  styleUrl: './andi-messaging-section.component.scss'
})
export class ANDIMessagingSectionComponent implements OnInit {

  private ngUnsubscribe$ = new Subject<void>();

  private readonly user$ = this.store.select(fromAuth.authSelectors.getUser);
  public unresolvedCount$ = this.store.select(selectors.unresolvedCount);
  private countToolTipSubject = new Subject<string>();
  public countToolTip$ = this.countToolTipSubject.asObservable();

  public readonly tabs: TabItem[] = [
    {
      title: 'Inbox',
      link: './inbox',
      count: this.unresolvedCount$,
      countToolTip: this.countToolTip$,
      iconPath: 'assets/images/ic_inbox.svg',
    }
  ];

  constructor(
    private readonly store: Store<CommunicationHubState>,
  ) { }

  public ngOnInit(): void {
    this.user$
    .pipe(
      filter(user => !!user && !!user.selectedOrganization),
      first(),
      takeUntil(this.ngUnsubscribe$),
    )
    .subscribe(user => {
      this.store.dispatch(actions.GetUnresolvedCount({ userId: user.id }));
    });

    this.unresolvedCount$
    .pipe(
      filter(unresolvedCount => !!unresolvedCount),
      takeUntil(this.ngUnsubscribe$)
    )
    .subscribe(unresolvedCount => {
      this.countToolTipSubject.next(`${unresolvedCount} unresolved messages`);
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
