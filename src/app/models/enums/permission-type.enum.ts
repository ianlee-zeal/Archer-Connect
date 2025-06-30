export enum PermissionTypeEnum {
  None = 0,

  // Module Categories (id = 1)
  Admin = 7,
  LienProducts = 1,
  Bankruptcy = 22,
  Release = 24,
  GlobalClaimantSearch = 34,
  GlobalProjectSearch = 35,
  GlobalPaymentSearch = 36,
  GlobalOrganizationSearch = 37,
  GlobalPersonSearch = 39,
  GlobalDocumentSearch = 40,
  GlobalDocumentIntakeSearch = 70,
  GlobalSettlementSearch = 72,
  GlobalCommunicationSearch = 86,
  GlobalDisbursementSearch = 101,

  Matters = 93,
  MatterDocuments = 116,

  // Object Categories (id = 2)
  Users = 9,
  Addresses = 14,
  Communications = 20,
  Notes = 21,
  Payments = 26,
  UserRoles = 28,
  AccessPolicies = 29,
  Roles = 47,
  HangfireDashboard = 51,

  // Projects
  Projects = 3,
  ProjectImports = 41,
  ProjectNotes = 117,
  DisbursementGroups = 60,
  ClaimantSummary = 63,
  PaymentQueues = 121,
  ProjectsDocuments = 64,
  ProjectDisbursementNotes = 69,
  ProjectSettings = 90,
  ProjectContacts = 90, // TODO Change when backend will be done
  AccountingDetails = 110,
  ManualPaymentRequest = 141,
  ProjectsClosingStatement = 144,
  ProjectsCommunications = 149,
  ProjectOrgPaymentStatus = 181,

  // Clients
  Clients = 4,
  ClientOrgAccess = 30,
  ClientCommunications = 31,
  ClientNotes = 32,
  ClientIdentifiers = 33,
  ClientDocuments = 58,
  ClientContact = 48,
  ClientCommunicationsDocuments = 200,

  // Persons
  Persons = 5,
  PersonSSN = 11,
  PersonEmail = 12,
  PersonAddresses = 46,

  // Organizations
  Organizations = 6,
  NameOnCheck = 113,
  ERPVendorName = 114,
  OrganizationTypes = 42,
  OrganizationAddresses = 43,
  OrganizationDocuments = 44,
  OrganizationNotes = 45,
  SubOrganizations = 49,
  OrganizationPaymentInstruction = 92,
  OrganizationRating = 153,

  // BankAccounts
  BankAccounts = 15,
  BankAccountNumber = 25,
  BankAccountNotes = 95,
  BankAccountFederalWireAba = 107,
  BankAccountFfcAccount = 108,

  CommunicationNotes = 53,

  // Phone numbers
  PersonPhoneNumber = 54,

  // Payments (disbursements)
  Disbursements = 55,
  PaymentHistory = 56,
  ClaimSettlementLedgers = 57,
  ElectionForms = 61,

  ClaimantDisbursementGroups = 65,

  // Document Intake (DIRQ)
  DocumentIntake = 67,
  LedgerSettings = 68,
  ChartOfAccounts = 66,

  // Ledger Account Groups
  LedgerAwardFundingAccGroup = 71,
  LedgerMDLAccGroup = 74,
  LedgerCBFAccGroup = 75,
  LedgerAttyFeesAccGroup = 76,
  LedgerAttyExpensesAccGroup = 77,
  LedgerLiensAccGroup = 78,
  LedgerARCHERFeesAccGroup = 79,
  LedgerOtherFeesAccGroup = 80,
  LedgerClaimantDisbursementsAccGroup = 81,
  ThirdPartyPMTSAccGroup = 102,
  ClaimantClosingStatement = 72,
  ClaimantClosingStatementSettings = 73,

  // Document templates
  Templates = 85,

  // Settlements
  Settlements = 17,
  SettlementNotes = 88,
  SettlementDocuments = 89,

  // Matter
  MatterNotes = 96,

  // Billing rules
  BillingRuleTemplate = 97,
  BillingRule = 100,

  EngagedServices = 103,

  StopPaymentRequest = 111,
  CheckVerification = 120,

  // Documents
  Documents = 27,
  DocumentType = 115,

  // Auditor
  AudiBatches = 137,
  DataProcessingAuditor = 143,

  // Probates
  ProbateDashboards = 23,
  GlobalProbateSearch = 145,
  ProbateDetails = 146,
  LegalContacts = 148,

  // Advanced organization permissions
  OrganizationAccountManager = 156,
  OrganizationClientRelationshipSpecialist = 157,

  ProjectMessaging = 159,

  // Lien Finalization Tool
  LienFinalizationTool = 160,
  Integrations = 161,

  // Tasks
  TaskManagement = 165,

  ProjectQsfDeficiencies = 171,

  ClaimantPin = 174,

  WorkflowCommands = 175,

  ProjectQSFSweep = 179,

  GlobalPaymentQueue = 180,

  DigitalPayRoster = 185,

  // Document Batch Upload
  DocumentBatch = 190,

  TracePermissions = 193,

  OrgPortalAccess = 195,

  AuditInfo = 196,
  ImpersonateOrg = 198,
  FeatureFlag = 199,

  MaintenanceMode = 204,

  ReportSettings = 206,

  ProjectOrganizations = 208,

  IntegrationJob = 209,

  Claims = 211,

  CommunicationHub = 212,

  ANDIMessaging = 213,

  Upload_W9 = 214,

  ClaimantDashboard = 216,

  ProjectDeficiencies = 197,
  ClaimantDeficiencies = 219,
  GlobalDeficiencies = 223,

  DefenseDashboard = 215,

  TortDashboard = 217,

  FirmLandingPage = 222,

  ProjectDashboard = 224,
}
