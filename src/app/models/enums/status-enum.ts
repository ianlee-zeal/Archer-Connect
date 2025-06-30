export enum StatusEnum {
  Submitted = 1,
  PendingSetup = 2,
  SetupComplete = 3,
  Rejected = 4,
  Pending = 5,
  Complete = 6,
  CompleteWithError = 7,
  Error = 8,

  // ETL Statuses
  Extracting = 10,
  Transforming = 11,
  Validating = 12,
  Downloading = 13,
  Loading = 14,
  Indexing = 15,
  ProcessComplete = 20,
  LoadingComplete = 21,
  GeneratingPostActionAuditReport = 22,

  // Probate statuses
  ProbateActive = 203,
  ProbateInactive = 204,

  // Team member statuses
  TeamMemberActive = 233,
  TeamMemberInactive = 234,

  //Ticket Statuses
  TicketStatusPending = 376,
  TicketStatusReceived = 377,
}
