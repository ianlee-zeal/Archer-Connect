import { Component, Input } from '@angular/core';
import { GridId } from '@app/models/enums/grid-id.enum';
import { DeficienciesListBase } from '@app/modules/shared/_abstractions/deficiencies-list.base';
import { Observable } from 'rxjs';
import { DeficiencySummaryOption } from '@app/models/documents/document-generators/deficiency-summary-option';

@Component({
  selector: 'app-dw-deficiencies-warning-list',
  templateUrl: './deficiencies-warning-list.component.html',
})
export class DwDeficienciesWarningListComponent extends DeficienciesListBase {
  public readonly gridId: GridId = GridId.UpdateStageDeficienciesWarningList;
  @Input('deficiencies') public deficiencies$: Observable<DeficiencySummaryOption[]>;
}
