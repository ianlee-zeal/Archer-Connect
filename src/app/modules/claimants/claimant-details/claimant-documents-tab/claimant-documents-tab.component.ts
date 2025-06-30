import { Observable } from 'rxjs';
import { Component, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { EntityTypeEnum } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ActivatedRoute } from '@angular/router';
import * as fromClaimants from '../state/selectors';
import * as actions from '../state/actions';
import { ClaimantDetailsState } from '../state/reducer';

@Component({
  selector: 'app-claimant-documents-tab',
  templateUrl: './claimant-documents-tab.component.html',
})
export class ClaimantDocumentsTabComponent implements OnDestroy {
  public readonly entityTypeId: EntityTypeEnum;
  public readonly gridId: GridId = GridId.ClaimantDocuments;

  public readonly entityTypeEnum = EntityTypeEnum;
  public readonly item$: Observable<any>;

  setFileNameOnFileSelect = false;

  constructor(
    private readonly store: Store<ClaimantDetailsState>,
    route: ActivatedRoute,
  ) {
    this.entityTypeId = route?.snapshot?.data?.entityTypeId || EntityTypeEnum.Clients;
    switch (this.entityTypeId) {
      case EntityTypeEnum.Clients:
        this.item$ = this.store.select(fromClaimants.item);
        break;
      case EntityTypeEnum.Probates:
        this.item$ = this.store.select(fromClaimants.probateDetailsItem);
        this.setFileNameOnFileSelect = true;
        break;
    }
  }

  public onActionBarUpdated(actionBar: ActionHandlersMap): void {
    this.store.dispatch(actions.UpdateClaimantsActionBar({ actionBar }));
  }

  ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateClaimantsActionBar({ actionBar: null }));
  }
}
