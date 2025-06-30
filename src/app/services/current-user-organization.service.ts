import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';
import { AppState } from '@app/state';
import { authSelectors } from '@app/modules/auth/state';

/**
 * Service for retrieving whether the current user's organization is the Master Organization..
 *
 * @export
 * @class CurrentUserOrganizationService
 */
@Injectable({ providedIn: 'root' })
export class CurrentUserOrganizationService {
  private readonly isMaster$ = this.store.select(authSelectors.isCurrentOrgMaster);

  /**
   * Stores whether the current user's selected organization is the master organization.
   *
   * @memberof CurrentUserOrganizationService
   */
  public isMaster: boolean;

  constructor(private readonly store: Store<AppState>) {
    this.isMaster$.pipe(take(1)).subscribe(isMaster => {
      this.isMaster = isMaster;
    });
  }
}