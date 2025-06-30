import { Component } from '@angular/core';
import { DeficiencySettingsTemplate } from '@app/models/deficiencies/deficiency-settings-template';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { DeficiencySettingsTemplateService } from '../../services/deficiency-settings-template.service';

@Component({
  selector: 'app-project-deficiencies-actions-renderer',
  templateUrl: './project-deficiencies-actions-renderer.component.html',
  styleUrls: ['./project-deficiencies-actions-renderer.component.scss'],
})
export class ProjectDeficienciesActionsRendererComponent implements ICellRendererAngularComp {
  public params;
  public deficiencyConfigurationPermissions: string;

  constructor(private readonly templateService: DeficiencySettingsTemplateService) {

  }

  refresh(): boolean {
    return true;
  }

  agInit(params: any): void {
    this.params = params;
    this.deficiencyConfigurationPermissions = PermissionService.create(PermissionTypeEnum.ProjectQsfDeficiencies, PermissionActionTypeEnum.DeficiencyConfiguration);
  }

  onEdit(): void {
    this.params.editHandler(this.params);
  }

  setAsPrimary(): void {
    this.params.setAsPrimary(this.params);
  }

  onCopy(): void {
    this.params.copyHandler(this.params);
  }

  canShowEditBtn(): boolean {
    const template = this.params.data as DeficiencySettingsTemplate;
    return this.templateService.canEditTemplate(template);
  }

  canShowSetDefaultBtn(): boolean {
    const template = this.params.data as DeficiencySettingsTemplate;
    return this.templateService.canSetDefaultTemplate(template);
  }
}
