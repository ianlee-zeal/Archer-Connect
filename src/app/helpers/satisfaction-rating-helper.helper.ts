import { RatingEnum } from '@app/models/enums/rating.enum';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';

export class SatisfactionRatingHelper {
  public static getSatisfactionRatingList() : SelectOption[] {
    return [
      { id: RatingEnum.Excellent, name: 'Excellent', class: 'rating-icon rating-icon--excellent' },
      { id: RatingEnum.Neutral, name: 'Neutral', class: 'rating-icon rating-icon--neutral' },
      { id: RatingEnum.AtRisk, name: 'At Risk', class: 'rating-icon rating-icon--declining' },
      { id: RatingEnum.Negative, name: 'Negative', class: 'rating-icon rating-icon--negative' },
    ];
  }
}
