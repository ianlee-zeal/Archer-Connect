import { Component } from '@angular/core';
import { ClaimantElection } from '@app/models';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-claimant-election-forms-list-action-panel-renderer',
  templateUrl: './claimant-election-forms-list-action-panel-renderer.component.html',
  styleUrls: ['./claimant-election-forms-list-action-panel-renderer.component.scss'],
})
export class ClaimantElectionFormsListActionPanelRendererComponent implements ICellRendererAngularComp {
  public params: any;
  public electionForm: ClaimantElection;
  public editElectionFormPermission = PermissionService.create(PermissionTypeEnum.ElectionForms, PermissionActionTypeEnum.Edit);

  refresh(): boolean {
    return true;
  }

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.electionForm = params.data;
  }

  onViewElectionFormClick(): void {
    this.params.onViewElectionFormHandler(this.params.node);
  }

  onEditElectionFormClick(): void {
    this.params.onEditElectionFormHandler(this.params.node);
  }
}
