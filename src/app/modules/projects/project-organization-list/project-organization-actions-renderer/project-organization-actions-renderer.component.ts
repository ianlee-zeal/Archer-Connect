import { Component } from '@angular/core';
import { GridActionsRendererComponent } from '@app/entities';
import { ProjectOrganizationItem } from '@app/models';

@Component({
  selector: 'app-project-organization-actions-renderer',
  templateUrl: './project-organization-actions-renderer.component.html',
  styleUrls: ['./project-organization-actions-renderer.component.scss'],
})
export class ProjectOrganizationActionsRendererComponent extends GridActionsRendererComponent<ProjectOrganizationItem> {
  get isOrganization(): boolean {
    return this.params?.data?.organizationId || (this.params as any)?.node?.group;
  }

  agInit(params: any): void {
    this.params = params;
  }

  onView() {
    const item = new ProjectOrganizationItem();
    item.organizationId = this.params?.data?.organizationId || (this.params as any)?.node?.aggData?.parentId;
    this.params.viewHandler(item);
  }
}
