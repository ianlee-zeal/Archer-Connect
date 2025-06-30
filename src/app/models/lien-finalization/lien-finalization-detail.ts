export class LienFinalizationDetail {
  id: number;
  case: string;
  clientId: number;
  finalDemandAmount: string;
  lienId: number;
  lienType: string;
  planTypes: any;
  selected: boolean;
  stage: string;
  tort: string;

  static toModel(item: LienFinalizationDetail | any) : LienFinalizationDetail | null {
    if (item) {
      return {
        ...item,
        planTypes: item.planTypes?.map(planType => {
          return planType.name;
        }).toString().replace(',', ', '),
      };
    }

    return null;
  }
}