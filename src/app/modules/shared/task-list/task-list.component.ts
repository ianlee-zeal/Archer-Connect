import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { AGGridHelper } from '@app/helpers';
import { GridOptions } from 'ag-grid-community';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent implements OnDestroy {
  @Input() rowData = [];

  @Output() rowDoubleClicked = new EventEmitter();
  public ngDestroyed$ = new Subject<void>();

  public gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Due',
        field: 'task.due_date',
        width: 120,
        sortable: true,
        cellStyle: { textAlign: 'right' },
        cellRenderer: data => (data.value ? new Date(data.value).toLocaleDateString() : ''),
        resizable: true,
      },
      {
        headerName: 'Completed',
        field: 'task.completed_date',
        width: 120,
        sortable: true,
        cellStyle: { textAlign: 'right' },
        resizable: true,
        cellRenderer: data => (data.value ? new Date(data.value).toLocaleDateString() : ''),
      },
      {
        headerName: 'Name',
        field: 'task.name',
        width: 700,
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Household',
        field: 'task.household.name',
        width: 500,
        sortable: true,
        resizable: true,
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
