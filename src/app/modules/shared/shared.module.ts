import { NgModule } from '@angular/core';
import {
  CommonModule,
  DatePipe,
  CurrencyPipe,
  DecimalPipe,
} from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { QuillModule } from 'ngx-quill';
import { AgGridModule } from 'ag-grid-angular';
import { NgSelectModule } from '@ng-select/ng-select';

import {
  NgbModule,
  NgbDateParserFormatter,
  NgbDateAdapter,
  NgbDateNativeAdapter,
} from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from '@app/services';
import { DatepickerChangeDirective } from '@app/directives/datepicker-change.directive';
import { ConnectFormDirective } from '@app/directives/connect-form.directive';
import { AutofocusDirective } from '@app/directives/auto-focus.directive';
import { ResizerDirective } from '@app/directives/resizer.directive';

import { PermissionDirective } from '@app/directives/permission.directive';
import { EllipsisTooltipDirective } from '@app/directives/ellipsis-tooltip.directive';
import { PreventDoubleClickDirective } from '@app/directives/prevent-double-click.directive';
import { AutoScrollSideMenuItemDirective } from '@app/directives/auto-scroll.directive';
import { StickyHeaderDirective } from '@app/directives/grid-sticky-elements/sticky-header.directive';
import { StickyHorizontalScrollDirective } from '@app/directives/grid-sticky-elements/sticky-horizontal-scroll.directive';
import { GridAutoHeightDirective } from '@app/directives/grid-auto-height.directive';
import { ReadOnlyFormDirective } from '@app/directives/readonly-form.directive';
import { LeftBorderDirective } from '@app/directives/left-border.directive';
import { HeightByCountOfChildsDirective } from '@app/directives/height-by-count-of-childs.directive';
import { CharacterCountDirective } from '@app/directives/character-counter.directive';
import { ElementLookupAssistantDirective } from '@app/directives/element-lookup-assistant.directive';
import { AsyncButtonDirective } from '../../directives/async-button.directive';
import { SpinnerComponent } from './spinner/spinner.component';
import { LoadingIndicatorComponent } from './loading-indicator/loading-indicator.component';
import { HouseholdListComponent } from './household-list/household-list.component';
import { TaskListComponent } from './task-list/task-list.component';
import { FormListComponent } from './form-list/form-list.component';
import { ProjectListComponent } from './project-list/project-list.component';
import { ClientListComponent } from './client-list/client-list.component';

import { sharedReducer } from './state/shared.reducer';
import { sharedEffects } from './state/shared.effects';
import { ControlMessagesComponent } from './control-messages/control-messages.component';
import { DocumentsListComponent } from './documents-list/documents-list.component';
import { DocumentsListActionsCellRendererComponent } from './documents-list/documents-list-actions-renderer/documents-list-actions-renderer.component';

import { DragAndDropComponent } from './drag-and-drop/drag-and-drop.component';
import { DragAndDropMultipleComponent } from './drag-and-drop-multiple/drag-and-drop-multiple.component';
import { DragAndDropModernComponent } from './drag-and-drop-modern/drag-and-drop-modern.component';

import * as directives from './directives';

import { FEATURE_NAME } from './state/shared.state';

// Renderers

import {
  TextboxEditorRendererComponent,
  DropdownEditorRendererComponent,
  AddressTagRendererComponent,
  LinkActionsRendererComponent,
  ValueWithTooltipRendererComponent,
  ModalEditorRendererComponent,
  LineLimitedRendererComponent,
  ListRendererComponent,
  TextTagRendererComponent,
  RangeEditorRendererComponent,
  DateRendererComponent,
  MultiselectDropdownEditorRendererComponent,
  LienStageRendererComponent,
  TextWithIconRendererComponent,
  NegativeAmountRendererComponent,
  CustomLoadingCellRenderer,
  StripHtmlRendererComponent,
  LinkActionRendererComponent,
  PrimaryTagRendererComponent,
  CheckboxEditorRendererComponent,
  HtmlTooltipRendererComponent,
} from './_renderers';

// dialogs
import { TaskModalComponent } from './task-modal/task-modal.component';
import { UploadDocumentModalComponent } from './upload-document-modal/upload-document-modal.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { DateRangeComponent } from './date-range/date-range.component';
import { DoubleRangeSliderComponent } from './date-range-slider/date-range-slider.component';
import { ContextBarComponent } from './context-bar/context-bar.component';
import { ActionBarComponent } from './action-bar/action-bar.component';
import { EmailsListComponent } from './emails-list/emails-list.component';
import { PhonesListComponent } from './phones-list/phones-list.component';
import { TabItemComponent } from './tab-item/tab-item.component';
import { TabGroupComponent } from './tab-group/tab-group.component';
import { NgbDateCustomParserFormatter } from './_parsers/ngb-datepicker-parser';
import * as pipes from './_pipes';
import { NotesListComponent } from './notes-list/notes-list.component';
import { GridCheckmarkRendererComponent } from './grid-checkmark-renderer/grid-checkmark-renderer.component';
import { PersonGeneralInfoComponent } from './person-general-info/person-general-info.component';
import { PersonTemplateComponent } from './person-template/person-template.component';
import { SettlementTemplateComponent } from './settlement-template/settlement-template.component';
import { SystemFieldsSectionComponent } from './system-fields-section/system-fields-section.component';
import { AttachmentCellRendererComponent } from '../call-center/communication-list/renderers/attachment-cell-renderer/attachment-cell-renderer.component';
import { TextControlComponent } from './text-control/text-control.component';
import { TabPlaceholderComponent } from './tab-placeholder/tab-placeholder.component';
import { TabPlaceholderNoRecordComponent } from './tab-placeholder/tab-placeholder-no-record/tab-placeholder-no-record.component';
import { TabPlaceholderUnderConstructionComponent } from './tab-placeholder/tab-placeholder-under-construction/tab-placeholder-under-construction.component';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { GridPagerComponent } from './grid-pager/grid-pager.component';
import { GridStatusBar } from './grid-status-bar/grid-status-bar.component';
import { GridComponent } from './grid/grid.component';
import { GridDateSelectorComponent } from './grid/grid-date-selector/grid-date-selector.component';
import { CreateOrganizationAccessModalComponent } from './create-organization-access-modal/create-organization-access-modal.component';
import { DateSelectorComponent } from './date-selector/date-selector.component';
import { DateSelectorTemplateDrivenComponent } from './grid/date-selector-template-driven/date-selector-template-driven.component';

