import { Address } from './address/address';
import { KeyValue } from '.';

export class ClaimantSummary {
  id: number;
  personId: number | undefined;
  primaryPhone: string;
  injuryCategory: Array<string>[];
  orgId: number;
  email: string;
  totalAllocation: number;
  ssn: string;
  currentAddress: Address;
  primaryOrg: string;
  attorneyReferenceId: string;
  dob: Date | undefined;
  dod: Date | undefined;
  gender: string;
  isPinned: boolean;
  projectName: string;
  archerId: number | null;
  totalAllocationInfo: KeyValue[];
  fundedDate: Date | undefined;
  services?: any[];
  qsfAdminStatus: string;
  settlementFirmId?: number;
  settlementFirmName: string;
  pin: string;
  designatedNotes: string;

  constructor(model?: Partial<ClaimantSummary>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): ClaimantSummary | null {
    if (item) {
      return {
        id: item.id,
        personId: item.personId,
        primaryPhone: item.primaryPhone,
        injuryCategory: item.injuryCategory,
        orgId: item.orgId,
        email: item.primaryEmail,
        totalAllocation: item.totalAllocation,
        ssn: item.ssn,
        currentAddress: Address.toModel(item.primaryAddress),
        primaryOrg: item.orgName,
        dob: item.dob,
        dod: item.dod,
        gender: item.gender,
        isPinned: item.isPinned,
        projectName: item.caseName,
        archerId: item.archerId,
        totalAllocationInfo: ClaimantSummary.getTotalAllocationInfo(item),
        attorneyReferenceId: item.attorneyReferenceId,
        fundedDate: item.fundedDate,
        qsfAdminStatus: item.qsfAdminStatus,
        settlementFirmId: item.settlementFirmId,
        settlementFirmName: item.settlementFirmName,
        pin: item.pin,
        designatedNotes: item.designatedNotes,
      };
    }

    return null;
  }

  private static getTotalAllocationInfo(item: any): KeyValue[] {
    const result = {};
    result['Total Allocation'] = item.settlementAmount;

    for (let i = 2; i < 6; i++) {
      const name = item[`defendantName${i}`];
      const value = item[`settlementAmount${i}`];
      if (name || value) {
        result[name || `Defendant ${i}`] = value;
      }
    }

    const keys = Object.keys(result);

    return keys.length ? keys.map(k => <KeyValue>{ key: k, value: result[k] }) : null;
  }
}
