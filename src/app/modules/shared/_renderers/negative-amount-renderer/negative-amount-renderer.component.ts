import { Component } from '@angular/core';
import { CommonHelper, CurrencyHelper } from '@app/helpers';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-negative-amount-renderer',
  templateUrl: './negative-amount-renderer.component.html',
})
export class NegativeAmountRendererComponent implements ICellRendererAngularComp {
  private params: ICellRendererParams;

  public refresh(): boolean {
    return true;
  }

  public agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  public get renderAmount() {
    const value = this.params?.value;
    if (CommonHelper.isNullOrUndefined(value)) {
      return '';
    }
    return value < 0 ? `(${CurrencyHelper.toUsdIfNumber({ value: Math.abs(value) })})` : `${CurrencyHelper.toUsdIfNumber(this.params)}`;
  }
}
