import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionsSubject, Store } from '@ngrx/store';
import { CommunicationHubState } from '../state/reducer';
import * as selectors from '../state/selectors';
import { Subject, filter, takeUntil } from 'rxjs';
import { JiraIssue } from '@app/models/jira/jira-issue';
import * as actions from '../state/actions';
import { JiraComment } from '@app/models/jira/jira-comment';
import { ofType } from '@ngrx/effects';

@Component({
  selector: 'message-view',
  templateUrl: './message-view.component.html',
  styleUrl: './message-view.component.scss'
})
export class MessageViewComponent implements OnInit {
  public issue$ = this.store.select(selectors.issue);
  public comments$ = this.store.select(selectors.comments);

  private ngUnsubscribe$ = new Subject<void>();

  issue: JiraIssue = null;

  comments: JiraComment[] = [];

  showFullScreenIcon: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private readonly store: Store<CommunicationHubState>,
    private readonly actionsSubj: ActionsSubject,
  ) { }

  public ngOnInit(): void {
    this.issue$
    .pipe(
      filter(issue => !!issue),
      takeUntil(this.ngUnsubscribe$)
    )
    .subscribe(issue => {
      this.issue = issue;
    });

    this.comments$
    .pipe(
      filter(comments => !!comments),
      takeUntil(this.ngUnsubscribe$)
    )
    .subscribe(comments => {
      this.comments = comments;
    });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(
        actions.CreateJiraReplySuccess,
      ),
    ).subscribe(() => {
      this.store.dispatch(actions.LoadMessageComments({ ticketKey: this.route.snapshot.params.id }));
    });

    this.store.dispatch(actions.LoadMessage({ ticketKey: this.route.snapshot.params.id }));
    this.store.dispatch(actions.LoadMessageComments({ ticketKey: this.route.snapshot.params.id }));
  }

  public goToInbox(): void {
    this.router.navigate(['/andi-messaging/tabs/inbox']);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
