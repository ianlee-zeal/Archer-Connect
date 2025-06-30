import { DateHelper } from '@app/helpers/date.helper';

export class FinalizationCount {
  from: Date;
  to: Date;
  count: number;
  productCategoryId: number;

  static toModel(item: FinalizationCountData) {
    if (item) {
      return {
        from: DateHelper.toLocalDate(item.from),
        to: DateHelper.toLocalDate(item.to),
        count: item.count,
        productCategoryId: item.productCategoryId,
      };
    }

    return null;
  }
}

export class FinalizationCountData {
  from: string;
  to: string;
  count: number;
  productCategoryId: number;
}

export class FinalizationCountRequestOptions {
  projectId: number;
  productCategoryId: number;
  from: Date;
  to: Date;
}
