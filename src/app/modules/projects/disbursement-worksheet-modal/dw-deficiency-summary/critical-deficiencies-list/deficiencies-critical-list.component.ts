import { Component, Input } from '@angular/core';
import { GridId } from '@app/models/enums/grid-id.enum';
import { DeficienciesListBase } from '@app/modules/shared/_abstractions/deficiencies-list.base';
import { Observable } from 'rxjs';
import { DeficiencySummaryOption } from '@app/models/documents/document-generators/deficiency-summary-option';

@Component({
  selector: 'app-dw-deficiencies-critical-list',
  templateUrl: './deficiencies-critical-list.component.html',
})
export class DwDeficienciesCriticalListComponent extends DeficienciesListBase {
  public readonly gridId: GridId = GridId.UpdateStageDeficienciesCriticalList;
  @Input('deficiencies') public deficiencies$: Observable<DeficiencySummaryOption[]>;
}
