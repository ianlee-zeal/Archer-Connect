export enum LedgerAccountEnum {
  MDLAttorneyShare = '49021',
  MDLClaimantShare = '49022',
  CBFAttorneyShare = '49031',
  CBFClaimantShare = '49032',
  CBFClaimantShareRefundCredit = '49932',
  LiensTotal = '51100',
  LienCreditFromHoldback = '51200',
  LienCredit = '51300',
  MedLienHoldback = '51010',
  AttyFeesReductionCredit = '50190',
  AttyExpenseHoldback = '50135',
  AttyExpenseHoldbackCredit = '50195',
  ArcherCredit = '52900',
  LienFeeReductionCredit = '52915',
  QSFFeeReductionCredit = '52920',
  OtherFeesCredit = '53900',
  PrimaryFirmFees = '50010',
  ReferringFirmFees = '50011',
  SettlementFirmFees = '50012',
  NetDistribution = '60010',
  LienResolution = '52010',
  LienFeeHoldback = '52005',
  LienFeeCreditfromHoldback = '52910',
  MedicareMedicaidVOE = '52011',
  PLRPVOE = '52012',
  Probate = '52030',
  QSFAdmin = '52020',
  ProbateOtherFees = '53030',
  OtherFees = '53000'
}

export const AttyFirmFees: string[] = [
  LedgerAccountEnum.PrimaryFirmFees,
  LedgerAccountEnum.ReferringFirmFees,
  LedgerAccountEnum.SettlementFirmFees,
];

export const AttyExpenseNonGrouping: string[] = [
  LedgerAccountEnum.AttyExpenseHoldback,
  LedgerAccountEnum.AttyExpenseHoldbackCredit,
];

export const CBFGroups: string[] = [
  LedgerAccountEnum.CBFAttorneyShare,
  LedgerAccountEnum.CBFClaimantShare,
];

export const MDLGroups: string[] = [
  LedgerAccountEnum.MDLAttorneyShare,
  LedgerAccountEnum.MDLClaimantShare,
];