import { CustomTextColumnFilterComponent } from './grid/custom-text-column-filter/custom-text-column-filter.component';
import { CustomSetColumnFilterComponent } from './grid/custom-set-column-filter/custom-set-column-filter.component';
import { DropdownColumnFilterComponent } from './grid/dropdown-column-filter/dropdown-column-filter.component';
import { CardComponent } from './card/card.component';
import { CardColComponent } from './card/card-col/card-col.component';
import { CardRowComponent } from './card/card-row/card-row.component';
import { ModalComponent } from './modal/modal.component';
import { ModalHeaderComponent } from './modal/modal-header/modal-header.component';
import { ModalFooterComponent } from './modal/modal-footer/modal-footer.component';
import { ModalBodyComponent } from './modal/modal-body/modal-body.component';
import { DialogComponent } from './dialog/dialog.component';
import { DialogHeaderComponent } from './dialog/dialog-header/dialog-header.component';
import { DialogBodyComponent } from './dialog/dialog-body/dialog-body.component';
import { DialogFooterComponent } from './dialog/dialog-footer/dialog-footer.component';
import { JiraListComponent } from '@shared/jira-list/jira-list.component';
import { JiraListCardComponent } from '@shared/jira-list-card/jira-list-card.component';
import { JiraListPreviewComponent } from '@shared/jira-list-preview/jira-list-preview.component';
import { JiraListCardPreviewComponent } from '@shared/jira-list-card-preview/jira-list-card-preview.component';
import { JiraMessagePreviewComponent } from '@shared/jira-message-preview/jira-message-preview.component';
import { TicketStatusComponent } from '@shared/ticket-status/ticket-status.component';
import { NewSelectComponent } from '@shared/new-select/new-select.component';

import { AdvancedSearchComponent } from './advanced-search/advanced-search.component';
import { AdvancedSearchFieldTextComponent } from './advanced-search/fields/text/text.component';
import { AdvancedSearchFieldTextPrimaryOptionComponent } from './advanced-search/fields/text-primary-option/text-primary-option.component';
import { AdvancedSearchFieldNumberComponent } from './advanced-search/fields/number/number.component';
import { AdvancedSearchFieldDateComponent } from './advanced-search/fields/date/date.component';
import { AdvancedSearchFieldDataComponent } from './advanced-search/fields/data/data.component';
import { AdvancedSearchFieldAgeComponent } from './advanced-search/fields/age/age.component';
import { AdvancedSearchFieldBooleanComponent } from './advanced-search/fields/boolean/boolean.component';
import { AdvancedSearchFilterComponent } from './advanced-search/advanced-search-filter/advanced-search-filter.component';
import { AdvancedSearchFieldsGroupComponent } from './advanced-search/fields/fields-group/fields-group.component';
import { AdvancedSearchFieldIdentifierComponent } from './advanced-search/fields/identifier/identifier.component';

import { PasswordChangeComponent } from './password-change.components.ts/password-change.component';
import { MultiSelectListComponent } from './multiselect-list/multiselect-list.component';
import { MultiSelectListWithChipsComponent } from './multiselect-list-with-chips/multiselect-list-with-chips.component';
import { UserListComponent } from './user-list/user-list.component';
import { BankAccountsListComponent } from './bank-accounts-list/bank-accounts-list.component';
import { RolesListComponent } from './roles-list/roles-list.component';
import { UserAccessPoliciesIndexComponent } from './user-access-policies-index/user-access-policies-index.component';
import { SelectComponent } from './select/select.component';
import { PasswordControlComponent } from './password-control/password-control.component';
import { SearchValidationMessagesComponent } from './advanced-search/search-validation-messages/search-validation-messages.component';
import { UserRolesListComponent } from './user-roles-list/user-roles-list.component';
import { MfaCodeModalComponent } from './mfa-code-modal/mfa-code-modal.component';
import { GroupedGridComponent } from './grouped-grid/grouped-grid.component';
import { OrgSwitchDialogComponent } from './org-switch-dialog/org-switch-dialog.component';
import { OrgImpersonateDialogComponent } from './org-impersonate-dialog/org-impersonate-dialog.component';
import { NoteComponent } from './notes-list/note/note.component';
import { NoAccessComponent } from './no-access/no-access.component';
import { ActionsLogListComponent } from './actions-log-list/actions-log-list.component';
import { SimplePagerComponent } from './simple-pager/simple-pager.component';
import { AlertDialogComponent } from './alert-dialog/alert-dialog.component';
import { NoRowsOverlay } from './grid/no-rows-overlay/no-rows-overlay.component';
import { SaveSearchModalComponent } from './advanced-search/save-search-modal/save-search-modal.component';
import { NoRecordsComponent } from './no-records/no-records.component';
import { ActionBarButtonComponent } from './action-bar/action-bar-button/action-bar-button.component';
import { RecordsPerPageComponent } from './records-per-page/records-per-page.component';
import { InfoBlocksComponent } from './info-blocks/info-blocks.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { KeyValueListComponent } from './key-value-list/key-value-list.component';
import { DashboardDataComponent } from './dashboard-data/dashboard-data.component';
import { RecentFinalizationsWidgetComponent } from './recent-finalizations-widget/recent-finalizations-widget.component';
import { DeficienciesWidgetComponent } from './deficiencies-widget/deficiencies-widget.component';
import { DataToggleComponent } from './data-toggle/data-toggle.component';
import { ProductWorkflowGroupComponent } from './advanced-search/product-workflow-group/product-workflow-group.component';
import { HidableFormControlComponent } from './hidable-form-control/hidable-form-control.component';
import { ClientWorkflowGroupComponent } from './advanced-search/client-workflow-group/client-workflow-group.component';

