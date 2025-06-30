import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

import { PermissionTypeEnum, PermissionActionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';

@Component({
  selector: 'app-doc-types-buttons-renderer',
  templateUrl: './doc-types-buttons-renderer.html',
  styleUrls: ['./doc-types-buttons-renderer.scss'],
})
export class DocTypesButtonsRendererComponent implements ICellRendererAngularComp {
  public params: any;
  public editPermission = PermissionService.create(PermissionTypeEnum.DocumentType, PermissionActionTypeEnum.Edit);

  get isSystem(): boolean {
    return !!this.params?.data?.isSystem;
  }

  agInit(params: any): void {
    this.params = params;
  }

  refresh(): boolean {
    return true;
  }

  onEditDocTypeHandler() {
    this.params.editDocTypeHandler(this.params);
  }
}
