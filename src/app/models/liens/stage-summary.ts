export class LienStatusSummary {
  pendingCount: number;
  finalizedCount: number;

  get totalCount(): number {
    return this.pendingCount + this.finalizedCount;
  }

  constructor(model?: Partial<LienStatusSummary>) {
    Object.assign(this, model);
  }
}
