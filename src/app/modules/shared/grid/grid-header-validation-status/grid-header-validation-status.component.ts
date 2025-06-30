import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Column } from 'ag-grid-community';
import { AgFrameworkComponent } from 'ag-grid-angular';
import { ValidationStatus } from '@app/models/enums';

export interface IGridHeaderValidationStatusParams {
  getStatus: () => Observable<ValidationStatus>;
  displayName?: string;
  column?: Column;
}

@Component({
  selector: 'app-grid-header-validation-status',
  templateUrl: './grid-header-validation-status.component.html',
  styleUrls: ['./grid-header-validation-status.component.scss'],
})
export class GridHeaderValidationStatusComponent implements AgFrameworkComponent<IGridHeaderValidationStatusParams> {
  readonly statuses = ValidationStatus;

  params: IGridHeaderValidationStatusParams;
  status$: Observable<ValidationStatus>;

  agInit(params: IGridHeaderValidationStatusParams): void {
    this.params = params;
    this.status$ = params.getStatus();
  }
}