import { UploadBulkDocumentModalComponent } from './upload-bulk-document-modal/upload-bulk-document-modal.component';
import { UploadBulkDocumentImportFileComponent } from './upload-bulk-document-modal/upload-bulk-document-import-file/upload-bulk-document-import-file.component';
import { UploadBulkDocumentSelectComponent } from './upload-bulk-document-modal/upload-bulk-document-select/upload-bulk-document-select.component';
import { UploadBulkDocumentConfigureComponent } from './upload-bulk-document-modal/upload-bulk-document-configure/upload-bulk-document-configure.component';
import { UploadBulkDocumentProcessingComponent } from './upload-bulk-document-modal/upload-bulk-document-processing/upload-bulk-document-processing.component';
import { UploadBulkDocumentGridsComponent } from './upload-bulk-document-modal/upload-bulk-document-grids/upload-bulk-document-grids.component';

import { DocumentGenerationModalComponent } from './document-generation-modal/document-generation-modal.component';
import { DocumentGenerationSelectComponent } from './document-generation-modal/document-generation-select/document-generation-select.component';
import { DocumentGenerationLoadingResultsComponent } from './document-generation-modal/document-generation-loading-results/document-generation-loading-results.component';
import { DocumentTypeCellRendererComponent } from './documents-list/document-type-cell-renderer/document-type-cell-renderer.component';
import { RenameSearchModalComponent } from './advanced-search/rename-search-modal/rename-search-modal.component';
import { UserRolesListActionsRendererComponent } from './user-roles-list/user-roles-list-actions-renderer/user-roles-list-actions-renderer.component';
import { StepComponent } from './stepper/step/step.component';
import { StepperComponent } from './stepper/stepper.component';
import {
  FileImportErrorsListComponent,
  FileImportWarningsListComponent,
  FileImportAllRecordsListComponent,
  FileImportQueuedListComponent,
  FileImportInsertsListComponent,
  FileImportUpdatesListComponent,
  FileImportNoUpdatesListComponent,
  FileImportDeletedListComponent,
} from './upload-bulk-document-modal/grids';
import { SpecialDesignationsBarComponent } from './special-designations/special-designations-bar.component';
import { SpecialDesignationsSectionComponent } from './special-designations/special-designations-section/special-designations-section.component';
import { UploadBulkDocumentGroupGridComponent } from './upload-bulk-document-modal/upload-bulk-document-group-grid/upload-bulk-document-group-grid.component';
import { TooltipInfoComponent } from './tooltip-info/tooltip-info.component';
import { GridExpansionPanelHeaderComponent } from './grid-expansion-panel/grid-expansion-panel-header/grid-expansion-panel-header.component';
import { GridExpansionPanelRowComponent } from './grid-expansion-panel/grid-expansion-panel-row/grid-expansion-panel-row.component';
import { GridExpansionPanelRowChildComponent } from './grid-expansion-panel/grid-expansion-panel-row-child/grid-expansion-panel-row-child.component';
import { NotesComponent } from './notes/notes.component';

import { GridHeaderCheckboxComponent } from './grid/grid-header-checkbox/grid-header-checkbox.component';
import { EntitySelectionModalComponent } from './entity-selection-modal/entity-selection-modal.component';
import { ClearableInputComponent } from './clearable-input/clearable-input.component';
import { CustomerSelectionModalComponent } from './entity-selection-modal/customer-selection-modal.component';
import { OrganizationSelectionModalComponent } from './entity-selection-modal/organization-selection-modal.component';
import { AttorneySelectionModalComponent } from './entity-selection-modal/attorney-selection-modal.component';
import { SettlementSelectionModalComponent } from './entity-selection-modal/settlement-selection-modal.component';
import { MatterSelectionModalComponent } from './entity-selection-modal/matter-selection-modal.component';
import { DocumentTemplatesGridComponent } from './document-templates-grid/document-templates-grid.component';
import { DocumentTemplateEditModalComponent } from './document-templates-grid/document-template-edit-modal/document-template-edit-modal.component';
import { DocumentTemplatesGridActionsRendererComponent } from './document-templates-grid/document-templates-grid-actions-renderer/document-templates-grid-actions-renderer.component';
import { GridHeaderValidationStatusComponent } from './grid/grid-header-validation-status/grid-header-validation-status.component';

import { ChipListComponent } from './chip-list/chip-list.component';
import { ToggleButtonsComponent } from './toggle-buttons/toggle-buttons.component';
import { RecordsListComponent } from './records-list/records-list.component';
import { YesNoToggleComponent } from './yes-no-toggle/yes-no-toggle.component';
import { RangeInputComponent } from './range-input/range-input.component';
import { PriceTypeToggleComponent } from './price-type-toggle/price-type-toggle.component';
import { PriceInputComponent } from './price-input/price-input.component';
import { ILIGenerationTypeToggleComponent } from './ili-generation-type-toggle/ili-generation-type-toggle.component';
import { GridDateRangeSelectorComponent } from './grid/grid-date-range-selector/grid-date-range-selector.component';
import { ProjectContactSelectionModalComponent } from './entity-selection-modal/project-contact-selection-modal.component';
import { ClientContactSelectionModalComponent } from './entity-selection-modal/client-contact-selection-modal.component';

