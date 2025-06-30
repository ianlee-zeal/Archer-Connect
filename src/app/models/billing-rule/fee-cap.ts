import { DateHelper } from '@app/helpers';
import { IdValue } from '../idValue';
import { User } from '../user';

export interface FeeCapDto {
  id: number;
  name: string;
  cappedPrice?: number;
  cappedPricePct?: number;
  description: string;
  isAwardBased: boolean;
  minSettlementAmount?: number;
  maxSettlementAmount?: number;
  injuryCategoryId?: number;
  injuryCategory: IdValue;
  projectId: number;
  billingRulesToFeeCaps: BillingRulesToFeeCapDto[];
}

export interface FeeCapResponse {
  id: number;
  name: string;
  cappedPrice?: number;
  cappedPricePct?: number;
  description: string;
  isAwardBased: boolean;
  minSettlementAmount?: number;
  maxSettlementAmount?: number;
  injuryCategoryId?: number;
  injuryCategory: IdValue;
  projectId: number;
  billingRulesToFeeCaps: BillingRulesToFeeCapDto[];
  createdBy: User;
  createdDate: string;
  lastModifiedBy?: User;
  lastModifiedDate: string;
}

export class FeeCap {
  id: number;
  name: string;
  cappedPrice?: number;
  cappedPricePct?: number;
  cappedPriceDisplay: number;
  description: string;
  isAwardBased: boolean;
  minSettlementAmount?: number;
  maxSettlementAmount?: number;
  injuryCategoryId?: number;
  injuryCategory: IdValue;
  projectId: number;
  billingRulesToFeeCaps: BillingRulesToFeeCapDto[];
  billingRulesToFeeCapsCount: number;
  createdBy: User;
  createdDate: Date;
  lastModifiedBy: User;
  lastModifiedDate: Date;

  public static toModel(item: FeeCapResponse): FeeCap {
    if (!item) return null;
    return {
      id: item.id,
      name: item.name,
      cappedPrice: item.cappedPrice,
      cappedPricePct: item.cappedPricePct,
      cappedPriceDisplay: item.cappedPrice || item.cappedPricePct || 0,
      description: item.description,
      isAwardBased: item.isAwardBased,
      minSettlementAmount: item.minSettlementAmount,
      maxSettlementAmount: item.maxSettlementAmount,
      injuryCategoryId: item.injuryCategoryId,
      injuryCategory: item.injuryCategory,
      projectId: item.projectId,
      billingRulesToFeeCaps: item.billingRulesToFeeCaps,
      billingRulesToFeeCapsCount: (item.billingRulesToFeeCaps || []).length,
      createdBy: (item.createdBy && User.toModel(item.createdBy)) || null,
      createdDate: DateHelper.toLocalDate(item.createdDate),
      lastModifiedBy: (item.lastModifiedBy && User.toModel(item.lastModifiedBy)) || null,
      lastModifiedDate: DateHelper.toLocalDate(item.lastModifiedDate),
    };
  }

  public static toDto(item: any): FeeCapDto {
    if (!item) return null;

    return {
      id: item.id,
      name: item.name,
      cappedPrice: item.cappedPrice,
      cappedPricePct: item.cappedPricePct,
      description: item.description,
      isAwardBased: item.isAwardBased,
      minSettlementAmount: item.minSettlementAmount,
      maxSettlementAmount: item.maxSettlementAmount,
      injuryCategoryId: item.injuryCategoryId,
      injuryCategory: item.injuryCategory,
      projectId: item.projectId,
      billingRulesToFeeCaps: item.billingRulesToFeeCaps,
    };
  }
}

export interface BillingRulesToFeeCapDto {
  id: number;
  billingRuleId: number;
  feeCapId: number;
}

export interface IRelatedContractRules {
  key: number;
  selected: boolean;
  value: string;
}
