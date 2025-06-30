import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';

import { sharedSelectors } from '@app/modules/shared/state';
import { ClaimantSummary } from '@app/models/claimant-summary';
import { PersonGeneralInfoComponent } from '@app/modules/shared/person-general-info/person-general-info.component';
import { CanLeave } from '@app/modules/shared/_interfaces/can-leave';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import * as actions from '../state/actions';
import { ClaimantDetailsState } from '../state/reducer';
import { claimantSummary as claimantSummarySelector } from '../state/selectors';
import { GotoParentView } from '../../../shared/state/common.actions';

/**
 * Component for showing and editing of the general information for provided entity (person, etc.)
 *
 * @export
 * @class GeneralInfoComponent
 * @implements {CanLeave}
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  selector: 'app-general-info',
  templateUrl: './general-info.component.html',
  styleUrls: ['./general-info.component.scss'],
})
export class GeneralInfoComponent implements CanLeave, OnInit, OnDestroy {
  /**
   * Child component with the person general information
   *
   * @type {PersonGeneralInfoComponent}
   * @memberof GeneralInfoComponent
   */
  @ViewChild(PersonGeneralInfoComponent)
  readonly personComponent: PersonGeneralInfoComponent;

  private readonly personsActionBar$ = this.store.select(sharedSelectors.personGeneralInfoSelectors.actionBar);

  private readonly claimantSummary$ = this.store.select(claimantSummarySelector);

  private readonly ngUnsubscribe$ = new Subject<void>();

  private claimantSummary: ClaimantSummary;

  /** @inheritdoc */
  public get canLeave(): boolean {
    return this.personComponent.canLeave;
  }

  /**
   * Creates an instance of GeneralInfoComponent.
   * @param {Store<ClaimantDetailsState>} store - current claimant details store
   * @memberof GeneralInfoComponent
   */
  constructor(private store: Store<ClaimantDetailsState>) { }

  /** @inheritdoc */
  ngOnInit(): void {
    this.personsActionBar$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
        first((actionBar: ActionHandlersMap) => actionBar !== null),
      )
      .subscribe((actionBar: ActionHandlersMap) => {
        this.store.dispatch(actions.UpdateClaimantsActionBar({ actionBar }));
      });

    this.claimantSummary$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((claimantSummary: ClaimantSummary) => {
        this.claimantSummary = claimantSummary;
      });
  }

  /**
   * Cancel event handler
   *
   * @memberof GeneralInfoComponent
   */
  onCancel(): void {
    this.store.dispatch(GotoParentView());
  }

  /**
   * Event handler for save complete event
   *
   * @param {boolean} saveCompleted - flag indicates whether saving is completed or cancelled
   * @memberof GeneralInfoComponent
   */
  onSaveComplete(saveCompleted: boolean): void {
    if (!saveCompleted) {
      this.store.dispatch(actions.GetClaimantRequest({ id: this.claimantSummary.id }));
    }
    this.store.dispatch(actions.GetClaimantIdSummaryRequest({ id: this.claimantSummary.id }));
    this.store.dispatch(actions.GetClaimantServices({ clientId: this.claimantSummary.id }));
  }

  /** @inheritdoc */
  ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateClaimantsActionBar({ actionBar: null }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
