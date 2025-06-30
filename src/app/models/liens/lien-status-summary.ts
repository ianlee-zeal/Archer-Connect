export class LienStatusSummary {
  pendingCount: number;
  finalizedCount: number;
  isEngaged: boolean;

  get totalCount(): number {
    return this.pendingCount + this.finalizedCount;
  }

  get percentComplete(): number {
    if (this.totalCount === 0) {
      return 0;
    }
    return Math.round((this.finalizedCount / this.totalCount) * 100);
  }

  constructor(model?: Partial<LienStatusSummary>) {
    Object.assign(this, model);
  }
}
