import { Component } from '@angular/core';
import { BaseCellRendererComponent } from '@app/modules/shared/_abstractions/base-cell-renderer';

/**
 * Component for rendering lists
 *
 * @export
 * @class ListRendererComponent
 * @extends {BaseCellRendererComponent}
 */
@Component({
  selector: 'app-list-renderer',
  templateUrl: './list-renderer.component.html',
  styleUrls: ['./list-renderer.component.scss'],
})
export class ListRendererComponent extends BaseCellRendererComponent {
  public params: any;
  public list = [];

  refresh(): boolean {
    return true;
  }

  agInit(params: any): void {
    this.params = params;
    this.list = params.value;
  }
}
