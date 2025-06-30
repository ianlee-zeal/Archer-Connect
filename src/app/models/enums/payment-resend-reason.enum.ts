export enum ResendReasonEnum {
  CheckExpired = 1,
  StolenCheck = 2,
  LostCheck = 3,
  IssuedInError = 4,
  UpdatedClaimantName = 5,
  MovedNewAddress = 6,
  IncorrectPayeeInformation = 7,
  DeceasedUpdatedPayee = 8,
  ClaimantAmountDiscrepancy = 9,
  OrganizationAmountDiscrepancy = 10,
  HOLDReissue = 11,
  DoNotReissue = 12,
  ReissueWithTotalNet = 13,
  Other = 14,
}

export enum ResendReasonSpecEnum {
  ReissueWithTotalNetNotPartial = 13,
  AttorneyFeeReduction = 14,
  OtherFeeReduction = 15,
  CheckIssuedInError = 17,
  Other = 18,
}
