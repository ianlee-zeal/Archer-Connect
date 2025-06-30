import { Injectable } from '@angular/core';

/** Local storage key for currently selected organization id */
const LOCAL_STORAGE_KEY_ORG_ID = 'ac-current-organization-id';
export const LOCAL_STORAGE_KEY_USER = 'user';

/**
 * Service for working with the client's current organization data
 *
 * @export
 * @class CurrentOrganizationService
 */
@Injectable({ providedIn: 'root' })
export class CurrentOrganizationService {
  /**
   * Gets current organization id.
   * If id does not exist in local storage, returns null.
   *
   * @returns {number}
   * @memberof CurrentOrganizationService
   */
  getCurrentOrganizationId(): number {
    const item = localStorage.getItem(LOCAL_STORAGE_KEY_ORG_ID);
    return item != null ? +item : null;
  }

  /**
   * Sets current organization id.
   *
   * @param {number} organizationId
   * @memberof CurrentOrganizationService
   */
  setCurrentOrganizationId(organizationId: number) {
    localStorage.setItem(LOCAL_STORAGE_KEY_ORG_ID, organizationId.toString());
  }

  /**
   * Clears current organization id from the local storage.
   *
   * @memberof CurrentOrganizationService
   */
  clearCurrentOrganizationId() {
    localStorage.removeItem(LOCAL_STORAGE_KEY_ORG_ID);
  }
}
