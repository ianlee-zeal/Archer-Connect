import { Store } from '@ngrx/store';
import { Component } from '@angular/core';
import { TabItem } from '@app/models';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import * as selectors from './state/selectors';
import { DocumentTypesState } from './state/reducer';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
})
export class DocumentsComponent {
  public actionBar$ = this.store.select(selectors.actionBar);

  protected readonly tabsUrl = './tabs';

  public readonly tabs: TabItem[] = [
    {
      title: 'Documents',
      link: `${this.tabsUrl}/documents-list`,
      permission: PermissionService.create(PermissionTypeEnum.Documents, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Document Types',
      link: `${this.tabsUrl}/document-types`,
      permission: PermissionService.create(PermissionTypeEnum.DocumentType, PermissionActionTypeEnum.Read),
    },
  ];

  constructor(private readonly store: Store<DocumentTypesState>) {}
}
