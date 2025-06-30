import { Component } from '@angular/core';
import { EntityAddress } from '@app/models';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-address-tag-renderer',
  templateUrl: './address-tag-renderer.component.html',
  styleUrls: ['./address-tag-renderer.component.scss'],
})
export class AddressTagRendererComponent implements ICellRendererAngularComp {
  public params: ICellRendererParams;
  public address: EntityAddress;

  public refresh(): boolean {
    return true;
  }

  public agInit(params: ICellRendererParams): void {
    this.params = params;
    this.address = params.value;
  }
}
