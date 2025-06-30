import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { GridId } from '@app/models/enums/grid-id.enum';
import { GridOptions } from 'ag-grid-community';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { DisbursementGroup } from '@app/models/disbursement-group';
import { IdValue } from '@app/models';
import { EntityTypeDisplayEnum, EntityTypeEnum, ProductCategory } from '@app/models/enums';
import * as fromShared from '../state';
import { DateFormatPipe } from '../_pipes';

const { sharedActions } = fromShared;

@Component({
  selector: 'app-change-history-list',
  templateUrl: './change-history-list.component.html',
  styleUrls: ['./change-history-list.component.scss'],
})
export class ChangeHistoryListComponent extends ListView implements OnInit {
  @Output() public actionBarUpdated: EventEmitter<ActionHandlersMap> = new EventEmitter();

  @Input() id: number;
  @Input() productCategory: ProductCategory;
  @Input() availableDisbursementGroupsForElectionForm: DisbursementGroup[];
  @Input() electionFormStatusOptions: IdValue[];
  @Input() documentChannels: IdValue[];
  @Input() showEntityTypeColumn = false;

  public get probateCategory(): boolean {
    return this.productCategory === ProductCategory.Probate;
  }

  public gridId: GridId = GridId.ChangeHistory;

  public gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'User',
        field: 'displayName',
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Date',
        field: 'date',
        colId: 'auditDate',
        cellRenderer: data => (data ? this.datePipe.transform(data.value) : null),
        ...AGGridHelper.dateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Field',
        field: 'columnName',
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Previous Value',
        field: 'oldValue',
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'New Value',
        field: 'newValue',
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
    ],
  };

  constructor(
    router: Router,
    elementRef: ElementRef,
    private readonly store: Store<fromShared.AppState>,
    private readonly datePipe: DateFormatPipe,
  ) { super(router, elementRef); }

  public ngOnInit(): void {
    super.ngOnInit();

    this.actionBarUpdated.emit({ clearFilter: this.clearFilterAction() });

    if (this.probateCategory) {
      const sortableColumns = this.gridOptions.columnDefs.map(column => ({ ...column, sortable: true }));
      this.gridOptions = {
        ...this.gridOptions,
        columnDefs: sortableColumns,
        defaultColDef: {
          ...AGGridHelper.defaultGridOptions.defaultColDef,
          floatingFilter: true,
        },
      };
    }

    if (this.showEntityTypeColumn) {
      this.gridOptions.columnDefs.splice(2, 0, {
        headerName: 'Entity ID',
        field: 'entityId',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      });
      this.gridOptions.columnDefs.splice(3, 0, {
        headerName: 'Entity Type',
        field: 'entityType',
        colId: 'entityTypeId',
        sortable: true,
        ...AGGridHelper.getDropdownColumnFilter({
          options: [
            {
              id: EntityTypeEnum.ClientContacts,
              name: 'Contact',
            },
            {
              id: EntityTypeEnum.Documents,
              name: EntityTypeDisplayEnum[EntityTypeEnum.Documents],
            },
            {
              id: EntityTypeEnum.Probates,
              name: EntityTypeDisplayEnum[EntityTypeEnum.Probates],
            },
            {
              id: EntityTypeEnum.Notes,
              name: EntityTypeDisplayEnum[EntityTypeEnum.Notes],
            },
            {
              id: EntityTypeEnum.ProbatePacketRequest,
              name: EntityTypeDisplayEnum[EntityTypeEnum.ProbatePacketRequest],
            },
          ],
        }),
        ...AGGridHelper.nameColumnDefaultParams,
      });
    }
  }

  protected fetchData(agGridParams): void {
    this.gridParams = agGridParams;

    if (this.probateCategory) {
      this.store.dispatch(sharedActions.changeHistoryActions.GetProbateChangeHistoryList({ probateId: this.id, agGridParams: this.gridParams }));
    } else {
      this.store.dispatch(sharedActions.changeHistoryActions.GetChangeHistoryList({ electionFormId: this.id, agGridParams }));
    }
  }

  public gridReady(gridApi): void {
    super.gridReady(gridApi);
  }
}
