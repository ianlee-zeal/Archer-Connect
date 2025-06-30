import { SharedEffects } from './common.effects';
import { DocumentsListEffects } from './documents-list/effects';
import { DocumentDetailsEffects } from './document-details/effects';
import { DocumentUploadEffects } from './upload-document/effects';
import { NotesListEffects } from './notes-list/effects';
import { PersonGeneralInfoEffects } from './person-general-info/effects';
import { SettlementInfoEffects } from './settlement-info/effects';
import { ClientsListEffects } from './clients-list/effects';
import { ActionsLogListEffects } from './actions-log-list/effects';
import { UserRolesListEffects } from './user-roles-list/effects';
import { DropDownsValuesEffects } from './drop-downs-values/effects';
import { MfaCodeModalEffects } from './mfa-code-modal/effects';
import { GridPagerEffects } from '../grid-pager/state/effects';
import { DocumentGenerationEffects } from './document-generation/effects';
import { UploadBulkDocumentEffects } from './upload-bulk-document/effects';
import { SavedSearchEffects } from './saved-search/effects';
import { RecentViewsEffects } from './recent-views/effects';
import { PinnedPagesEffects } from './pinned-pages/effects';
import { ExportsEffects } from './exports/effects';
import { PusherChannelEffects } from './pusher-channels/effects';
import { EntitySelectionModalEffects } from './entity-selection-modal/effects';
import { TabInfoEffects } from './tab-info/effects';
import { ChangeHistoryListEffects } from './change-history-list/effects';
import { StageHistoryListEffects } from './stage-history/effects';
import { PricingComponentsEffects } from './pricing-components/effects';
import { OutcomeBasedPricingEffects } from './outcome-based-pricing/effects';
import { TasksDetailsTemplateEffects } from './task-details-template/effects';
import { DragDropMultipleEffects } from './drag-and-drop-multiple/effects';
import { DigitalPaymentEffects } from './digital-payments/effects';
import { EmailEffects } from './email/effects';

export const sharedEffects: any[] = [
  SharedEffects,
  DocumentsListEffects,
  DocumentDetailsEffects,
  DocumentUploadEffects,
  UploadBulkDocumentEffects,
  DocumentGenerationEffects,
  NotesListEffects,
  SavedSearchEffects,
  PersonGeneralInfoEffects,
  SettlementInfoEffects,
  ClientsListEffects,
  ActionsLogListEffects,
  UserRolesListEffects,
  DropDownsValuesEffects,
  MfaCodeModalEffects,
  GridPagerEffects,
  RecentViewsEffects,
  PinnedPagesEffects,
  ExportsEffects,
  PusherChannelEffects,
  EntitySelectionModalEffects,
  TabInfoEffects,
  ChangeHistoryListEffects,
  StageHistoryListEffects,
  PricingComponentsEffects,
  OutcomeBasedPricingEffects,
  TasksDetailsTemplateEffects,
  DragDropMultipleEffects,
  DigitalPaymentEffects,
  EmailEffects,
];
