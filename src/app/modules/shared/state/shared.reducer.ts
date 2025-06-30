import { SharedReducer } from './common.reducer';
import { SharedDocumentsListReducer } from './documents-list/reducer';
import { SharedDocumentDetailsReducer } from './document-details/reducer';
import { SharedDocumentUploadReducer } from './upload-document/reducer';
import { SharedNotesListReducer } from './notes-list/reducer';
import { SharedPersonGeneralInfoReducer } from './person-general-info/reducer';
import { ClientsListReducer } from './clients-list/reducer';
import { SharedActionsLogListReducer } from './actions-log-list/reducer';
import { SharedUserRolesListReducer } from './user-roles-list/reducer';
import { Reducer as DropDownsValuesReducer } from './drop-downs-values/reducer';
import { SharedMfaCodeReducer } from './mfa-code-modal/reducer';
import { SharedUploadBulkDocumentReducer } from './upload-bulk-document/reducer';
import { SharedSavedSearchReducer } from './saved-search/reducer';
import { SharedRecentViewsReducer } from './recent-views/reducer';
import { SharedPinnedPagesReducer } from './pinned-pages/reducer';
import { SharedExportsReducer } from './exports/reducer';
import { SharedPusherChannelsReducer } from './pusher-channels/reducer';
import { SharedDocumentGenerationReducer } from './document-generation/reducer';
import { SharedSettlementInfoReducer } from './settlement-info/reducer';
import { TabInfoReducer } from './tab-info/reducer';
import { ChangeHistoryListReducer } from './change-history-list/reducer';
import { StageHistoryReducer } from './stage-history/reducer';
import { PricingComponentsReducer } from './pricing-components/reducer';
import { OutcomeBasedPricingReducer } from './outcome-based-pricing/reducer';
import { TasksDetailsTemplateReducer } from './task-details-template/reducer';
import { DragDropMultipleReducer } from './drag-and-drop-multiple/reducer';
import { SharedDigitalPaymentsReducer } from './digital-payments/reducer';
import { EmailReducer } from './email/reducer';

export const sharedReducer = {
  common: SharedReducer,
  documentsList: SharedDocumentsListReducer,
  documentDetails: SharedDocumentDetailsReducer,
  documentUpload: SharedDocumentUploadReducer,
  uploadBulkDocument: SharedUploadBulkDocumentReducer,
  documentGeneration: SharedDocumentGenerationReducer,
  exports: SharedExportsReducer,
  notesList: SharedNotesListReducer,
  personGeneralInfo: SharedPersonGeneralInfoReducer,
  settlementInfo: SharedSettlementInfoReducer,
  clientsList: ClientsListReducer,
  actionsLogList: SharedActionsLogListReducer,
  savedSearch: SharedSavedSearchReducer,
  userRolesList: SharedUserRolesListReducer,
  dropDownsValues: DropDownsValuesReducer,
  mfaCodeModal: SharedMfaCodeReducer,
  recentViews: SharedRecentViewsReducer,
  pinnedPages: SharedPinnedPagesReducer,
  pusherChannels: SharedPusherChannelsReducer,
  tabInfo: TabInfoReducer,
  electionFormChangeHistory: ChangeHistoryListReducer,
  stageHistory: StageHistoryReducer,
  pricingComponents: PricingComponentsReducer,
  outcomeBasedPricing: OutcomeBasedPricingReducer,
  tasksDetailsTemplate: TasksDetailsTemplateReducer,
  dragDropMultiple: DragDropMultipleReducer,
  digitalPayment: SharedDigitalPaymentsReducer,
  emailState: EmailReducer,
};
