import { Pipe, PipeTransform } from "@angular/core";
import { InjuryCategory } from "@app/models";

///

@Pipe({
  name: 'injuryCategoryTitle'
})
export class InjuryCategoryTitlePipe implements PipeTransform {
  transform(injuryCategory: InjuryCategory): string {
    return `${injuryCategory.name} (${injuryCategory.isNuisanceValue ? 'PIP' : 'non-PIP'})`;
  }
}
