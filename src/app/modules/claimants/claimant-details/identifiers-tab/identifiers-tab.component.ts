import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { EntityTypeEnum } from '@app/models/enums';
import { takeUntil, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { GridOptions } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ClaimantDetailsState } from '../state/reducer';
import * as fromClaimants from '../state/selectors';
import * as actions from '../state/actions';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

@Component({
  selector: 'app-identifiers-tab',
  templateUrl: './identifiers-tab.component.html',
  styleUrls: ['./identifiers-tab.component.scss'],
})
export class ClaimantIdentifiersComponent implements OnInit, OnDestroy {
  public readonly gridId: GridId = GridId.Identifiers;

  public item$ = this.store.select(fromClaimants.item);
  public readonly identifiers$ = this.store.select(fromClaimants.claimantIdentifiersSelector);

  private ngUnsubscribe$ = new Subject<void>();

  public agGridParams: IServerSideGetRowsParamsExtended;

  public readonly gridOptions: GridOptions = {
    animateRows: false,
    defaultColDef: {
      sortable: false,
    },
    columnDefs: [
      {
        headerName: 'ID',
        field: 'identifier',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'ID Type',
        field: 'externalIdentifierType.name',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Organization',
        field: 'organization.name',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Data Source',
        field: 'dataSource',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, true),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
    ],
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
  };

  constructor(
    private readonly store: Store<ClaimantDetailsState>,
    private readonly datePipe: DateFormatPipe,
  ) {
  }

  public ngOnInit(): void {
    this.item$.pipe(
      filter(x => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(claimant => {
      this.store.dispatch(actions.GetClaimantIdentifiersRequest({ entityId: claimant.id, entityTypeId: EntityTypeEnum.Clients }));
    });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
