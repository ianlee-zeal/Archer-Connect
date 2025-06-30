export enum PermissionActionTypeEnum {
  // Basic
  Read = 1,
  Create = 2,
  Edit = 3,
  Delete = 4,

  // Advanced
  Approve = 5,
  Reject = 6,
  ViewInLPM = 7,
  ClaimantPutOnHold = 20,
  ClaimantRemoveFromHold = 21,

  EditGlobalCommunication = 25,

  UnlockAccount = 8,
  ResendRegistration = 9,
  ResetMFA = 10,
  DisableMFA = 69,

  SwitchOrganization = 11,
  LogCall = 12,

  ViewSourceInformation = 24,
  EditCustomClosingStatementFields = 31,

  // Project Claimant Summary actions
  GeneratePaymentRequest = 13,
  GenerateFeeAndExpense = 14,
  UpdateStage = 15,
  GenerateClosingStatement = 16,
  GenerateFirmFeeExpenseWorksheet = 23,
  UpdateLienData = 26,
  SyncProbatePaymentInfoWithLedger = 29,
  UpdateFundedDate = 58,

  // Deficiencies
  OverrideDeficiency = 17,
  DeficiencyConfiguration = 36,

  // Stop Payment Request
  UpdateStatus = 18,
  UpdateRequestInformation = 19,
  DeleteQSFAcctAttachments = 30,

  // Probate Notes
  SeeInternalProbateNotes = 27,
  SeePublicProbateNotes = 28,

  // Probate Details
  ViewChangeHistoryTab = 32,
  EditProbateStatus = 34,

  // Payments
  VoidPayments = 33,

  // Documents
  SetDocumentPublicFlag = 35,

  // Claimants Overview
  ClaimantInvoicingDetails = 37,

  // Deficiencies Settings Templates
  ManageDeficienciesSettingsTemplates = 38,

  // Copy Project Settings
  CopyProjectSettings = 39,

  // Authorize Ledger Entries
  AuthorizeLedgerEntries = 40,

  // Manage Wire Instructions
  ManageWireInstructions = 43,

  // Run QSF Sweep
  RunQSFSweep = 44,

  FindLiensToPay = 45,
  UpdateLienPaymentStage = 46,
  CopySpecialPaymentInstructions = 52,
  TransferPayments = 66,
  ReviewAllARCHERFees = 78,
  RefundTransferRequest = 89,

  // Probate
  ViewDetails = 47,
  ViewTracking = 50,

  // Access Policy
  SetPolicyLevel = 51,

  ClosingStatementSendDocuSign = 53,
  QCApproveRejectedBatch = 54,
  VoidClosingStatement = 94,

  // GlobalOrganizationSearch
  ExportUsers = 55,
  ViewPortalAccessColumn = 56,
  ExportUserLoginReport = 67,

  // Bank Account
  SetDefault = 57,

  // Audit Info
  ClaimantDetails = 59,
  ClaimantAddress = 60,
  ClaimantCommunications = 61,
  ClaimantContacts = 62,
  CommunicationsSearch = 63,
  ProjectDocuments = 64,
  Users = 76,

  // Medical Lien Resolutions
  ViewLienPaidDate = 65,

  // Feature Flag
  TransferToSubAccount = 66,

  // Set Role Level
  SetRoleLevel = 68,

  // User
  EmployeeDetails = 70,
  Teams = 71,

  // Settlements
  ShowFinancialSummaryToggle = 72,
  FinancialSummary = 73,
  RelatedClaimants = 74,
  RelatedProjects = 75,

  RecentReports = 77,

  FinalStatusLetter = 85,

  // Global Payment Queue
  FindReadytoInvoiceFees = 80,
  InvoiceArcherFees = 81,
  ARApproval = 82,
  FindARCHERFeesToPay = 83,
  AuthorizeARCHERFees = 84,
  TalcClaims = 86,
  AuthorizeLienEntries = 87,
  FindLiensToTransfer = 88,
  TalcDefenseDashboard = 90,
  ClaimantOverviewTab = 91,
  TalcDashboard = 92,
  ManualPaymentRequestsAllowed = 93,
  GTFPaymentAutomation = 95,
  LienImportAutomation = 97,
  EnhancedPaymentAutomation = 98,
  ProjectOverviewTab = 100,

  //Advanced permission-feature flag
  ProbateFeeAutomation = 99,
  LienFeeAutomation = 96,

  ANDIAttachments = 101,
  ProbateLocalCounselFeeAutomation = 102,
  BankruptcyFeeAutomation = 104,
}
