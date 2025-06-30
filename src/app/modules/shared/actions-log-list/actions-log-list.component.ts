import { Component, OnInit, OnDestroy } from '@angular/core';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { GridOptions } from 'ag-grid-community';
import { Store } from '@ngrx/store';
import { AppState } from '@app/modules/admin/user-access-policies/state/state';
import { authSelectors } from '@app/modules/auth/state';
import { sharedSelectors, sharedActions } from '@app/modules/shared/state';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GridId } from '@app/models/enums/grid-id.enum';
import { DateFormatPipe } from '../_pipes';

@Component({
  selector: 'app-actions-log-list',
  templateUrl: './actions-log-list.component.html',
  styleUrls: ['./actions-log-list.component.scss'],
})
export class ActionsLogListComponent implements OnInit, OnDestroy {
  public readonly gridId: GridId = GridId.Actions;

  public user$ = this.store.select<any>(authSelectors.getUser);
  public data$ = this.store.select(sharedSelectors.actionsLogSelectors.actionsLog);

  private userGuid: string;

  private ngUnsubscribe$ = new Subject<void>();

  public readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Action Type',
        field: 'actionType.name',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'User',
        field: 'username',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Date',
        field: 'logDate',
        sortable: true,
        sort: 'desc',
        minWidth: 150,
        width: 150,
        resizable: true,
        cellRenderer: data => this.datePipe.transform(data.value, true),
      },
      {
        headerName: 'IP Address',
        field: 'ip',
        sortable: true,
        minWidth: 150,
        width: 150,
        resizable: true,
      },
    ],
    animateRows: false,
    defaultColDef: {
      sortable: false,
    },
  };

  constructor(private store: Store<AppState>, private datePipe: DateFormatPipe) { }

  ngOnInit() {
    this.user$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(user => {
      this.userGuid = user.userGuid;
    });
  }

  public loadData(params): void {
    this.store.dispatch(sharedActions.actionsLogActions.GetActionsLogRequest({ userGuid: this.userGuid, params }));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
