import { ofType } from '@ngrx/effects';
import { ActionsSubject } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { first } from 'rxjs/operators';

/**
 * Service for awaiting of completion of async actions.
 *
 * @export
 * @class AsyncOperationsAwaitService
 */
@Injectable({ providedIn: 'root' })
export class AsyncOperationsAwaitService {
  private asyncOperationsCount = 0;

  /**
   * Returns true if some async actions are in process.
   *
   * @readonly
   * @type {boolean}
   * @memberof AsyncOperationsAwaitService
   */
  get inProcess(): boolean {
    return this.asyncOperationsCount > 0;
  }

  /**
   * Creates an instance of AsyncOperationsAwaitService.
   * @param {ActionsSubject} actions
   * @memberof AsyncOperationsAwaitService
   */
  constructor(private readonly actions: ActionsSubject) {}

  /**
   * Adds subscriptions for the async action types.
   *
   * @param {string[]} awaitedActionTypes
   * @memberof AsyncOperationsAwaitService
   */
  add(awaitedActionTypes: string[]) {
    this.asyncOperationsCount++;
    this.actions.pipe(
      ofType(...awaitedActionTypes),
      first(),
    ).subscribe(() => this.asyncOperationsCount--);
  }
}
