import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, QueryList, ViewChildren } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';
import { CommunicationHubState } from '../state/reducer';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import { takeUntil, Subject, filter, first, map, startWith } from 'rxjs';
import { JiraIssue } from '@app/models/jira/jira-issue';
import { JiraSearchOptions } from '@app/models/jira/jira-search-options';
import * as fromAuth from '@app/modules/auth/state';
import { JiraSortOrderEnum } from "@app/models/enums/jira/jira-sort-order.enum";
import { JiraSortFieldEnum } from '@app/models/enums/jira/jira-sort-field.enum';
import { NewSelectComponent } from '@shared/new-select/new-select.component';
import { SearchBoxComponent } from '@app/modules/communication-hub/search-box/search-box.component';
import { JiraDateRangeComponent } from '@app/modules/shared/jira-date-range/jira-date-range.component';
import { JiraComment } from '@app/models/jira/jira-comment';
import { ModalService, PermissionService } from '@app/services';
import { ComposeMessageModalComponent } from '@app/modules/communication-hub/compose-message-modal/compose-message-modal.component';
import { JiraDateRange } from '@app/models/jira/jira-date-range';
import { ofType } from '@ngrx/effects';
import { IdNamePair } from '@app/models/jira/id-name-pair';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent implements OnInit, AfterViewInit {
  @ViewChildren('anchor') anchorElements!: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('projectSelect') projectSelect: NewSelectComponent;
  @ViewChild('statusSelect') statusSelect: NewSelectComponent;
  @ViewChild('requestTypeSelect') requestTypeSelect: NewSelectComponent;
  @ViewChild('searchBox') searchBox: SearchBoxComponent;
  @ViewChild('updatedDateRange') updateDateRange: JiraDateRangeComponent;
  @ViewChild('createdDateRange') createDateRange: JiraDateRangeComponent;
  private observer!: IntersectionObserver;

  private ngUnsubscribe$ = new Subject<void>();

  private readonly user$ = this.store.select(fromAuth.authSelectors.getUser);
  userId: number;
  loading: boolean = false;

  jiraSearchOptions: JiraSearchOptions;
  projectsJiraSearchOptions: JiraSearchOptions = new JiraSearchOptions();

  messages: JiraIssue[] = [];
  nextPageToken: string | null = null;
  availableJiraProjects: IdNamePair[] = [];
  projectsNextPageToken: string | null = null;

  comments: JiraComment[] = [];

  public page$ = this.store.select(selectors.page);
  public availableProjects$ = this.store.select(selectors.availableJiraProjects);
  public availableProjectsLoading$ = this.store.select(selectors.availableJiraProjectsLoading);
  public statuses$ = this.store.select(selectors.statuses);
  public requestTypes$ = this.store.select(selectors.requestTypes);
  public issue$ = this.store.select(selectors.issue);
  public comments$ = this.store.select(selectors.comments);

  public canCompose = this.permissionService.has(PermissionService.create(PermissionTypeEnum.ANDIMessaging, PermissionActionTypeEnum.Create));
  isLastPage: boolean = false;
  isAvailableJiraProjectsLastPage: boolean = false;
  private projectHasSearchFilter: boolean = false;

  public selectedIssue: JiraIssue | null = null;

  showListView: boolean = false;

  showFullScreenIcon: boolean = true;

  constructor(
    private readonly store: Store<CommunicationHubState>,
    private readonly modalService: ModalService,
    private readonly actionsSubj: ActionsSubject,
    private permissionService: PermissionService,
  ) { }

  public ngOnInit(): void {
    this.user$
      .pipe(
        filter(user => !!user && !!user.selectedOrganization),
        first(),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(user => {
        this.userId = user.id;
        this.initializeJiraSearchOptions();
        this.projectsJiraSearchOptions.userId = this.userId;
        this.loadMessages();
        this.store.dispatch(actions.LoadStatuses());
        this.store.dispatch(actions.LoadRequestTypes());
        this.store.dispatch(actions.GetAvailableJiraProjects({jiraSearchOptions: this.projectsJiraSearchOptions}));
      });

    this.page$
    .pipe(
      filter(page => !!page),
      takeUntil(this.ngUnsubscribe$)
    )
    .subscribe(page => {
      if (page.messages){
        this.messages = this.nextPageToken ?  this.messages.concat(page.messages) : page.messages;
      }
      this.isLastPage = !page.nextPageToken;
      this.nextPageToken = page.nextPageToken;
      this.loading = false;
    });

    this.availableProjects$
      .pipe(
        filter(page => !!page),
        takeUntil(this.ngUnsubscribe$)
      )
      .subscribe(page => {
        if (page.items) {
          var combined = [];
          const uniqueProjects: IdNamePair[] = [];
          if (this.projectsNextPageToken) {
            combined = [...this.availableJiraProjects, ...page.items];
          } else {
            combined = page.items;
          }
          for (const project of combined) {
            const exists = uniqueProjects.some(existing => existing.id === project.id);
            if (!exists) {
              uniqueProjects.push(project);
            }
          }
          this.availableJiraProjects = uniqueProjects;
          if (!this.projectHasSearchFilter) {
            this.availableJiraProjects.push({ id: '-1', name: 'Blank' });
          }
        }
        if (!page.nextPageToken){
          this.isAvailableJiraProjectsLastPage = true;
        }
        this.projectsNextPageToken = page.nextPageToken;
      });

    this.issue$
    .pipe(
      filter(issue => !!issue),
      takeUntil(this.ngUnsubscribe$)
    )
    .subscribe(issue => {
      this.selectedIssue = issue;
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
        actions.CreateJiraMessageSuccess,
      ),
    ).subscribe(() => {
      this.messages = [];
      this.isLastPage = false;
      this.nextPageToken = null;
      this.store.dispatch(actions.LoadMessages({ jiraSearchOptions: this.jiraSearchOptions }));
    });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(
        actions.CreateJiraReplySuccess,
      ),
    ).subscribe(() => {
      this.store.dispatch(actions.LoadMessageComments({ ticketKey: this.selectedIssue.ticketKey }));
    });
  }

  ngAfterViewInit(): void {

    this.observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (!this.loading && this.nextPageToken){
              this.jiraSearchOptions.nextPageToken = this.nextPageToken;
              this.loadMessages();
            }
            obs.unobserve(entry.target);
            obs.observe(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.01,
      }
    );

    this.anchorElements.changes
      .pipe(startWith(this.anchorElements), takeUntil(this.ngUnsubscribe$))
      .subscribe((ql: QueryList<ElementRef<HTMLElement>>) => {
        this.observer.disconnect();
        const anchor = ql.first;
        if (anchor) {
          this.observer.observe(anchor.nativeElement);
        }
      });

  }

  initializeJiraSearchOptions(): void {
    this.jiraSearchOptions = new JiraSearchOptions();
    this.jiraSearchOptions.userId = this.userId;
    this.jiraSearchOptions.sortField = JiraSortFieldEnum.Created;
    this.jiraSearchOptions.sortOrder = JiraSortOrderEnum.Descending;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
    this.observer.disconnect();
  }

  public onStatusChange(status: any): void {
    this.jiraSearchOptions.statuses = status.map(status => status.name);
    this.resetPagination();
    this.loadMessages();
  }

  public onRequestTypeChange(requestTypes: any): void {
    this.jiraSearchOptions.requestTypes = requestTypes.map(requestType => requestType.name);
    this.resetPagination();
    this.loadMessages();
  }

  public onSearchTermChange(searchTerm: any): void {
    this.jiraSearchOptions.searchTerm = searchTerm;
    this.resetPagination();
    this.loadMessages();
  }

  public onUpdatedDateChange(updatedDateRange: any): void {
    this.jiraSearchOptions.updated = updatedDateRange;
    this.resetPagination();
    this.loadMessages();
  }

  public onCreatedDateChange(createdDateRange: any): void {
    this.jiraSearchOptions.created = createdDateRange;
    this.resetPagination();
    this.loadMessages();
  }

  public onProjectChange(project: any): void {
    this.jiraSearchOptions.projectIds = project.map(project => project.id);
    this.resetPagination();
    this.loadMessages();
  }

  projectsFilterFetch(term: string) {
    this.projectsJiraSearchOptions.nextPageToken = this.projectsNextPageToken;
    this.projectsJiraSearchOptions.searchTerm = term;
    this.projectHasSearchFilter = (term ?? '') !== '';
    this.store.dispatch(actions.GetAvailableJiraProjects({ jiraSearchOptions: this.projectsJiraSearchOptions }));
  }

  onSearchTermProject(term: string) {
    this.projectsJiraSearchOptions.searchTerm = term;
    this.projectsJiraSearchOptions.nextPageToken = null;
    this.projectsNextPageToken = null;
    this.projectHasSearchFilter = (term ?? '') !== '';
    this.store.dispatch(actions.GetAvailableJiraProjects({ jiraSearchOptions: this.projectsJiraSearchOptions }));
  }

  clearFilters(): void {
    this.projectSelect.clearOptions();
    this.statusSelect.clearOptions();
    this.requestTypeSelect.clearOptions();
    this.searchBox.clearText();
    this.updateDateRange.clearDateRange();
    this.createDateRange.clearDateRange();
    this.jiraSearchOptions.resetSearchOptions();

    this.resetPagination();
    this.loadMessages();
  }

  public selectIssue(issue: JiraIssue): void {
    if(this.selectedIssue?.id != issue?.id) {
      this.store.dispatch(actions.LoadMessage({ ticketKey: issue.id }));
      this.store.dispatch(actions.LoadMessageComments({ ticketKey: issue.id }));
    }
  }

  openComposeMessageModal(): void {
    this.modalService.show(ComposeMessageModalComponent, {
      initialState: {
        requestTypes: this.requestTypes$.pipe(
          map(requestTypes => requestTypes ? JSON.parse(JSON.stringify(requestTypes)) : []))
      },
      class: 'compose-message-modal',
    });
  }

  hasActiveFilters(): boolean {
    return Boolean(
      this.jiraSearchOptions.searchTerm ||
      this.jiraSearchOptions.projectIds?.length > 0 ||
      this.jiraSearchOptions.statuses?.length > 0 ||
      this.jiraSearchOptions.requestTypes?.length > 0 ||
      this.isDateRangeSpecified(this.jiraSearchOptions.created) ||
      this.isDateRangeSpecified(this.jiraSearchOptions.updated)
    );
  }

  private isDateRangeSpecified(dateRange: JiraDateRange | null): boolean {
    return Boolean(dateRange?.from || dateRange?.to);
  }

  private resetPagination(): void {
    this.messages = [];
    this.nextPageToken = null;
    this.jiraSearchOptions.nextPageToken = null;
    this.isLastPage = false;
  }

  loadMessages(){
    this.store.dispatch(actions.LoadMessages({ jiraSearchOptions: this.jiraSearchOptions }));
    this.loading = true;
  }
}