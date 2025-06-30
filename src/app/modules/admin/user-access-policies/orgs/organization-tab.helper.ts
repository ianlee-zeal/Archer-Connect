import { Store } from '@ngrx/store';
import { first } from 'rxjs/operators';

import { commonSelectors } from '@shared/state/common.selectors';
import { RelatedPage } from '@app/modules/shared/grid-pager';
import { GotoProjectOrganizationsPage } from '@app/modules/projects/state/actions';
import { ActivatePager, GotoParentView } from '@app/modules/shared/state/common.actions';
import * as fromOrganizations from './state';
import * as fromOrganizationActions from './state/actions';

/**
 * Helper class for organization-related tabs
 *
 * @export
 * @class OrganizationTabHelper
 */
export class OrganizationTabHelper {
  /**
   * Handles 'Back' button click for organization-related tabs
   *
   * @static
   * @param {Store<fromOrganizations.AppState>} store - current store
   * @memberof OrganizationTabHelper
   */
  static handleBackClick(store: Store<fromOrganizations.AppState>) {
    store.select(fromOrganizations.item).pipe(
      first(),
    ).subscribe(organization => {
      if (organization.parentOrgId && organization.isSubOrg) {
        store.dispatch(fromOrganizationActions.GetOrg({ id: organization.parentOrgId }));
        store.dispatch(fromOrganizationActions.GoToSubOrganizationsList({ id: organization.parentOrgId }));
      } else {
        store.select(commonSelectors.pager).pipe(
          first(),
        ).subscribe(pager => {
          if (pager && pager.relatedPage === RelatedPage.ProjectOrganizations) {
            store.dispatch(ActivatePager({ relatedPage: RelatedPage.ProjectsFromSearch }));
            store.dispatch(GotoProjectOrganizationsPage({ projectId: pager.payload }));
          } else if (pager && pager.relatedPage === RelatedPage.Representatives) {
            store.dispatch(GotoParentView());
          } else {
            store.dispatch(fromOrganizationActions.GoToOrganizationsList());
          }
        });
      }
    });
  }

  static createTitle(orgName: string, baseTitle: string): string {
    const name = orgName.trim();
    if (name) {
      return `${name} / ${baseTitle}`;
    }
    return baseTitle;
  }
}
