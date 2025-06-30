type ActionFunction = () => void;
type DisabledPredicate = () => boolean;
type HiddenPredicate = () => boolean;
type TooltipGetter = () => string;

export interface ActionOption {
  name: string;
  class?: string;
  disabled?: DisabledPredicate;
  hidden?: HiddenPredicate;
  callback: ActionFunction;
  permissions?: string | string[];
}

export interface ActionObject {
  callback?: ActionFunction;
  disabled?: DisabledPredicate;
  tooltip?: TooltipGetter;
  hidden?: HiddenPredicate;
  options?: ActionOption[];
  permissions?: string | string[];
  awaitedActionTypes?: string[];
}

export interface ActionHandlersMap {
  new?: ActionFunction | ActionObject;
  edit?: ActionFunction | ActionObject;
  startRun?: ActionFunction | ActionObject;
  refresh?: ActionFunction | ActionObject;
  save?: ActionFunction | ActionObject;
  delete?: ActionFunction | ActionObject;
  download?: ActionFunction | ActionObject;
  cancel?: ActionFunction | ActionObject;
  back?: ActionFunction | ActionObject;
  linkExisting?: ActionFunction | ActionObject;
  approve?: ActionFunction | ActionObject;
  reject?: ActionFunction | ActionObject;
  logCommunication?: ActionFunction | ActionObject;
  logCall?: ActionFunction | ActionObject;
  clearFilter?: ActionFunction | ActionObject;
  advancedSearch?: ActionFunction | ActionObject;
  basicSearch?: ActionFunction | ActionObject;
  saveSearch?: ActionFunction | ActionObject;
  showLienDashboard?: ActionFunction | ActionObject;
  unlockAccount?: ActionFunction | ActionObject;
  resentRegistration?: ActionFunction | ActionObject;
  resetMFA?: ActionFunction | ActionObject;
  collapseNotes?: ActionFunction | ActionObject;
  expandNotes?: ActionFunction | ActionObject;
  pinPage?: ActionFunction | ActionObject;
  removePin?: ActionFunction | ActionObject;
  deleteSearch?: ActionFunction | ActionObject;
  viewInLPM?: ActionFunction | ActionObject;
  exporting?: ActionFunction | ActionObject;
  actionPerfomed?: ActionFunction | ActionObject;
  collapseAll?: ActionFunction | ActionObject;
  expandAll?: ActionFunction | ActionObject;
  saveNote?: ActionFunction | ActionObject;
  cancelNote?: ActionFunction | ActionObject;
  deleteCommunication?: ActionFunction | ActionObject;
  actions?: ActionFunction | ActionObject;
  closingStatementGeneration?: ActionFunction | ActionObject;
  generatingDocuments?: ActionFunction | ActionObject;
  stopPaymentRequest?: ActionFunction | ActionObject;
  checkVerification?: ActionFunction | ActionObject;
  holdPayments?: ActionFunction | ActionObject;
  updateHoldStatus?: ActionFunction | ActionObject;
  processing?: ActionFunction | ActionObject;
  paymentRequest?: ActionFunction | ActionObject;
  stageHistory?: ActionFunction | ActionObject;
  addToProbate?: ActionFunction | ActionObject;
  voidPayment?: ActionFunction | ActionObject;
  newSubTask?: ActionFunction | ActionObject;
  feeCap?: ActionFunction | ActionObject;
  qsfSweepInProgress?: ActionFunction | ActionObject;
  commitChanges?: ActionFunction | ActionObject;
  transferRequest?: ActionFunction | ActionObject;
  finalStatusLetter?: ActionFunction | ActionObject;
  voidClosingStatement?: ActionFunction | ActionObject;
}
