import { Component, Input } from '@angular/core';
import { GridId } from '@app/models/enums/grid-id.enum';
import { DeficienciesListBase } from '@app/modules/shared/_abstractions/deficiencies-list.base';
import { Observable } from 'rxjs';
import { BatchActionReviewOption } from '@app/models/batch-action/batch-action-review-option';

@Component({
  selector: 'app-invoice-archer-fees-deficiencies-warning-list',
  templateUrl: './invoice-archer-fees-deficiencies-warning-list.component.html',
})
export class InvoiceArcherFeesDeficienciesWarningListComponent extends DeficienciesListBase {
  public readonly gridId: GridId = GridId.InvoiceArcherDeficienciesWarningList;
  @Input('deficiencies') public deficiencies$: Observable<BatchActionReviewOption[]>;
}