import { QsfOrgSelectionModalComponent } from './entity-selection-modal/qsf-org-selection-modal.component';
import { TagValueListComponent } from './tag-value-list/tag-value-list.component';
import { RelatedServicesModalComponent } from './entity-selection-modal/related-services-modal.component';
import { TextInputButtonComponent } from './text-input-button/text-input-button.component';
import { HoldClientGroupComponent } from './advanced-search/hold-client-group/hold-client-group.component';
import { StopPaymentRequestListWarningRendererComponent } from '../disbursements/stop-payment-request-list/stop-payment-request-list-warning-renderer/stop-payment-request-list-warning-renderer.component';
import { PaymentPreferencesListComponent } from './payment-preferences-list/payment-preferences-list.component';
import { PaymentPreferencesListActionsRendererComponent } from './payment-preferences-list/payment-preferences-list-actions-renderer/payment-preferences-list-actions-renderer.component';
import { DocumentInputComponent } from './document-input/document-input.component';
import { IdValueOptionSelectionModal } from './entity-selection-modal/idvalue-options-selection-modal.component';
import { MultiselectDropdownColumnFilterComponent } from './grid/multiselect-dropdown-column-filter/multiselect-dropdown-column-filter.component';
import { ProjectSelectionModalComponent } from './entity-selection-modal/project-selection-modal.component';
import { DeficienciesButtonsRendererComponent } from './deficiencies-list-base/deficiencies-buttons-renderer/deficiencies-buttons-renderer.component';

import { ViewNoteModalComponent } from './view-note-modal/view-note-modal.component';
import { ChangeHistoryListComponent } from './change-history-list/change-history-list.component';
import { StageHistoryModalComponent } from './stage-history-modal/stage-history-modal.component';
import { UserSelectionModalComponent } from './entity-selection-modal/user-selection-modal.component';
import { EditableFormControlComponent } from './editable-form-control/editable-form-control.component';
import { StopPaymentRequstListAttachmentsLinkRendererComponent } from '../disbursements/stop-payment-request-list/stop-payment-request-attachments-link-renderer/stop-payment-request-attachments-link-renderer.component';

import { RatingIconComponent } from './rating-icon/rating-icon.component';
import { EntityTypeRendererComponent } from './documents-list/entity-type-renderer/entity-type-renderer.component';
import { FileImportConfirmationDialog } from './upload-bulk-document-modal/file-import-confirmation-dialog/file-import-confirmation-dialog.component';
import { RelatedServicesListComponent } from './related-services-list/related-services-list.component';
import { RelatedServicesActionsRendererComponent } from './related-services-list/related-services-actions-renderer/related-services-actions-renderer.component';
import { BillingTriggersListComponent } from './billing-triggers-list/billing-triggers-list.component';

import { PercentageOfSavingsPricingFormComponent } from './pricings-components/percentage-of-savings-form/percentage-of-savings-pricing-form.component';
import { TieredPricingFormComponent } from './pricings-components/tiered-pricing-form/tiered-pricing-form.component';
import { VariablePricingFormComponent } from './variable-pricing-form/variable-pricing-form.component';
import { SlidingScalePricingFormComponent } from './pricings-components/sliding-scale-form/sliding-scale-pricing-form.component';
import { OutcomeBasedPricingDetailsComponent } from './pricings-components/pricing-details/pricing-details.component';
import { AdvancedSearchFieldDataWithCheckboxComponent } from './advanced-search/fields/data-with-checkbox/data-with-checkbox.component';
import { OutcomeBasedPricingListComponent } from './outcome-based-pricing-list/outcome-based-pricing-list.component';
import { ObpDetailsModal } from './outcome-based-pricing-list/details-modal/obp-details-modal.component';
import { EditOutcomeBasedPricingModal } from './outcome-based-pricing-list/edit-outcome-based-pricing-modal/edit-outcome-based-pricing-modal.component';
import { BrtOutcomeBasedPricingCellRendererComponent } from './outcome-based-pricing-list/renderers/outcome-based-pricing-cell-renderer/outcome-based-pricing-cell-renderer.component';
import { PricingTypesListComponent } from './pricing-types-list/pricing-types-list.component';
import { PricingTypesActionsRendererComponent } from './pricing-types-list/pricing-types-actions-renderer/pricing-types-actions-renderer.component';
import { BrtServicesCellRendererComponent } from './outcome-based-pricing-list/renderers/services-cell-renderer/services-cell-renderer.component';
import { AddNewSubtaskModalComponent } from './add-new-subtask-modal/add-new-subtask-modal.component';
import { TaskDetailsTemplateComponent } from './tasks/task-details-template/task-details-template.component';
import { SubTasksListComponent } from './tasks/sub-tasks-list/sub-tasks-list.component';
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';
import { SelectedOrgsListComponent } from './selected-orgs-list/selected-orgs-list.component';
import { SelectedOrgListCellRendererComponent } from './selected-orgs-list/renderers/actions-renderer/actions-renderer.component';
import { BlurBackgroundComponent } from './blur-background/blur-background.component';
import { ClaimantsWithLedgersListComponent } from '../projects/claimants-with-ledgers-list/claimants-with-ledgers-list.component';
import { ConfirmationWithNoteDialogComponent } from './confirmation-with-note-dialog/confirmation-with-note-dialog.component';
import { UploadDocumentAdvanceShareComponent } from './upload-document-advance-share/upload-document-advance-share.component';
import { DraftOrPublishToggleComponent } from './draft-or-publish-toggle/draft-or-publish-toggle.component';
import { ActiveProjectSelectionModalComponent } from './entity-selection-modal/active-project-selection-modal.component';
import { EntityTypeCleanedPipe } from './documents-list/entity-type-renderer/entity-type-cleaned.pipe';
import { PinCodeComponent } from './pin-code/pin-code.component';
import { DesignatedNotesComponent } from './designated-notes/designated-notes.component';
import { ClaimantDesignationsBarComponent } from './claimant-designations/claimant-designations-bar.component';
import { ClaimantSelectionModalComponent } from './entity-selection-modal/claimant-selection-modal.component';
import { WarningFormControlComponent } from './warning-form-control/warning-form-control.component';
import { DocuSignSenderTestComponent } from './docusign-sender-test/docusign-sender-test.component';
import { CheckboxToggleComponent } from './checkbox-toggle/checkbox-toggle.component';
import { StatusTrackerBadgeComponent } from './status-tracker-badge/status-tracker-badge.component';
import { StepTrackerBadgeComponent } from './step-tracker-badge/step-tracker-badge.component';
import { TabGroupIconComponent } from './tab-group-icon/tab-group-icon.component';
import { JiraDateRangeComponent } from './jira-date-range/jira-date-range.component';
import { JiraRenderedTextComponent } from './jira-rendered-text/jira-rendered-text.component';
import { JiraMessageReplyComponent } from './jira-message-reply/jira-message-reply.component';
import { PowerBIComponent } from './power-bi/power-bi.component';
import { PowerBIEmbedModule } from 'powerbi-client-angular';
import { FilesSelectorComponent } from './files-selector/files-selector.component';
import { InfoCardComponent } from './info-card/info-card.component';
import { BadgePillComponent } from './badge-pill/badge-pill.component';
import { FilesSelectorComponentV2 } from './files-selector-v2/files-selector-v2.component';
import { InfoDialogComponent } from './info-dialog/info-dialog.component';
import { CustomInnerHeaderComponent } from './custome-header-icon/custom-inner-header.component';
import { ProjectServiceStatusTrackerComponent } from './project-service-status-tracker/project-service-status-tracker.component';
import { DonutTrackerIconComponent } from './donut-tracker-icon/donut-tracker-icon.component';
import { JiraFileUploaderComponent } from './jira-file-uploader/jira-file-uploader.component';

