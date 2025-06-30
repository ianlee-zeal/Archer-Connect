import { PipeTransform, Pipe } from '@angular/core';
import { ProductCategory } from '@app/models/enums';

@Pipe({ name: 'lienServiceIconPipe' })
export class LienServiceIconPipe implements PipeTransform {
  transform(lienServiceType: ProductCategory): string {
    const imgsPath = 'assets/images/';

    switch (lienServiceType) {
      case ProductCategory.MedicalLiens: return `${imgsPath}Lien Resolution.svg`;
      case ProductCategory.Release: return `${imgsPath}Release.svg`;
      case ProductCategory.Bankruptcy: return `${imgsPath}Bankruptcy.svg`;
      case ProductCategory.Probate: return `${imgsPath}Probate.svg`;
      case ProductCategory.ClaimsAdministration: return `${imgsPath}Claims.svg`
      default: return `${imgsPath}Project.svg`;
    }
  }
}
