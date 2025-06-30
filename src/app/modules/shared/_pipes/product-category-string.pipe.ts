import { PipeTransform, Pipe } from '@angular/core';
import { ProductCategory } from '@app/models/enums';

@Pipe({ name: 'productCategoryToString' })
export class ProductCategoryToStringPipe implements PipeTransform {
  public transform(category: ProductCategory): string {
    switch (category) {
      case ProductCategory.MedicalLiens: return 'Lien Resolution';
      case ProductCategory.Release: return 'Release';
      case ProductCategory.Bankruptcy: return 'Bankruptcy';
      case ProductCategory.Probate: return 'Probate';
      case ProductCategory.QSFAdministration: return 'QSF Admin';
      default: return '';
    }
  }
}
