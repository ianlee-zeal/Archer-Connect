import { Component } from '@angular/core';
import { INoRowsOverlayAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-no-rows-overlay',
  templateUrl: './no-rows-overlay.component.html',
  styleUrls: ['./no-rows-overlay.component.scss'],
})
export class NoRowsOverlay implements INoRowsOverlayAngularComp {
  public params: any & { noRowsMessageFunc: () => string};

  agInit(params: any & { noRowsMessageFunc: () => string }): void {
    this.params = params;
  }
}
