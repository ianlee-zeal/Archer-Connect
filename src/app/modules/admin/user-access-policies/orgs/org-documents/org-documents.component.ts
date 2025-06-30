import { Component, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';

import { DocumentsListComponent } from '@app/modules/shared/documents-list/documents-list.component';
import { EntityTypeEnum } from '@app/models/enums';

import { GridId } from '@app/models/enums/grid-id.enum';
import * as fromUserAccessPolices from '../state';
import * as userRoleActions from '../state/actions';
import { OrganizationTabHelper } from '../organization-tab.helper';

@Component({
  selector: 'app-org-documents',
  templateUrl: './org-documents.component.html',
})
export class OrgDocumentsComponent {
  @ViewChild('documents') documents: DocumentsListComponent;

  public entityTypeId = EntityTypeEnum.Organizations;
  public readonly gridId: GridId = GridId.OrgDocuments;

  public readonly entityTypeEnum = EntityTypeEnum;
  public readonly item$ = this.store.select(fromUserAccessPolices.item);
  public readonly error$ = this.store.select(fromUserAccessPolices.error);

  constructor(
    private readonly store: Store<fromUserAccessPolices.AppState>,
  ) {}

  onActionBarUpdated(actionBar) {
    this.store.dispatch(userRoleActions.UpdateOrgsActionBar({
      actionBar: {
        ...actionBar,
        back: () => OrganizationTabHelper.handleBackClick(this.store),
      },
    }));
  }
}
