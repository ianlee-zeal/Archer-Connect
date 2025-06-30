/* eslint-disable no-restricted-globals */
import { Component, OnInit, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { GridOptions, ICellRendererParams } from 'ag-grid-community';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ActivatedRoute, Router } from '@angular/router';

import { ModalService } from '@app/services/modal.service';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { SsnPipe, DateFormatPipe } from '@app/modules/shared/_pipes';
import { LinkActionRendererComponent } from '@app/modules/shared/_renderers/link-action-renderer/link-action-renderer.component';

import { GridId } from '@app/models/enums/grid-id.enum';
import { DecimalPipe } from '@angular/common';
import { GotoParentView } from '@shared/state/common.actions';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClaimantStatusEnum } from '@app/models/enums/claimant-status.enum';
import { sharedSelectors } from '@app/modules/shared/state';
import { Settlement } from '@app/models';
import * as fromSettlements from '../../state';

@Component({
  selector: 'app-settlement-claimants-tab',
  templateUrl: './settlement-claimants-tab.component.html',
})
export class SettlementClaimantsTabComponent extends ListView implements OnInit {
  public readonly gridId: GridId = GridId.RelatedClaimants;
  public settlement$ = this.store.select(sharedSelectors.settlementInfoSelectors.settlement);
  public settlementId: number = 0;
  public ngDestroyed$ = new Subject<void>();

  public gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'ARCHER ID',
        field: 'archerId',
        width: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
        ...AGGridHelper.fixedColumnDefaultParams,
        cellRenderer: 'linkActionRenderer',
        cellRendererParams: { onAction: this.redirectToClaimant.bind(this) },
      },
      {
        headerName: 'First Name',
        field: 'firstName',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Last Name',
        field: 'lastName',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'SSN',
        field: 'ssn',
        width: 100,
        sortable: true,
        cellRenderer: (data: ICellRendererParams): string => this.ssnPipe.transform(data.value),
        ...AGGridHelper.getCustomTextColumnFilter(),
        resizable: true,
      },
      {
        headerName: 'Date of Birth',
        field: 'dob',
        sortable: true,
        cellRenderer: (data: ICellRendererParams): string => this.datePipe.transform(data.value, false, null, null, null, true),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Project',
        field: 'project.name',
        colId: 'case.name',
        width: 150,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        cellRenderer: 'linkActionRenderer',
        cellRendererParams: { onAction: this.redirectToProject.bind(this) },
        resizable: true,
      },
      {
        headerName: 'Firm',
        field: 'org.name',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Status',
        field: 'status.name',
        colId: 'status.id',
        sortable: true,
        minWidth: 100,
        width: 100,
        resizable: true,
        ...AGGridHelper.getDropdownColumnFilter({
          options: [
            {
              id: ClaimantStatusEnum.Active,
              name: 'Active',
            },
            {
              id: ClaimantStatusEnum.Inactive,
              name: 'Inactive',
            },
          ],
        }),
      },
    ],
    components: { linkActionRenderer: LinkActionRendererComponent },
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
  };

  public actionBarActionHandlers: ActionHandlersMap = {
    back: () => this.back(),
    clearFilter: this.clearFilterAction(),
  };

  constructor(
    public store: Store<fromSettlements.SettlementState>,
    public modalService: ModalService,
    protected router: Router,
    protected elementRef: ElementRef,
    private route: ActivatedRoute,
    private datePipe: DateFormatPipe,
    private ssnPipe: SsnPipe,
    protected readonly decimalPipe: DecimalPipe,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    super.ngOnInit();

    this.settlement$
      .pipe(
        takeUntil(this.ngDestroyed$),
      )
      .subscribe((settlement: Settlement) => {
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
    this.store.dispatch(fromSettlements.actions.GetClaimantList({ settlementId: this.settlementId, agGridParams }));
  }

  public ngOnDestroy(): void {
    this.store.dispatch(fromSettlements.actions.UpdateActionBar({ actionBar: null }));

    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
  }

  public redirectToClaimant({ data }): void {
    this.router.navigate(
      [`/claimants/${data.id}/overview/tabs/details`],
    );
  }

  public redirectToProject({ data }): void {
    this.router.navigate(
      ['projects', data.project.id],
    );
  }

  private back(): void {
    this.store.dispatch(GotoParentView());
  }
}
