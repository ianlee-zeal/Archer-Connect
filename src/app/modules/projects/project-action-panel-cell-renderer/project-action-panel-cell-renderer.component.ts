import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-project-action-panel-cell-renderer',
  templateUrl: './project-action-panel-cell-renderer.component.html',
  styleUrls: ['./project-action-panel-cell-renderer.component.scss'],
})
export class ProjectActionPanelCellRendererComponent implements ICellRendererAngularComp {
  public params: any;

  refresh(params: any): boolean {
    this.params = params;
    return true;
  }

  agInit(params: any): void {
    this.params = params;
  }

  onEditProjectClick() {
    this.params.editProjectHandler(this.params);
  }
}
