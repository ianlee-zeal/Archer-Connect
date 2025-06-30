import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Pager } from '@shared/grid-pager/pager';
import { ActionHandlersMap } from './action-handlers-map';

interface ActionConfig {
  name: string;
  icon: string;
  label: string;
  isMain?: boolean;
  isLoading?: boolean;
  customColor?: string;
}

@Component({
  selector: 'app-action-bar',
  templateUrl: './action-bar.component.html',
  styleUrls: ['./action-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ActionBarComponent {
  public actions;

  public mainActions;

  public additionalActions;

  public loadingActions;

  @Output()
  public navigate: EventEmitter<number> = new EventEmitter();

  private actionBarElements: ActionConfig[] = [
    // The order of the rows reflects the order of the buttons in the UI
    { name: 'back', icon: 'assets/images/arrow-left.svg', label: 'Back', isMain: true },
    { name: 'cancel', icon: 'assets/images/action_cancel_blue.svg', label: 'Cancel', isMain: true },
    { name: 'save', icon: 'assets/images/action_ic_save.svg', label: 'Save', isMain: true },
    { name: 'cancelNote', icon: 'assets/images/action_cancel_blue.svg', label: 'Cancel Note', isMain: true },
    { name: 'saveNote', icon: 'assets/images/action_ic_save.svg', label: 'Save Note', isMain: true },
    { name: 'new', icon: 'assets/images/action_ic_new.svg', label: 'New', isMain: true },
    { name: 'add', icon: 'assets/images/action_ic_new.svg', label: 'Add', isMain: true },
    { name: 'edit', icon: 'assets/images/action_ic_edit.svg', label: 'Edit', isMain: true },

    { name: 'startRun', icon: 'assets/images/action_ic_new.svg', label: 'Start Run', isMain: true },

    { name: 'logCommunication', icon: 'assets/images/action_ic_new.svg', label: 'Log Communication', isMain: true },
    { name: 'logCall', icon: 'assets/images/action_add_call.svg', label: 'Log Call', isMain: true },
    { name: 'linkExisting', icon: 'assets/images/action_link.svg', label: 'Link Existing', isMain: true },
    { name: 'refresh', icon: 'assets/images/action_ic_refresh.png', label: 'Refresh', isMain: true },
    { name: 'delete', icon: 'assets/images/action_ic_delete.svg', label: 'Delete', isMain: true },
    { name: 'approve', icon: 'assets/images/checkmark-icon.png', label: 'Approve', isMain: true },
    { name: 'reject', icon: 'assets/images/action_cancel.png', label: 'Reject', isMain: true },
    { name: 'advancedSearch', icon: 'assets/images/Advances Search.svg', label: 'Advanced Search', isMain: true },
    { name: 'basicSearch', icon: 'assets/images/ic_basic_search.svg', label: 'Basic Search', isMain: true },
    { name: 'download', icon: 'assets/images/Export.svg', label: 'Export', isMain: true },
    { name: 'actions', icon: '', label: 'Actions', isMain: true },
    { name: 'clearFilter', icon: 'assets/images/Clear Filter.svg', label: 'Clear Filter', isMain: true },
    { name: 'unlockAccount', icon: 'assets/images/action_unlock.svg', label: 'Unlock Account', isMain: true },
    { name: 'resentRegistration', icon: 'assets/images/action_resent_email.svg', label: 'Resend Registration', isMain: true },
    { name: 'resetMFA', label: 'Reset MFA', icon: 'assets/images/Reset.svg', isMain: true },
    { name: 'print', icon: 'assets/images/action_ic_print.png', label: 'Print' },
    { name: 'send', icon: 'assets/images/action_ic_email.png', label: 'Send by Email' },
    { name: 'exportpdf', icon: 'assets/images/action_ic_pdf.png', label: 'Export to PDF' },
    { name: 'exportexcel', icon: 'assets/images/action_ic_excel.png', label: 'Export to Excel' },
    { name: 'exportword', icon: 'assets/images/action_ic_word.png', label: 'Export to Word' },
    { name: 'showLienDashboard', icon: '', label: 'Lien Dashboard', isMain: true },
    { name: 'collapseNotes', icon: 'assets/images/collapse-icon.svg', label: 'Collapse All Notes', isMain: true },
    { name: 'expandNotes', icon: 'assets/images/expand-icon.svg', label: 'Expand All Notes', isMain: true },
    { name: 'saveSearch', icon: 'assets/images/action_ic_save.svg', label: 'Save Search', isMain: true },
    { name: 'deleteSearch', icon: 'assets/images/action_ic_delete.svg', label: 'Delete Search', isMain: true },
    { name: 'commitChanges', icon: 'assets/images/Export.svg', label: 'Commit Changes', isMain: true },
    { name: 'pinPage', icon: 'assets/images/thumbtack-outlined.svg', label: 'Pin Page', isMain: true },
    { name: 'removePin', icon: 'assets/images/thumbtack-solid.svg', label: 'Remove Pin', isMain: true },
    { name: 'viewInLPM', icon: 'assets/images/thumb_external_link_blue.png', label: 'View in LPM', isMain: true },
    { name: 'voidClosingStatement', icon: 'assets/images/action_cancel_blue.svg', label: 'Void Closing Statement', isMain: true },
    { name: 'exporting', icon: 'assets/images/thumbtack-solid.svg', label: 'Exporting records', isMain: false, isLoading: true },
    { name: 'actionPerfomed', icon: 'assets/images/thumbtack-solid.svg', label: 'Action in progress', isMain: false, isLoading: true },
    { name: 'qsfSweepInProgress', icon: 'assets/images/thumbtack-solid.svg', label: 'QSF Sweep in progress...', isMain: false, isLoading: true },
    { name: 'deleteCommunication', icon: 'assets/images/action_ic_delete.svg', label: 'Delete Communication', isMain: true },
    { name: 'holdPayments', icon: 'assets/images/Default_blue.svg', label: 'Hold Payments', isMain: true },
    { name: 'updateHoldStatus', icon: 'assets/images/Default_blue.svg', label: 'Update Hold Status', isMain: true },

    { name: 'closingStatementGeneration', icon: '', label: 'Statement Generation', isMain: true },
    { name: 'generatingDocuments', icon: 'assets/images/thumbtack-solid.svg', label: 'Generating documents', isMain: false, isLoading: true },

    // Last in actions order
    { name: 'collapseAll', icon: 'assets/images/collapse-icon.svg', label: 'Collapse All', isMain: true },
    { name: 'expandAll', icon: 'assets/images/expand-icon.svg', label: 'Expand All', isMain: true },

    { name: 'stopPaymentRequest', icon: 'assets/images/action_ic_stop.svg', label: 'Stop Payment', isMain: true },
    { name: 'processing', icon: 'assets/images/thumbtack-solid.svg', label: 'Processing...', isMain: false, isLoading: true },
    { name: 'checkVerification', icon: 'assets/images/action_ic_new.svg', label: 'Check Verification', isMain: true },
    { name: 'paymentRequest', label: 'Payment Request', icon: 'assets/images/Reset.svg', isMain: true },
    { name: 'stageHistory', icon: 'assets/images/stage-history.svg', label: 'Stage History', isMain: true },
    { name: 'addToProbate', icon: 'assets/images/action_ic_new.svg', label: 'Add To Probate', isMain: true },
    { name: 'voidPayment', icon: 'assets/images/action_cancel_blue.svg', label: 'Void Payment', isMain: true },
    { name: 'newSubTask', icon: 'assets/images/action_ic_new.svg', label: 'New Sub-task', isMain: true },
    { name: 'feeCap', icon: 'assets/images/action_ic_new.svg', label: 'Fee Cap', isMain: true },
    { name: 'deleteLedger', icon: 'assets/images/action_ic_delete.svg', label: 'Delete Ledger', isMain: true },
    { name: 'transferRequest', icon: 'assets/images/transfer-request.png', label: 'Transfer Request', isMain: true },
    { name: 'finalStatusLetter', icon: 'assets/images/Export.svg', label: 'Final Status Letter', isMain: true },
  ];

  @Input()
  public pager: Pager;

  @Input()
  set actionHandlers(val: ActionHandlersMap) {
    this.resetActions();

    if (val) {
      const visibleActions = this.actionBarElements.filter((actionConfig: ActionConfig) => val[actionConfig.name]);

      this.mainActions = visibleActions.filter((action: ActionConfig) => action.isMain && !action.isLoading);
      this.additionalActions = visibleActions.filter((action: ActionConfig) => !action.isMain && !action.isLoading);
      this.loadingActions = visibleActions.filter((action: ActionConfig) => action.isLoading && !val[action.name]?.hidden());
      this.actions = val;
    }

    this.changeRef.detectChanges();
  }

  @Input() noBorder = false;

  constructor(private readonly changeRef: ChangeDetectorRef) { }

  private resetActions(): void {
    this.mainActions = null;
    this.additionalActions = null;
    this.loadingActions = null;
    this.actions = null;

    this.changeRef.detectChanges();
  }

  public toPage(index: number): void {
    this.navigate.emit(index);
  }
}
