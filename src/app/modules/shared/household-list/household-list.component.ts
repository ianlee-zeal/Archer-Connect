import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { Subject } from 'rxjs';
import { AGGridHelper } from '@app/helpers';
import { checkboxColumn } from '../_grid-columns/columns';

@Component({
  selector: 'app-household-list',
  templateUrl: './household-list.component.html',
  styleUrls: ['./household-list.component.scss'],
})
export class HouseholdListComponent implements OnDestroy {
  @Input() rowData;
  @Output() rowDoubleClicked = new EventEmitter();
  public ngDestroyed$ = new Subject<void>();
  public gridOptions: GridOptions = {
    columnDefs: [
      checkboxColumn,
      {
        headerName: 'Name',
        field: 'household.name',
        width: 400,
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Advisor',
        field: 'household.advisor_name',
        width: 140,
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'CSA',
        field: 'household.primary_csa_advisor_name',
        width: 140,
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Managed',
        field: 'household.managed_value',
        width: 140,
        sortable: true,
        resizable: true,
        cellStyle: { textAlign: 'right' },
        cellRenderer: data => {
          return data.value
            ? '$' +
            parseFloat(data.value)
              .toFixed(2)
              .replace(/\d(?=(\d{3})+\.)/g, '$&,')
            : '';
        },
      },
      {
        headerName: 'Status',
        field: 'household.status',
        width: 100,
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Created',
        field: 'household.created_at',
        width: 100,
        sortable: true,
        resizable: true,
        cellStyle: { textAlign: 'right' },
        cellRenderer: data => {
          return data.value ? new Date(data.value).toLocaleDateString() : '';
        },
      },
    ],
    animateRows: false,
    defaultColDef: {
      sortable: false,
    },
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  private onRowDoubleClicked(row): void {
    this.rowDoubleClicked.emit(row);
  }

  public ngOnDestroy(): void {
    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
  }
}
