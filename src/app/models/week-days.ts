import { WeekDay } from '@angular/common';
import { IdValue } from '@app/models';


export class WeekDays {
  public static readonly businessDaysShort: IdValue[] = [
    new IdValue(WeekDay.Monday, 'M'),
    new IdValue(WeekDay.Tuesday, 'T'),
    new IdValue(WeekDay.Wednesday, 'W'),
    new IdValue(WeekDay.Thursday, 'Th'),
    new IdValue(WeekDay.Friday, 'F'),
  ];

  public static readonly businessDays: IdValue[] = [
    new IdValue(WeekDay.Monday, 'Monday'),
    new IdValue(WeekDay.Tuesday, 'Tuesday'),
    new IdValue(WeekDay.Wednesday, 'Wednesday'),
    new IdValue(WeekDay.Thursday, 'Thursday'),
    new IdValue(WeekDay.Friday, 'Friday'),
  ];
}
