import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';

import { sharedSelectors } from '@app/modules/shared/state';

import { GridId } from '@app/models/enums/grid-id.enum';
import { EntityTypeEnum } from '@app/models/enums';
import { OrganizationTabHelper } from '../organization-tab.helper';

import * as actions from '../state/actions';
import * as selectors from '../state';
import { AppState } from '../state';

@Component({
  selector: 'app-org-addresses',
  templateUrl: './org-addresses.component.html',
})
export class OrgAddressesComponent implements OnInit {
  public readonly item$ = this.store.select(selectors.item);
  public readonly addressesListActionBar$ = this.store.select(sharedSelectors.addressesListSelectors.actionBar);
  public readonly entityType = EntityTypeEnum.Organizations;
  public readonly gridId = GridId.OrgAddresses;

  private readonly ngUnsubscribe$ = new Subject<void>();

  constructor(
    private readonly store: Store<AppState>,
  ) {}

  public ngOnInit(): void {
    this.addressesListActionBar$.pipe(
      first(actionBar => actionBar !== null),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(actionBar => {
      this.store.dispatch(actions.UpdateOrgsActionBar({
        actionBar: {
          ...actionBar,
          back: () => OrganizationTabHelper.handleBackClick(this.store),
        },
      }));
    });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
