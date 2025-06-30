import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, first, takeUntil } from 'rxjs/operators';
import { authSelectors } from '@app/modules/auth/state';
import { RecentView, User, UserInfo } from '@app/models';
import * as selectors from '@app/modules/admin/user-access-policies/users/state/selectors';
import { UsersState } from '@app/modules/admin/user-access-policies/users/state/state';
import { pinnedPagesSelector } from '@app/modules/shared/state/pinned-pages/selectors';
import * as actions from '@app/modules/admin/user-access-policies/users/state/actions';
import { FirmLandingPageState } from './state/reducer';
import { Router } from '@angular/router';
import * as communicationHubSelectors from '@app/modules/communication-hub/state/selectors';
import * as communicationHubActions from '@app/modules/communication-hub/state/actions';
import { combineLatest, Subject } from 'rxjs';
import { PermissionService } from '@app/services';
import { EntityTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { InfoCardState } from '@app/models/enums/info-card-state.enum';
import { recentViewsSelector } from '@shared/state/recent-views/selectors';
import * as fromRoot from '@app/state';
import { IconHelper } from '@app/helpers';
import { sharedActions } from '@shared/state';
import * as fromSharedSelectors from '@shared/state';
import * as projectActions from '@app/modules/projects/state/actions';
import * as landingPageActions from './state/actions';
import { globalDeficienciesCount } from './state/selectors';
import { ClaimantDetailsState } from '@app/modules/claimants/claimant-details/state/reducer';
import { LoadingIndicatorService } from '@app/services/loading-indicator.service';
import { Document } from '@app/models/documents/document';
import { QuickSearchOption } from '@shared/_abstractions/quick-search-option';

@Component({
  selector: 'app-firm-landing-page',
  templateUrl: './firm-landing-page.component.html',
  styleUrl: './firm-landing-page.component.scss'
})
export class FirmLandingPageComponent implements OnInit, OnDestroy {
  EntityTypeEnum = EntityTypeEnum;
  greetingMessage: string;
  organizationName: string;
  responseNeededCount: number = null;
  documents : Document[] = [];
  deficienciesCount: number;

  public user$ = this.store.select<any>(authSelectors.getUser);
  public userDetail$ = this.store.select(selectors.currentUser);
  public responseNeededCount$ = this.store.select(communicationHubSelectors.responseNeededCount);
  pinnedPages$ = this.store.select(pinnedPagesSelector.pinnedPages);
  public recentViews$ = this.rootStore.select<RecentView[]>(recentViewsSelector.recentViews);
  public documents$ = this.store.select(fromSharedSelectors.sharedSelectors.documentsListSelectors.documents);
  public deficienciesCount$ = this.store.select(globalDeficienciesCount);

  protected readonly canAccessANDIMessaging = this.permissionService.canRead(PermissionTypeEnum.ANDIMessaging);
  protected readonly canAccessGlobalDocuments = this.permissionService.canRead(PermissionTypeEnum.GlobalDocumentSearch);
  protected readonly canCreateDocumentBatches = this.permissionService.canCreate(PermissionTypeEnum.DocumentBatch);
  protected readonly canAccessGlobalDeficiencies = this.permissionService.canRead(PermissionTypeEnum.GlobalDeficiencies);
  private readonly ngUnsubscribe$ = new Subject<void>();
  protected loading: boolean = true;
  protected loadingDocuments: boolean = true;

  showAllPinnedPages = false;

  public quickSearchOption: QuickSearchOption[] = [
    {
      id: EntityTypeEnum.Projects,
      name: 'Project',
      active: true,
      placeholder: 'Search by ID or Name',
    },
    {
      id: EntityTypeEnum.Clients,
      name: 'Claimant',
      active: false,
      placeholder: 'Search by ID, Name, SSN or Attorney Reference ID',
    }
  ];

  togglePinnedPages(): void {
    this.showAllPinnedPages = !this.showAllPinnedPages;
  }

  constructor(
    private readonly userState: Store<UsersState>,
    private readonly store: Store<FirmLandingPageState>,
    private readonly rootStore: Store<fromRoot.AppState>,
    private readonly claimantsStore: Store<ClaimantDetailsState>,
    private readonly router: Router,
    private readonly permissionService: PermissionService,
    private readonly loadingIndicatorService: LoadingIndicatorService,
  ) {}

  ngOnInit() {

    this.rootStore.dispatch(sharedActions.documentsListActions.GetDocumentsList({ agGridParams: {
        parentNode: null,
        success() {},
        fail() {},
        api: null,
        context: null,
        request: {
          startRow: 0,
          endRow: 6,
          rowGroupCols: [],
          valueCols: [],
          pivotCols: [],
          pivotMode: false,
          groupKeys: [],
          filterModel: [],
          sortModel: [{ sort: 'desc', colId: 'createdDate' }],
        }
      }
    }));

    this.user$.pipe(
      first(user => !!user),
    ).subscribe((user: UserInfo) => {
      this.userState.dispatch(actions.GetUser({ id: user.id }));
      this.canAccessANDIMessaging
        ? this.store.dispatch(communicationHubActions.GetResponseNeededCount({ userId: user.id }))
        : this.store.dispatch(communicationHubActions.GetResponseNeededCountSuccess({ responseNeededCount: 0 }));
      this.canAccessGlobalDeficiencies
        ? this.store.dispatch(landingPageActions.getGlobalDeficienciesCount())
        : this.store.dispatch(landingPageActions.getGlobalDeficienciesCountSuccess({ count: 0 }));
      });

    combineLatest([
      this.userDetail$.pipe(first(user => !!user)),
      this.responseNeededCount$.pipe(filter(count => count !== null)),
      this.deficienciesCount$.pipe(filter(count => count !== null)),
      ])
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(([user, count, deficienciesCount]: [User, number, number]) => {
        this.organizationName = user.defaultOrganization?.name;

        this.setGreeting();
        if (user.firstName && user.firstName.trim() !== '') {
          this.greetingMessage += `, ${user.firstName}`;
        }

        this.responseNeededCount = count;
        this.deficienciesCount = deficienciesCount;
        this.loading = false;
        this.loadingIndicatorService.hide();
      });

      this.documents$.pipe(
        filter(documents => !!documents),
        takeUntil(this.ngUnsubscribe$)
      ).subscribe((documents: Document[]) => {
          this.documents = documents;
          this.loadingDocuments = false;
      });
  }

  private setGreeting(): void {
    const hour = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })).getHours();

    if (hour >= 0 && hour < 12) {
      this.greetingMessage = 'Good Morning';
    } else if (hour >= 12 && hour < 18) {
      this.greetingMessage = 'Good Afternoon';
    } else {
      this.greetingMessage = 'Good Evening';
    }

  }

  public onClickDownload(documentId: number): void {
    this.claimantsStore.dispatch(projectActions.GetValidationDocument({ previewDocId: documentId }));
  }

  public onClickUpload(): void {
    if(this.canCreateDocumentBatches) {
      this.router.navigate(['document-batches/upload']);
    }
  }

  public onClickContact(): void {
    if(this.canAccessANDIMessaging && this.responseNeededCount != -1) {
      this.router.navigate(['andi-messaging/tabs/inbox']);
    }
    else {
      const email = "clientcare@archersystems.com";
      const subject = encodeURIComponent("ARROW Inquiry:");

      window.location.href = `mailto:${email}?subject=${subject}`;
    }
  }

  public onRedirectTo(url: string): void {
    this.router.navigate([url]);
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  protected readonly InfoCardState = InfoCardState;
  protected readonly IconHelper = IconHelper;
}
