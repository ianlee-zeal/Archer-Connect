import { Component } from '@angular/core';

import { BaseCellRendererComponent } from '@app/modules/shared/_abstractions/base-cell-renderer';
import { LienServiceStatus } from '@app/models/enums/lien-service-status.enum';
import { Store } from '@ngrx/store';
import { ProductCategory } from '@app/models/enums';
import * as selectors from '../../state/selectors';
import { ClaimantDetailsState } from '../../state/reducer';

@Component({
  selector: 'app-lien-service-renderer',
  templateUrl: './lien-service-renderer.component.html',
  styleUrls: ['./lien-service-renderer.component.scss'],
})
export class LienServiceRendererComponent extends BaseCellRendererComponent {
  public readonly statuses = LienServiceStatus;
  public readonly productCategoryEnum = ProductCategory;
  public readonly finalizedDate$ = this.store.select(selectors.claimantFinalizedDate);

  constructor(private store: Store<ClaimantDetailsState>) {
    super();
  }

  public onClick(): void {
    if (!this.params.onClick) {
      return;
    }

    this.params.onClick(this.params.value);
  }
}
