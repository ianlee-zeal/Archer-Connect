import { Component, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { GridOptions } from 'ag-grid-community';
import { GotoParentView } from '@shared/state/common.actions';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { takeUntil } from 'rxjs/operators';
import { sharedSelectors } from '@app/modules/shared/state';
import * as fromSettlements from '../../state';

@Component({
  selector: 'app-settlement-projects-tab',
  templateUrl: './settlement-projects-tab.component.html',
})
export class SettlementProjectsTabComponent extends ListView {
  public readonly gridId: GridId = GridId.RelatedProjects;
  public settlement$ = this.store.select(sharedSelectors.settlementInfoSelectors.settlement);

  public settlementId: number = 0;

  public gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'ID',
        field: 'id',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
        ...AGGridHelper.numberColumnDefaultParams,
      },
      {
        headerName: 'Name',
        field: 'name',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Project Manager',
        field: 'assignedUser.displayName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
    ],
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
    animateRows: false,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
  };

  public ngOnInit(): void {
    super.ngOnInit();

    this.settlement$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(settlement => {
        if (settlement) {
          this.settlementId = settlement.id;
        } else {
          this.settlementId = null;
        }
      });

    this.store.dispatch(fromSettlements.actions.UpdateActionBar({ actionBar: this.actionBarActionHandlers }));
  }

  public gridReady(gridApi): void {
    super.gridReady(gridApi);

    if (this.gridParams) {
      this.gridApi.setFilterModel(this.gridParams.request.filterModel);
    }
  }

  protected fetchData(agGridParams): void {
    this.gridParams = agGridParams;
    this.store.dispatch(fromSettlements.actions.GetProjectList({ settlementId: this.settlementId, agGridParams }));
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
    this.store.dispatch(fromSettlements.actions.UpdateActionBar({ actionBar: null }));
  }

  public actionBarActionHandlers: ActionHandlersMap = {
    back: () => this.back(),
    clearFilter: this.clearFilterAction(),
  };

  constructor(
    private readonly store: Store<fromSettlements.SettlementState>,
    protected router: Router,
    protected elementRef: ElementRef,
    private route: ActivatedRoute,
  ) {
    super(router, elementRef);
  }

  protected onRowDoubleClicked({ data: row }): void {
    if (row) {
      this.router.navigate(
        [`projects/${row.id}`],
      );
    }
  }

  private back(): void {
    this.store.dispatch(GotoParentView());
  }
}
