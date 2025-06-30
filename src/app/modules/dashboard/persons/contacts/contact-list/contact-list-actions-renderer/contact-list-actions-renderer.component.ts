import { Component } from '@angular/core';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-contact-list-actions-renderer',
  templateUrl: './contact-list-actions-renderer.component.html',
  styleUrls: ['./contact-list-actions-renderer.component.scss'],
})
export class ContactListActionsRendererComponent implements ICellRendererAngularComp {
  public params;

  protected personDetailsReadPermission = [
    PermissionService.create(PermissionTypeEnum.GlobalPersonSearch, PermissionActionTypeEnum.Read),
    PermissionService.create(PermissionTypeEnum.Persons, PermissionActionTypeEnum.Read)
  ];
  protected contactEditPermission = [PermissionService.create(PermissionTypeEnum.ClientContact, PermissionActionTypeEnum.Edit)]

  private readonly legalContactEditPermission = PermissionService.create(PermissionTypeEnum.LegalContacts, PermissionActionTypeEnum.Edit);

  refresh(): boolean {
    return true;
  }

  agInit(params: any): void {
    this.params = params;
    this.params.data.isLegalContact && this.contactEditPermission.push(this.legalContactEditPermission);
  }

  onEditClick() {
    this.params.editHandler(this.params);
  }

  onViewPersonDetailsClick() {
    this.params.viewPersonDetailsHandler(this.params);
  }
}
