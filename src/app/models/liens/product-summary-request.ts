export class ProductSummaryRequest {
    rootProductCategoryId: number;
    productTypes?: number [];
    productPhases?: number [];
    productStages?: number [];
    isReleaseInGoodOrder?: boolean;

    constructor(model?: Partial<ProductSummaryRequest>) {
      Object.assign(this, model);
    }
  }