import { Observable, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { OnInit, Directive } from '@angular/core';

import { EntityTypeEnum } from '@app/models/enums';
import { ActionHandlersMap } from '../../shared/action-bar/action-handlers-map';

/**
 * Base class for entity payments components
 *
 * @export
 * @abstract
 * @class EntityPaymentsBase
 * @implements {OnInit}
 * @template TEntity
 * @template TState
 */
@Directive()
export abstract class EntityPaymentsBase<TEntity, TState> implements OnInit {
  protected readonly ngUnsubscribe$ = new Subject<void>();

  /**
   * Gets an observable of the currently selected entity (project, claimant, etc.)
   *
   * @abstract
   * @type {Observable<TEntity>}
   * @memberof EntityPaymentsBase
   */
  abstract readonly entity$: Observable<TEntity>;

  /**
   * Gets an observable of the currently selected entity type (project, claimant, etc.)
   *
   * @abstract
   * @type {EntityTypeEnum}
   * @memberof EntityPaymentsBase
   */
  abstract readonly entityTypeId: EntityTypeEnum;

  /**
   * Gets an observable of the current action bar
   *
   * @abstract
   * @type {Observable<ActionHandlersMap>}
   * @memberof EntityPaymentsBase
   */
  abstract readonly actionBar$: Observable<ActionHandlersMap>;

  /**
   * Creates an instance of EntityPaymentsBase.
   * @param {Store<TState>} store
   * @memberof EntityPaymentsBase
   */
  constructor(
    protected readonly store: Store<TState>,
  ) {}

  /** @inheritdoc */
  ngOnInit(): void {
    this.actionBar$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(actionBar => {
        this.onUpdateActionBar(actionBar);
      });
  }

  /**
   * Method called when update of the action bar must occur
   *
   * @protected
   * @abstract
   * @param {ActionHandlersMap} actionBar
   * @memberof EntityPaymentsBase
   */
  protected abstract onUpdateActionBar(actionBar: ActionHandlersMap): void;
}
