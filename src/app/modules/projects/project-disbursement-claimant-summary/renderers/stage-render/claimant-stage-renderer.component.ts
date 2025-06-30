import { Component } from '@angular/core';
import { BaseCellRendererComponent } from '@app/modules/shared/_abstractions/base-cell-renderer';

@Component({
  selector: 'app-claimant-stage-renderer',
  templateUrl: './claimant-stage-renderer.component.html',
  styleUrls: ['./claimant-stage-renderer.component.scss'],
})
export class ClaimantStageRendererComponent extends BaseCellRendererComponent {
  public params: any;
  public isPreviousStage: boolean;

  refresh(): boolean {
    return true;
  }

  agInit(params: any): void {
    this.params = params;
    this.isPreviousStage = params.data.backwardFromPrevStage;
  }
}
