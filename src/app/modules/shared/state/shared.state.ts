import { TabInfoState } from './tab-info/state';
import { SharedState } from './common.reducer';
import { SharedDocumentsListState } from './documents-list/reducer';
import { DragDropMultipleState } from './drag-and-drop-multiple/reducer';
import { SharedDocumentDetailsState } from './document-details/reducer';
import { SharedDocumentUploadState } from './upload-document/reducer';
import { SharedNotesListState } from './notes-list/state';
import { SharedPersonGeneralInfoState } from './person-general-info/state';
import { ClientsListState } from './clients-list/reducer';
import { SharedActionsLogListState } from './actions-log-list/reducer';
import { SharedUserRolesListState } from './user-roles-list/reducer';
import { DropDownsValuesState } from './drop-downs-values/reducer';
import { SharedMfaCodeModalState } from './mfa-code-modal/reducer';
import { SharedUploadBulkDocumentState } from './upload-bulk-document/reducer';
import { SharedDocumentGenerationState } from './document-generation/reducer';
import { SharedSavedSearchState } from './saved-search/reducer';
import { SharedRecentViewsState } from './recent-views/reducer';
import { SharedPinnedPagesState } from './pinned-pages/reducer';
import { SharedExportsState } from './exports/reducer';
import { SharedPusherChannelState } from './pusher-channels/reducer';
import { SharedSettlementInfoState } from './settlement-info/state';
import { ElectionFormChangeHistoryListState } from './change-history-list/reducer';
import { StageHistoryState } from './stage-history/reducer';
import { PricingComponentsState } from './pricing-components/reducer';
import { OutcomeBasedPricingState } from './outcome-based-pricing/reducer';
import { TasksDetailsTemplateState } from './task-details-template/reducer';
import { DigitalPaymentState } from './digital-payments/reducer';
import { EmailState } from './email/reducer';

export const FEATURE_NAME = 'shared_feature';

export interface SharedModuleState {
  common: SharedState,

  documentsList: SharedDocumentsListState,
  documentDetails: SharedDocumentDetailsState,
  documentUpload: SharedDocumentUploadState,
  uploadBulkDocument: SharedUploadBulkDocumentState,
  documentGeneration: SharedDocumentGenerationState,
  exports: SharedExportsState,
  pusherChannel: SharedPusherChannelState,

  notesList: SharedNotesListState,
  savedSearch: SharedSavedSearchState,

  personGeneralInfo: SharedPersonGeneralInfoState,
  clientsList: ClientsListState,
  actionsLogList: SharedActionsLogListState,

  userRolesList: SharedUserRolesListState,

  dropDownsValues: DropDownsValuesState,

  mfaCodeModal: SharedMfaCodeModalState,

  recentViews: SharedRecentViewsState,
  pinnedPages: SharedPinnedPagesState,

  settlementInfo: SharedSettlementInfoState,

  tabInfo: TabInfoState,

  electionFormChangeHistory: ElectionFormChangeHistoryListState
  stageHistory: StageHistoryState,

  pricingComponents: PricingComponentsState,
  outcomeBasedPricing: OutcomeBasedPricingState,
  tasksDetailsTemplate: TasksDetailsTemplateState,

  dragDropMultiple: DragDropMultipleState,
  digitalPayment: DigitalPaymentState,
  emailState: EmailState,
}
