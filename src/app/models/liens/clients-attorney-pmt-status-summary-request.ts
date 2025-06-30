export class ClientsByAttorneyPmtStatusSummaryRequest {
  productPhases?: number [];
  productStages?: number [];

  constructor(model?: Partial<ClientsByAttorneyPmtStatusSummaryRequest>) {
    Object.assign(this, model);
  }
}