import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { ClaimantDetailsState } from '../state/reducer';
import * as actions from '../state/actions';
import { GotoParentView } from '../../../shared/state/common.actions';

@Component({
  selector: 'app-under-construction-tab',
  templateUrl: './under-construction-tab.component.html',
  styleUrls: ['./under-construction-tab.component.scss']
})
export class UnderConstructionTabComponent implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject<void>();

  constructor(private store: Store<ClaimantDetailsState>) { }

  ngOnInit() {
    this.store.dispatch(actions.UpdateClaimantsActionBar({ actionBar: { back: () => this.cancel() } }));
  }

  private cancel(): void {
    this.store.dispatch(GotoParentView());
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
