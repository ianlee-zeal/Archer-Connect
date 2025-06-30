import { GotoParentView } from '@app/modules/shared/state/common.actions';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, first, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { ContextBarElement } from '@app/entities/context-bar-element';

import * as rootSelectors from '@app/state';
import { SatisfactionRatingHelper } from '@app/helpers/satisfaction-rating-helper.helper';
import * as fromUserAccessPolicies from '../state';
import * as fromUserAccessPoliciesActions from '../state/actions';
import { PermissionService } from '@app/services';
import { PermissionTypeEnum } from '@app/models/enums';

@Component({
  selector: 'app-org-profile',
  templateUrl: './org-profile.component.html',
})
export class OrgProfileComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe$ = new Subject<void>();

  public readonly item$ = this.store.select(fromUserAccessPolicies.item);
  public readonly actionBar$ = this.store.select(fromUserAccessPolicies.actionBar);
  private readonly organization$ = this.store.select(fromUserAccessPolicies.item);
  public loadingInProgress$ = this.store.select(rootSelectors.loadingInProgress);
  private canReadOrganizationRating = this.permissionService.canRead(PermissionTypeEnum.OrganizationRating);

  public headerElements: ContextBarElement[];
  public orgDetailsTitle: string;
  public orgDetailsSubTitle: string;
  public activeTab: string;
  public orgId: number;

  public satisfactionRatingList = SatisfactionRatingHelper.getSatisfactionRatingList();

  public ratingIconClass: string = '';

  constructor(
    private readonly store: Store<fromUserAccessPolicies.AppState>,
    private readonly datePipe: DateFormatPipe,
    private readonly router: Router,
    private readonly permissionService: PermissionService
  ) {
  }

  ngOnInit() {
    this.activeTab = this.router.url.split('/').pop();

    this.item$.pipe(
      filter(person => person != null),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(value => {
      this.orgDetailsTitle = value.name;

      if (value.satisfactionRating && this.canReadOrganizationRating) {
        const satisfactionRating = SatisfactionRatingHelper.getSatisfactionRatingList().find(rating => rating.id === value.satisfactionRating.id);

        this.orgDetailsSubTitle = satisfactionRating.name;
        this.ratingIconClass = satisfactionRating.class;
      } else {
        this.orgDetailsSubTitle = '';
        this.ratingIconClass = '';
      }

      this.headerElements = [
        { column: 'Created on', valueGetter: () => this.datePipe.transform(value.createdDate) },
        { column: 'ID', valueGetter: () => value.id },
      ];
    });

    this.organization$.pipe(
      filter(organization => !!organization),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(organization => {
      this.orgId = organization.id;

      this.actionBar$.pipe(
        first(),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(actionBar => {
        this.store.dispatch(fromUserAccessPoliciesActions.UpdateOrgsActionBar({
          actionBar: {
            ...actionBar,
            back: {
              callback: () => {
                if (organization.parentOrgId && organization.isSubOrg) {
                  this.store.dispatch(fromUserAccessPoliciesActions.GetOrg({ id: organization.parentOrgId, isSubOrg: false }));
                  this.store.dispatch(fromUserAccessPoliciesActions.GoToOrg({ id: organization.parentOrgId }));
                } else {
                  this.store.dispatch(GotoParentView());
                }
              },
            },
          },
        }));
      });
    });

    this.startOrgLoading();
  }

  private startOrgLoading() {
    const additionalActionNames = [];

    if (this.activeTab === 'details' && !this.orgId) {
      additionalActionNames.push(
        fromUserAccessPoliciesActions.GetOrg.type,
      );
    }

    this.store.dispatch(fromUserAccessPoliciesActions.GetOrgLoadingStarted({ additionalActionNames }));
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
