export class ReleaseInGoodOrderSummary {
  yesCount: number;
  noCount: number;

  get totalCount(): number {
    return this.yesCount + this.noCount;
  }

  constructor(model?: Partial<ReleaseInGoodOrderSummary>) {
    Object.assign(this, model);
  }
}