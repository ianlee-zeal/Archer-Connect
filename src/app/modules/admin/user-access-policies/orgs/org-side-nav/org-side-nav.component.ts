import { ActivatedRoute } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { SideNavMenuService } from '@app/services/navigation/side-nav-menu.service';

import * as userAccessPolicyActions from '../state/actions';
import * as fromUserAccessPolices from '../state';

@Component({
  selector: 'app-org-side-nav',
  templateUrl: './org-side-nav.component.html',
})
export class OrgSideNavComponent implements OnDestroy, OnInit {
  constructor(
    private readonly sideNavMenuService: SideNavMenuService,
    private readonly route: ActivatedRoute,
    private readonly store: Store<fromUserAccessPolices.AppState>,
  ) {
  }

  ngOnInit(): void {
    this.store.dispatch(userAccessPolicyActions.GetOrg({ id: this.route.snapshot.params.id }));
  }

  ngOnDestroy(): void {
    this.sideNavMenuService.removeAll();
    this.sideNavMenuService.injectMainMenu();
  }
}
