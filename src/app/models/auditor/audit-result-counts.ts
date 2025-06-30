export class AuditResultCounts {
  total: number;
  errors: number;
  warnings: number;
  successes: number;

  public static hasErrorsOrWarnings(counts: AuditResultCounts): boolean {
    return Boolean(counts && (counts.errors || counts.warnings));
  }
}
