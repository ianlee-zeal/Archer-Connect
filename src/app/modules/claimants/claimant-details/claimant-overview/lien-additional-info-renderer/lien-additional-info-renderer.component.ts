import { Component, OnDestroy, ViewChild } from '@angular/core';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { takeUntil, filter } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';

import { BaseCellRendererComponent } from '@app/modules/shared/_abstractions/base-cell-renderer';
import { KeyValue } from '@app/models/key-value';

@Component({
  selector: 'app-lien-additional-info-renderer',
  templateUrl: './lien-additional-info-renderer.component.html',
  styleUrls: ['./lien-additional-info-renderer.component.scss'],
})
export class LienAdditionalInfoRendererComponent extends BaseCellRendererComponent implements OnDestroy {
  @ViewChild('tooltip', { read: NgbTooltip, static: false }) private tooltip: NgbTooltip;

  public isOpenTooltip: boolean;
  public loading: boolean;
  public data: KeyValue[];

  private data$: Observable<KeyValue[]>;

  private ngUnsubscribe$ = new Subject<void>();

  public agInit(params: any): void {
    super.agInit(params);

    this.data$ = this.params.getDataGetter(this.params.value.id);

    this.data$
      .pipe(
        filter(data => !!data),
        takeUntil(this.ngUnsubscribe$))
      .subscribe((data: KeyValue[]) => {
        this.data = data;
        this.tooltip.open();
        this.loading = false;
      });
  }

  public onTooltipShown(): void {
    this.isOpenTooltip = true;
  }

  public onTooltipHidden(): void {
    this.isOpenTooltip = false;
  }

  public toggle(): void {
    if (this.isOpenTooltip) {
      this.close();
    }
    else {
      this.open();
    }
  }

  public open(): void {
    const value = this.params.value;
    const productCategoryId = value.id;
    const productCategoryTypeId = value.service && value.service.id;

    if (productCategoryId) {
      this.params.loadData(productCategoryId, productCategoryTypeId);
      this.loading = true;
    }
  }

  public close(): void {
    this.tooltip.close();
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
