import { Observable } from 'rxjs';
import { Injectable, EventEmitter } from '@angular/core';
import { first } from 'rxjs/operators';
import { ActionBarOption } from '@app/models';
import { KeyValuePair } from '../models/utils/key-value-pair';

/**
 * Service for handling of custom actions added to the action bar
 *
 * @export
 * @class ActionBarService
 */
@Injectable({ providedIn: 'root' })
export class ActionBarService {
  /**
   * Event fired when clear all filters action must occur
   *
   * @memberof ActionBarService
   */
  clearAllFilters = new EventEmitter();

  /**
   * Event fired when clear of individual filter must occur
   *
   * @memberof ActionBarService
   */
  clearFilter = new EventEmitter<string>();

  /**
   * Initiates 'Clear N Filters' action in the action bar.
   *
   * @param {Observable<any>} sourceActionBar - observable with source action bar
   * @param {KeyValuePair<string, string>[]} sourceFilters - source filters added to the clear actions dropdown
   * @param {boolean} [isAlwaysEnabled] - flag which indicates that 'Clear All' option should be always enabled
   *                                      whether we pass filters list to the action bar or not
   * @returns {Promise<any>}
   * @memberof ActionBarService
   */
  initClearFiltersAction(
    sourceActionBar: Observable<any>,
    sourceFilters: KeyValuePair<string, string>[],
    isAlwaysEnabled?: boolean,
    canClearGridFilters?: boolean,
  ): Promise<any> {
    return new Promise(resolve => {
      sourceActionBar.pipe(
        first(actionBar => !!actionBar),
      ).subscribe(actionBar => {
        if (isAlwaysEnabled && sourceFilters.length === 0 && !!actionBar.clearFilter) {
          const actionBarNew = {
            ...actionBar,
            clearFilter: { ...actionBar.clearFilter, disabled: () => false },
          };
          resolve(actionBarNew);
          return;
        }
        const filters: ActionBarOption[] = sourceFilters.map(f => ({
          name: `${f.key}: ${f.value}`,
          class: null,
          callback: () => this.clearFilter.emit(f.key),
          isFlex: true,
          isDelete: true,
        }));
        const options: ActionBarOption[] = [];
        options.push({
          name: 'Clear All',
          class: 'select__link',
          callback: () => this.clearAllFilters.emit(),
        });
        filters.forEach(o => options.push(o));
        const actionBarNew = {
          ...actionBar,
          clearFilter: {
            label: `Clear ${filters.length ? `${filters.length} ` : ''}Filters`,
            disabled: () => (isAlwaysEnabled ? false : (!filters.length && !canClearGridFilters)),
            options,
          },
        };
        resolve(actionBarNew);
      });
    });
  }
}
