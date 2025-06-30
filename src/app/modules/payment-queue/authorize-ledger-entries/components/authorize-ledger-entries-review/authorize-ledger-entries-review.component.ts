import { Component, Input, OnDestroy} from '@angular/core';
import { GridId } from '@app/models/enums/grid-id.enum';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { Subject } from 'rxjs';
import * as paymentQueueActions from '@app/modules/projects/project-disbursement-payment-queue/state/actions';
import { Store } from '@ngrx/store';
import { ISearchOptions } from '@app/models/search-options';
import { ProjectsCommonState } from '@app/modules/projects/state/reducer';

@Component({
  selector: 'app-authorize-ledger-entries-review',
  templateUrl: './authorize-ledger-entries-review.component.html',
  styleUrls: ['./authorize-ledger-entries-review.component.scss'],
})
export class AuthorizeLedgerEntriesReviewComponent implements OnDestroy {
  @Input() public parentGridId: GridId;
  @Input() public paymentQueueGridParams: IServerSideGetRowsParamsExtended;
  @Input() public projectId: number;
  @Input() public batchActionId: number;
  @Input() public searchOptions: ISearchOptions;

  private readonly ngUnsubscribe$ = new Subject<void>();
  constructor(public store: Store<ProjectsCommonState>)
  {
  }

  public ngOnDestroy(): void {
    this.store.dispatch(paymentQueueActions.GetSelectedPaymentQueueAuthorizedLedgersGrid({ searchOpts: this.searchOptions, agGridParams: this.paymentQueueGridParams, projectId: this.projectId }));
    this.store.dispatch(paymentQueueActions.GetSelectedPaymentQueueUnauthorizedLedgersGrid({ searchOpts: this.searchOptions, agGridParams: this.paymentQueueGridParams, projectId: this.projectId }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
