import { Component } from '@angular/core';
import { StringHelper } from '@app/helpers';
import { IdValue } from '@app/models';
import { ICellRendererAngularComp } from 'ag-grid-angular';

export interface ILinkActionsRendererParams {
  items: IdValue[];
  onActionClick: (item: IdValue) => void;
}

@Component({
  selector: 'app-link-actions-renderer',
  templateUrl: './link-actions-renderer.component.html',
  styleUrls: ['./link-actions-renderer.component.scss'],
})
export class LinkActionsRendererComponent implements ICellRendererAngularComp {
  public params: ILinkActionsRendererParams;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public refresh(_params: any): boolean {
    return true;
  }

  public agInit(params: any): void {
    this.params = params;
  }

  public onActionHandler(item: IdValue): void {
    this.params.onActionClick(item);
  }

  public hasError(item: IdValue) {
    if (!item.name) {
      return false;
    }

    return StringHelper.contains(item.name, 'error');
  }
}
