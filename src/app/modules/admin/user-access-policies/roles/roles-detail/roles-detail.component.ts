/* eslint-disable no-restricted-globals */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';

import { ContextBarElement } from '@app/entities/context-bar-element';
import { NavigationSettings } from '@shared/action-bar/navigation-settings';
import { OrgRoleService } from '@app/services';
import { PaginatorParams } from '@app/models';

import { commonSelectors } from '@shared/state/common.selectors';
import * as fromShared from '@shared/state/common.actions';
import * as paginatorActions from '@shared/grid-pager/state/actions';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import { OrganizationRoleState } from '../state/reducers';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

@Component({
  selector: 'app-roles-detail',
  templateUrl: './roles-detail.component.html',
  styleUrls: ['./roles-detail.component.scss'],
})
export class RolesDetailComponent implements OnInit, OnDestroy {
  public title: string;
  public headerElements: ContextBarElement[];
  public navigationSettings: NavigationSettings;
  private gridParams: IServerSideGetRowsRequestExtended;

  public actionBar$ = this.store.select(selectors.actionBar);
  public orgRoleDetailsHeader$ = this.store.select(selectors.orgRoleDetailsHeader);
  public orgRoles$ = this.store.select(selectors.orgRoles);
  private gridParams$ = this.store.select(selectors.agGridParams);
  readonly pager$ = this.store.select(commonSelectors.pager);
  private ngUnsubscribe$ = new Subject<void>();

  constructor(
    private store: Store<OrganizationRoleState>,
    private activatedRoute: ActivatedRoute,
    private orgRoleService: OrgRoleService,
  ) { }

  public ngOnInit(): void {
    const id = +this.activatedRoute.snapshot.params.id;

    if (!id) {
      return;
    }

    this.store.dispatch(actions.GetOrganizationRoleDetailsRequest({ id }));

    this.orgRoleDetailsHeader$.pipe(
      filter(x => x != null),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(value => {
      this.title = value.name;
    });

    this.gridParams$
      .pipe(
        filter(x => x != null),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(params => {
        this.gridParams = params.request;
      });
  }

  public toPage(pageNumber: number): void {
    this.store.dispatch(fromShared.UpdatePager({ pager: { currentPage: pageNumber } }));
    this.store.dispatch(paginatorActions.Paginator({
      pageNumber,
      prevId: this.activatedRoute.snapshot.params.id,
      apiCall: this.orgRoleService.getList.bind(this.orgRoleService),
      callback: this.paginatorCallBack.bind(this),
      params: <PaginatorParams>{ gridParams: this.gridParams },
    }));
  }

  private paginatorCallBack(id: number) {
    this.store.dispatch(actions.GetOrganizationRoleDetailsRequest({ id }));
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
