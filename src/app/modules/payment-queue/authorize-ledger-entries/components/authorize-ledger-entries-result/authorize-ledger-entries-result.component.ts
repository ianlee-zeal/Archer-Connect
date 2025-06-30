import { Component, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { GridId } from '@app/models/enums/grid-id.enum';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { ClearSelectedRecordsState } from '@app/state/root.actions';
import { ProjectsCommonState } from '@app/modules/projects/state/reducer';
import * as paymentQueueActions from '@app/modules/projects/project-disbursement-payment-queue/state/actions';
import { ISearchOptions } from '@app/models/search-options';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-authorize-ledger-entries-result',
  templateUrl: './authorize-ledger-entries-result.component.html'
})
export class AuthorizeLedgerEntriesResultComponent implements OnDestroy {
  @Input() public parentGridId: GridId;
  @Input() public paymentQueueGridParams: IServerSideGetRowsParamsExtended;
  @Input() public projectId: number;
  @Input() public batchActionId: number;
  @Input() public searchOptions: ISearchOptions;

  private readonly ngUnsubscribe$ = new Subject<void>();
  constructor(
    public store: Store<ProjectsCommonState>
  ) {
  }

  public ngOnDestroy(): void {
    this.store.dispatch(paymentQueueActions.GetSelectedPaymentQueueAuthorizedLedgersResultGrid({ searchOpts: this.searchOptions, agGridParams: this.paymentQueueGridParams, projectId: this.projectId }));
    this.store.dispatch(ClearSelectedRecordsState({ gridId: this.parentGridId }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