@NgModule({
  declarations: [
    LoadingIndicatorComponent,
    SpinnerComponent,
    BlurBackgroundComponent,
    DraftOrPublishToggleComponent,
    CheckboxToggleComponent,
    AutofocusDirective,
    AutoScrollSideMenuItemDirective,
    CharacterCountDirective,
    EllipsisTooltipDirective,
    HeightByCountOfChildsDirective,
    ConnectFormDirective,
    DatepickerChangeDirective,
    ResizerDirective,
    PermissionDirective,
    PreventDoubleClickDirective,
    StickyHeaderDirective,
    StickyHorizontalScrollDirective,
    AsyncButtonDirective,
    LeftBorderDirective,
    ReadOnlyFormDirective,
    GridAutoHeightDirective,
    ElementLookupAssistantDirective,
    DocumentInputComponent,
    pipes.FileSizePipe,
    pipes.DateFormatPipe,
    pipes.EnumToArrayPipe,
    pipes.ReadableCasePipe,
    pipes.PhoneNumberPipe,
    pipes.AddressPipe,
    pipes.MimeIconPipe,
    pipes.YesNoPipe,
    pipes.BooleanPipe,
    pipes.ActiveInactivePipe,
    pipes.FractionalABAPipe,
    pipes.FederalWireABAPipe,
    pipes.SecondsToMinutesPipe,
    pipes.FilterPipe,
    pipes.MapPipe,
    pipes.JoinPipe,
    pipes.IncludesPipe,
    pipes.PrependPipe,
    pipes.SsnPipe,
    pipes.PinPipe,
    pipes.EntityTypeReadablePipe,
    pipes.InjuryCategoryTitlePipe,
    pipes.LedgerEntryStatusReadablePipe,
    pipes.LienStatusPipe,
    pipes.LienStatusIconPipe,
    pipes.LienServiceIconPipe,
    pipes.JsonValueFormatPipe,
    pipes.SplitCamelCasePipe,
    pipes.ProductCategoryToStringPipe,
    pipes.ExtendedCurrencyPipe,
    pipes.ExtendedCurrencyLedgerPipe,
    pipes.TrackingLinkPipe,
    pipes.LowerCasePipe,
    pipes.AbsoluteNumberPipe,
    pipes.FormatLargeNumberPipe,
    EntityTypeCleanedPipe,
    DocumentsListComponent,
    DocumentTemplatesGridComponent,
    DocumentTemplatesGridActionsRendererComponent,
    HouseholdListComponent,
    TaskListComponent,
    TaskModalComponent,
    FormListComponent,
    ProjectListComponent,
    ClientListComponent,
    SaveSearchModalComponent,
    RenameSearchModalComponent,
    ControlMessagesComponent,
    UploadDocumentModalComponent,
    UploadDocumentAdvanceShareComponent,
    UploadBulkDocumentModalComponent,
    DocumentGenerationModalComponent,
    ConfirmationDialogComponent,
    ConfirmationWithNoteDialogComponent,
    FileImportConfirmationDialog,
    ConfirmationModalComponent,
    AlertDialogComponent,
    DocumentsListActionsCellRendererComponent,
    EntityTypeRendererComponent,
    DragAndDropComponent,
    DragAndDropMultipleComponent,
    DragAndDropModernComponent,
    directives.DragAndDropDirective,
    directives.OverlayDirective,
    directives.OnlyNumbersDirective,
    directives.CommaSeparatedNumbersDirective,
    directives.CommaSeparatedStringIdentifiresDirective,
    directives.OnlyNumbersExDirective,
    directives.OnlyLettersDirective,
    directives.CheckboxInSyncDirective,
    ContextBarComponent,
    BreadcrumbComponent,
    DateRangeComponent,
    DoubleRangeSliderComponent,
    PasswordChangeComponent,
    ActionBarComponent,
    ActionBarButtonComponent,
    EmailsListComponent,
    PhonesListComponent,
    TabItemComponent,
    TabGroupComponent,
    NotesListComponent,
    GridCheckmarkRendererComponent,
    PersonGeneralInfoComponent,
    PersonTemplateComponent,
    SettlementTemplateComponent,
    LinkActionRendererComponent,
    LinkActionsRendererComponent,
    CustomLoadingCellRenderer,
    StripHtmlRendererComponent,
    TabPlaceholderComponent,
    TabPlaceholderNoRecordComponent,
    TabPlaceholderUnderConstructionComponent,
    TermsAndConditionsComponent,
    PrivacyComponent,
    PrimaryTagRendererComponent,
    CheckboxEditorRendererComponent,
    SystemFieldsSectionComponent,
    AttachmentCellRendererComponent,
    TextControlComponent,
    HtmlTooltipRendererComponent,
    CreateOrganizationAccessModalComponent,
    GridPagerComponent,
    SimplePagerComponent,
    GridStatusBar,
    GridComponent,
    GridDateSelectorComponent,
    NoRowsOverlay,
    DateSelectorComponent,
    PasswordControlComponent,
    DateSelectorTemplateDrivenComponent,
    CustomTextColumnFilterComponent,
    CustomSetColumnFilterComponent,
    DropdownColumnFilterComponent,
    MultiselectDropdownColumnFilterComponent,
    UserListComponent,
    BankAccountsListComponent,
    RolesListComponent,
    UserAccessPoliciesIndexComponent,
    BadgePillComponent,
    AdvancedSearchComponent,
    AdvancedSearchFilterComponent,
    AdvancedSearchFieldTextComponent,
    AdvancedSearchFieldIdentifierComponent,
    AdvancedSearchFieldBooleanComponent,
    AdvancedSearchFieldTextPrimaryOptionComponent,
    AdvancedSearchFieldNumberComponent,
    AdvancedSearchFieldDateComponent,
    AdvancedSearchFieldDataComponent,
    AdvancedSearchFieldDataWithCheckboxComponent,
    AdvancedSearchFieldAgeComponent,
    AdvancedSearchFieldsGroupComponent,
    CardComponent,
    CardColComponent,
    CardRowComponent,
    JiraListComponent,
    JiraListCardComponent,
    JiraListPreviewComponent,
    JiraListCardPreviewComponent,
    JiraMessagePreviewComponent,
    JiraRenderedTextComponent,
    JiraMessageReplyComponent,
    JiraFileUploaderComponent,
    NewSelectComponent,
    TicketStatusComponent,
    ModalComponent,
    ModalHeaderComponent,
    ModalFooterComponent,
    ModalBodyComponent,
    DialogComponent,
    DialogHeaderComponent,
    DialogBodyComponent,
    DialogFooterComponent,
    MultiSelectListComponent,
    MultiSelectListWithChipsComponent,
    SelectComponent,
    ActionsLogListComponent,
    SearchValidationMessagesComponent,
    UserRolesListComponent,
    MfaCodeModalComponent,
    GroupedGridComponent,
    OrgSwitchDialogComponent,
    OrgImpersonateDialogComponent,
    NoteComponent,
    NoAccessComponent,
    NoRecordsComponent,
    DropdownColumnFilterComponent,
    MultiselectDropdownColumnFilterComponent,
    UploadBulkDocumentModalComponent,
    UploadBulkDocumentImportFileComponent,
    UploadBulkDocumentSelectComponent,
    UploadBulkDocumentConfigureComponent,
    UploadBulkDocumentProcessingComponent,
    UploadBulkDocumentGridsComponent,
    UploadBulkDocumentGroupGridComponent,
    FileImportAllRecordsListComponent,
    FileImportErrorsListComponent,
    FileImportWarningsListComponent,
    FileImportQueuedListComponent,
    FileImportInsertsListComponent,
    FileImportUpdatesListComponent,
    FileImportNoUpdatesListComponent,
    FileImportDeletedListComponent,
    DocumentGenerationModalComponent,
    DocumentGenerationSelectComponent,
    DocumentGenerationLoadingResultsComponent,
    RecordsPerPageComponent,
    InfoBlocksComponent,
    KeyValueListComponent,
    TagValueListComponent,
    NotFoundComponent,
    DashboardDataComponent,
    RecentFinalizationsWidgetComponent,
    DeficienciesWidgetComponent,
    DataToggleComponent,
    InfoBlocksComponent,
    ProductWorkflowGroupComponent,
    HoldClientGroupComponent,
    HidableFormControlComponent,
    EditableFormControlComponent,
    ClientWorkflowGroupComponent,
    DocumentTypeCellRendererComponent,
    UserRolesListActionsRendererComponent,
    GridExpansionPanelRowComponent,
    GridExpansionPanelHeaderComponent,
    GridExpansionPanelRowChildComponent,
    StepperComponent,
    StepComponent,
    SpecialDesignationsBarComponent,
    SpecialDesignationsSectionComponent,
    TooltipInfoComponent,
    GridExpansionPanelRowChildComponent,
    NotesComponent,
    CheckboxEditorRendererComponent,
    TextboxEditorRendererComponent,
    DateRendererComponent,
    MultiselectDropdownEditorRendererComponent,
    DropdownEditorRendererComponent,
    ModalEditorRendererComponent,
    GridHeaderCheckboxComponent,
    AddressTagRendererComponent,
    TextTagRendererComponent,
    EntitySelectionModalComponent,
    ClearableInputComponent,
    CustomerSelectionModalComponent,
    OrganizationSelectionModalComponent,
    AttorneySelectionModalComponent,
    SettlementSelectionModalComponent,
    MatterSelectionModalComponent,
    ProjectSelectionModalComponent,
    ClaimantSelectionModalComponent,
    ActiveProjectSelectionModalComponent,
    ProjectContactSelectionModalComponent,
    ClientContactSelectionModalComponent,
    DocumentTemplateEditModalComponent,
    DocuSignSenderTestComponent,
    GridHeaderValidationStatusComponent,
    ChipListComponent,
    ToggleButtonsComponent,
    RecordsListComponent,
    YesNoToggleComponent,
    RangeInputComponent,
    PriceTypeToggleComponent,
    PriceInputComponent,
    ILIGenerationTypeToggleComponent,
    GridDateRangeSelectorComponent,
    QsfOrgSelectionModalComponent,
    RelatedServicesModalComponent,
    ValueWithTooltipRendererComponent,
    TextWithIconRendererComponent,
    LineLimitedRendererComponent,
    ListRendererComponent,
    TextInputButtonComponent,
    StopPaymentRequestListWarningRendererComponent,
    StopPaymentRequstListAttachmentsLinkRendererComponent,
    PaymentPreferencesListComponent,
    PaymentPreferencesListActionsRendererComponent,
    IdValueOptionSelectionModal,
    DeficienciesButtonsRendererComponent,
    ViewNoteModalComponent,
    ChangeHistoryListComponent,
    StageHistoryModalComponent,
    UserSelectionModalComponent,
    RatingIconComponent,
    RelatedServicesListComponent,
    RelatedServicesActionsRendererComponent,
    BillingTriggersListComponent,
    VariablePricingFormComponent,
    PercentageOfSavingsPricingFormComponent,
    RangeEditorRendererComponent,
    SlidingScalePricingFormComponent,
    TieredPricingFormComponent,
    OutcomeBasedPricingDetailsComponent,
    OutcomeBasedPricingListComponent,
    ObpDetailsModal,
    EditOutcomeBasedPricingModal,
    BrtOutcomeBasedPricingCellRendererComponent,
    PricingTypesListComponent,
    PricingTypesActionsRendererComponent,
    BrtServicesCellRendererComponent,
    AddNewSubtaskModalComponent,
    TaskDetailsTemplateComponent,
    SubTasksListComponent,
    LienStageRendererComponent,
    NegativeAmountRendererComponent,
    SelectedOrgsListComponent,
    SelectedOrgListCellRendererComponent,
    ClaimantsWithLedgersListComponent,
    PinCodeComponent,
    DesignatedNotesComponent,
    ClaimantDesignationsBarComponent,
    WarningFormControlComponent,
    StatusTrackerBadgeComponent,
    StepTrackerBadgeComponent,
    TabGroupIconComponent,
    JiraDateRangeComponent,
    PowerBIComponent,
    FilesSelectorComponent,
    InfoCardComponent,
    FilesSelectorComponentV2,
    InfoDialogComponent,
    CustomInnerHeaderComponent,
    DonutTrackerIconComponent,
    ProjectServiceStatusTrackerComponent
  ],
  exports: [
    // TODO directives need to be moved to one place
    AutofocusDirective,
    AutoScrollSideMenuItemDirective,
    CharacterCountDirective,
    EllipsisTooltipDirective,
    HeightByCountOfChildsDirective,
    ConnectFormDirective,
    DatepickerChangeDirective,
    ResizerDirective,
    PermissionDirective,
    PreventDoubleClickDirective,
    StickyHorizontalScrollDirective,
    StickyHeaderDirective,
    AsyncButtonDirective,
    LeftBorderDirective,
    ReadOnlyFormDirective,
    GridAutoHeightDirective,
    ElementLookupAssistantDirective,
    directives.DragAndDropDirective,
    directives.OverlayDirective,
    directives.OnlyNumbersDirective,
    directives.OnlyNumbersExDirective,
    directives.OnlyLettersDirective,
    directives.CheckboxInSyncDirective,
    LoadingIndicatorComponent,
    SpinnerComponent,
    BlurBackgroundComponent,
    DocumentsListComponent,
    DocumentTemplatesGridComponent,
    DragAndDropComponent,
    DragAndDropMultipleComponent,
    DragAndDropModernComponent,
    HouseholdListComponent,
    TaskListComponent,
    FormListComponent,
    ProjectListComponent,
    ClientListComponent,
    ControlMessagesComponent,
    ContextBarComponent,
    BreadcrumbComponent,
    DateRangeComponent,
    DoubleRangeSliderComponent,
    PasswordChangeComponent,
    ActionBarComponent,
    ActionBarButtonComponent,
    TabItemComponent,
    TabGroupComponent,
    RouterModule,
    EmailsListComponent,
    PhonesListComponent,
    NotesListComponent,
    NgbModule,
    BadgePillComponent,
    GridExpansionPanelRowComponent,
    GridExpansionPanelHeaderComponent,
    GridExpansionPanelRowChildComponent,
    SpecialDesignationsBarComponent,
    SpecialDesignationsSectionComponent,
    TooltipInfoComponent,
    TextControlComponent,
    DocumentInputComponent,
    pipes.PhoneNumberPipe,
    pipes.AddressPipe,
    pipes.DateFormatPipe,
    pipes.MimeIconPipe,
    pipes.YesNoPipe,
    pipes.BooleanPipe,
    pipes.ActiveInactivePipe,
    pipes.FractionalABAPipe,
    pipes.FederalWireABAPipe,
    pipes.SecondsToMinutesPipe,
    pipes.FilterPipe,
    pipes.MapPipe,
    pipes.JoinPipe,
    pipes.IncludesPipe,
    pipes.PrependPipe,
    pipes.SsnPipe,
    pipes.PinPipe,
    pipes.EntityTypeReadablePipe,
    pipes.InjuryCategoryTitlePipe,
    pipes.LedgerEntryStatusReadablePipe,
    pipes.LienStatusPipe,
    pipes.LienStatusIconPipe,
    pipes.LienServiceIconPipe,
    pipes.JsonValueFormatPipe,
    pipes.SplitCamelCasePipe,
    pipes.ProductCategoryToStringPipe,
    pipes.ExtendedCurrencyPipe,
    pipes.ExtendedCurrencyLedgerPipe,
    pipes.TrackingLinkPipe,
    pipes.LowerCasePipe,
    pipes.AbsoluteNumberPipe,
    pipes.FormatLargeNumberPipe,
    PersonGeneralInfoComponent,
    PersonTemplateComponent,
    SettlementTemplateComponent,
    TabPlaceholderComponent,
    TabPlaceholderNoRecordComponent,
    TabPlaceholderUnderConstructionComponent,
    TermsAndConditionsComponent,
    PrivacyComponent,
    SystemFieldsSectionComponent,
    GridPagerComponent,
    SimplePagerComponent,
    GridStatusBar,
    GridComponent,
    GridDateSelectorComponent,
    GridDateRangeSelectorComponent,
    NoRowsOverlay,
    DateSelectorComponent,
    PasswordControlComponent,
    DateSelectorTemplateDrivenComponent,
    CustomTextColumnFilterComponent,
    CustomSetColumnFilterComponent,
    DropdownColumnFilterComponent,
    MultiselectDropdownColumnFilterComponent,
    AdvancedSearchComponent,
    AdvancedSearchFilterComponent,
    CardComponent,
    CardColComponent,
    CardRowComponent,
    JiraListComponent,
    JiraListCardComponent,
    JiraListPreviewComponent,
    JiraListCardPreviewComponent,
    JiraMessagePreviewComponent,
    JiraFileUploaderComponent,
    NewSelectComponent,
    TicketStatusComponent,
    ModalComponent,
    ModalHeaderComponent,
    ModalFooterComponent,
    ModalBodyComponent,
    DialogComponent,
    DialogHeaderComponent,
    DialogBodyComponent,
    DialogFooterComponent,
    MultiSelectListComponent,
    MultiSelectListWithChipsComponent,
    SelectComponent,
    UserListComponent,
    BankAccountsListComponent,
    RolesListComponent,
    UserAccessPoliciesIndexComponent,
    ActionsLogListComponent,
    UserRolesListComponent,
    GroupedGridComponent,
    OrgSwitchDialogComponent,
    InfoBlocksComponent,
    KeyValueListComponent,
    TagValueListComponent,
    DashboardDataComponent,
    RecentFinalizationsWidgetComponent,
    DeficienciesWidgetComponent,
    DataToggleComponent,
    HidableFormControlComponent,
    EditableFormControlComponent,
    UploadBulkDocumentProcessingComponent,
    VariablePricingFormComponent,
    PercentageOfSavingsPricingFormComponent,
    SlidingScalePricingFormComponent,
    TieredPricingFormComponent,
    OutcomeBasedPricingDetailsComponent,
    StepperComponent,
    StepComponent,
    NotesComponent,
    ClearableInputComponent,
    ChipListComponent,
    ToggleButtonsComponent,
    RecordsListComponent,
    YesNoToggleComponent,
    RangeInputComponent,
    PriceTypeToggleComponent,
    PriceInputComponent,
    ILIGenerationTypeToggleComponent,
    ValueWithTooltipRendererComponent,
    TextWithIconRendererComponent,
    LineLimitedRendererComponent,
    ListRendererComponent,
    TextInputButtonComponent,
    ChangeHistoryListComponent,
    RelatedServicesListComponent,
    BillingTriggersListComponent,
    OutcomeBasedPricingListComponent,
    PricingTypesListComponent,
    TaskDetailsTemplateComponent,
    SubTasksListComponent,
    LienStageRendererComponent,
    SelectedOrgsListComponent,
    SelectedOrgListCellRendererComponent,
    ClaimantsWithLedgersListComponent,
    DraftOrPublishToggleComponent,
    CheckboxToggleComponent,
    WarningFormControlComponent,
    StatusTrackerBadgeComponent,
    StepTrackerBadgeComponent,
    TabGroupIconComponent,
    JiraDateRangeComponent,
    PowerBIComponent,
    FilesSelectorComponent,
    InfoCardComponent,
    FilesSelectorComponentV2,
    InfoDialogComponent,
    CustomInnerHeaderComponent,
    DonutTrackerIconComponent,
    ProjectServiceStatusTrackerComponent,
    AdvancedSearchFieldAgeComponent
  ],
  imports: [
    CommonModule,
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    ModalModule,
    BsDropdownModule,
    AgGridModule,
    StoreModule.forFeature(FEATURE_NAME, sharedReducer),
    EffectsModule.forFeature([...sharedEffects]),
    BsDatepickerModule.forRoot(),
    NgxMaskDirective, NgxMaskPipe,
    RouterModule,
    NgbModule,
    QuillModule,
    NgSelectModule,
    PowerBIEmbedModule,
  ],
  providers: [
    DatePipe,
    CurrencyPipe,
    DecimalPipe,
    pipes.FileSizePipe,
    pipes.DateFormatPipe,
    pipes.PhoneNumberPipe,
    pipes.EnumToArrayPipe,
    pipes.ReadableCasePipe,
    pipes.AddressPipe,
    pipes.MimeIconPipe,
    pipes.YesNoPipe,
    pipes.BooleanPipe,
    pipes.ActiveInactivePipe,
    pipes.FractionalABAPipe,
    pipes.FederalWireABAPipe,
    pipes.SecondsToMinutesPipe,
    pipes.FilterPipe,
    pipes.MapPipe,
    pipes.JoinPipe,
    pipes.IncludesPipe,
    pipes.PrependPipe,
    pipes.SsnPipe,
    pipes.PinPipe,
    pipes.EntityTypeReadablePipe,
    pipes.InjuryCategoryTitlePipe,
    pipes.LedgerEntryStatusReadablePipe,
    pipes.LienStatusPipe,
    pipes.LienStatusIconPipe,
    pipes.LienServiceIconPipe,
    pipes.JsonValueFormatPipe,
    pipes.SplitCamelCasePipe,
    pipes.ProductCategoryToStringPipe,
    pipes.ExtendedCurrencyPipe,
    pipes.ExtendedCurrencyLedgerPipe,
    pipes.TrackingLinkPipe,
    pipes.LowerCasePipe,
    pipes.AbsoluteNumberPipe,
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
    { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter },
    { provide: NgxMaskPipe, useClass: NgxMaskPipe },
    ModalService,
    provideNgxMask(),
  ],
})
export class SharedModule {}
