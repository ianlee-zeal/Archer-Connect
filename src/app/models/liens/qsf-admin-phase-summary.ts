export class QsfAdminPhaseSummary {
  paid: number;
  unpaid: number;
  noData: number;

  get totalCount(): number {
    return this.paid + this.unpaid + this.noData;
  }

  constructor(model?: Partial<QsfAdminPhaseSummary>) {
    Object.assign(this, model);
  }
}
