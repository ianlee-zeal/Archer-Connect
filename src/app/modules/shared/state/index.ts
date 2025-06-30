import * as fromRoot from '@app/state';

import * as commonActions from './common.actions';
import * as addAddressModalActions from '../../addresses/add-address-modal/state/actions';
import * as documentsListActions from './documents-list/actions';
import * as savedSearchActions from './saved-search/actions';
import * as documentDetailsActions from './document-details/actions';
import * as documentUploadActions from './upload-document/actions';
import * as uploadBulkDocumentActions from './upload-bulk-document/actions';
import * as documentGenerationActions from './document-generation/actions';
import * as notesListActions from './notes-list/actions';
import * as personGeneralInfoActions from './person-general-info/actions';
import * as settlementInfoActions from './settlement-info/actions';
import * as clientsListActions from './clients-list/actions';
import * as actionsLogActions from './actions-log-list/actions';
import * as userRolesListActions from './user-roles-list/actions';
import * as dropDownsValuesActions from './drop-downs-values/actions';
import * as mfaCodeActions from './mfa-code-modal/actions';
import * as changeHistoryActions from './change-history-list/actions';
import * as stageHistoryActions from './stage-history/actions';
import * as outcomeBasedPricingActions from './outcome-based-pricing/actions';
import * as dragDropMultipleActions from './drag-and-drop-multiple/actions';
import * as entitySelectionActions from './entity-selection-modal/actions';
import * as digitalPaymentActions from './digital-payments/actions';
import * as emailActions from './email/actions';

import { SharedModuleState } from './shared.state';

import { commonSelectors } from './common.selectors';
import { addAddressModalSelectors } from '../../addresses/add-address-modal/state/selectors';
import { documentsListSelectors } from './documents-list/selectors';
import { documentDetailsSelectors } from './document-details/selectors';
import { uploadDocumentSelectors } from './upload-document/selectors';
import { uploadBulkDocumentSelectors } from './upload-bulk-document/selectors';
import { notesListSelectors } from './notes-list/selectors';
import { personGeneralInfoSelectors } from './person-general-info/selectors';
import { settlementInfoSelectors } from './settlement-info/selectors';
import { clientsListSelectors } from './clients-list/selectors';
import { actionsLogSelectors } from './actions-log-list/selectors';
import { userRolesListSelectors } from './user-roles-list/selectors';
import { savedSearchSelectors } from './saved-search/selectors';
import { dropDownsValuesSelectors } from './drop-downs-values/selectors';
import { mfaCodeModalSelectors } from './mfa-code-modal/selectors';
import { outcomeBasedPricingSelectors } from './outcome-based-pricing/selectors';
import { taskDetailsTemplateSelectors } from './task-details-template/selectors';
import { dragDropMultipleSelectors } from './drag-and-drop-multiple/selectors';

// Addresses
import { addressesListSelectors } from '../../addresses/address-list/state/selectors';
import * as addressesListActions from '../../addresses/address-list/state/actions';
import { documentGenerationSelectors } from './document-generation/selectors';
import { digitalPaymentSelectors } from './digital-payments/selectors';
import { emailSelectors } from './email/selectors';

// Extends the app state to include the product feature.
// This is required because products are lazy loaded.
// So the reference to ProductState cannot be added to app.state.ts directly.
export interface AppState extends fromRoot.AppState {
  shared_feature: SharedModuleState,
}

export const sharedSelectors = {
  commonSelectors,
  documentsListSelectors,
  documentDetailsSelectors,
  uploadDocumentSelectors,
  uploadBulkDocumentSelectors,
  documentGenerationSelectors,

  addAddressModalSelectors,
  addressesListSelectors,

  notesListSelectors,

  personGeneralInfoSelectors,
  settlementInfoSelectors,
  clientsListSelectors,

  actionsLogSelectors,

  userRolesListSelectors,
  savedSearchSelectors,
  dropDownsValuesSelectors,

  mfaCodeModalSelectors,
  outcomeBasedPricingSelectors,
  taskDetailsTemplateSelectors,
  dragDropMultipleSelectors,
  digitalPaymentSelectors,
  emailSelectors,
};

export const sharedActions = {
  commonActions,
  documentsListActions,
  savedSearchActions,
  documentDetailsActions,
  documentUploadActions,
  uploadBulkDocumentActions,
  documentGenerationActions,

  addAddressModalActions,
  addressesListActions,

  notesListActions,

  personGeneralInfoActions,
  settlementInfoActions,

  clientsListActions,

  actionsLogActions,

  userRolesListActions,

  dropDownsValuesActions,

  mfaCodeActions,

  changeHistoryActions,

  stageHistoryActions,
  outcomeBasedPricingActions,
  dragDropMultipleActions,

  entitySelectionActions,
  digitalPaymentActions,
  emailActions,
};
