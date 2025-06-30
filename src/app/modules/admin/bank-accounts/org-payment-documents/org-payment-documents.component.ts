import { Component, OnInit, ViewChild } from '@angular/core';
import { EntityTypeEnum, GridId, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { DocumentsListComponent } from '@app/modules/shared/documents-list/documents-list.component';
import { Store } from '@ngrx/store';
import * as fromShared from '@app/modules/shared/state';
import { DocumentType } from '@app/models/enums/document-generation/document-type.enum';
import * as fromOrgs from '@app/modules/admin/user-access-policies/orgs/state';
import { ActionHandlersMap, ActionObject } from '@app/modules/shared/action-bar/action-handlers-map';
import { PermissionService } from '@app/services';
import * as actions from '../state/actions';
import * as fromUserAccessPolices from '../../user-access-policies/orgs/state';
import { OrganizationTabHelper } from '../../user-access-policies/orgs/organization-tab.helper';

@Component({
  selector: 'app-org-payment-documents',
  templateUrl: './org-payment-documents.component.html',
})
export class OrgPaymentDocumentsComponent implements OnInit {
  @ViewChild('documents') documents: DocumentsListComponent;

  public readonly item$ = this.store.select(fromUserAccessPolices.item);

  public entityTypeId = EntityTypeEnum.Organizations;
  public documentTypeId = DocumentType.WireInstruction;
  public readonly gridId: GridId = GridId.OrgPaymentInstructionDocuments;

  constructor(
    private readonly store: Store<fromOrgs.AppState>,
  ) {}

  public ngOnInit(): void {
    // Update Search params for grid, should display only items with documentType = WireInstruction
    this.store.dispatch(fromShared.sharedActions.documentsListActions.UpdateDocumentsListSearch({
      search: {
        documentTypeId: DocumentType.WireInstruction,
        entityTypeIdToFilterDocTypes: EntityTypeEnum.PaymentItemStatus,
      },
    }));
  }

  public onActionBarUpdated(actionBar: ActionHandlersMap): void {
    const newActionObject: ActionObject = actionBar.new as ActionObject;
    this.store.dispatch(actions.UpdateBankAccountsActionBar({
      actionBar: {
        ...actionBar,
        // Set Permission for New action bar btn
        new: {
          ...actionBar.new,
          permissions: [
            newActionObject.permissions as string,
            PermissionService.create(PermissionTypeEnum.Documents, PermissionActionTypeEnum.ManageWireInstructions),
          ],
        },
        back: () => this.cancel(),
      },
    }));
  }

  public cancel(): void {
    OrganizationTabHelper.handleBackClick(this.store);
  }
}
