import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-link-action-renderer',
  template: '<a *ngIf="showLink" href="javascript:void(0)" class="btn btn-link" (click)="onActionHandler()">{{ params.value }}</a>',
  styleUrls: ['./link-action-renderer.component.scss'],
})
export class LinkActionRendererComponent implements ICellRendererAngularComp {
  public params: any;

  public refresh(params: any): boolean {
    this.params = params;
    return true;
  }

  public agInit(params: any): void {
    this.params = params;
  }

  public onActionHandler(): void {
    this.params.onAction(this.params);
  }

  get showLink(): boolean {
    return (this.params.showLink && this.params.showLink(this.params)) || !this.params.showLink;
  }
}
