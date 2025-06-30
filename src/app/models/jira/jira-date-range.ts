export class JiraDateRange {
  from: Date | null;
  to: Date | null;

  constructor(from: Date | null = null, to: Date | null = null) {
    this.from = from;
    this.to = to;
  }

  public static getDefaultDateRange(): JiraDateRange {
    return new JiraDateRange();
  }
}
