export class TriggerType {
  static readonly IsClientFunded = { id: 10, name: 'Is Client Funded' };
  static readonly NoInterest = { id: 11, name: 'No Interest' };
  static readonly OutcomeDetermined = { id: 12, name: 'Outcome Determined' };
  static readonly RelatedServiceMatch = { id: 14, name: 'Related Service Match' };
  static readonly CollectorMatch = { id: 15, name: 'Collector Match' };
}

export const AutomatedTriggersIds = [
  12, 14, 15
];
