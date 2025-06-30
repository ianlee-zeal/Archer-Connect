import moment from 'moment-timezone';
import { DEFAULT_DATE_TIME_FORMAT } from './constants';
import { TimezoneNamesHelper } from './timezone-names.helper';

export class DateHelper {
  public static timezoneName;

  public static dobOrDodToModel(data: any): Date {
    if (!data) {
      return null;
    }

    const date = new Date(data);

    date.setHours(12);

    return date;
  }

  public static toLocalDate(value: string): Date | null {
    if (!value) {
      return null;
    }

    if (this.timezoneName) {
      const utcDate = moment.utc(value);
      const result = moment.tz(utcDate, TimezoneNamesHelper.getIanaNameByWindowsTimezone(this.timezoneName)).format(DEFAULT_DATE_TIME_FORMAT);
      return new Date(result);
    }

    return moment.utc(value).toDate();
  }

  public static fromLocalDateToUtcString(localDate: Date): string | null {
    if (!localDate) {
      return null;
    }

    if (this.timezoneName) {
      const result = moment(localDate).tz(TimezoneNamesHelper.getIanaNameByWindowsTimezone(this.timezoneName), true);
      return result.toISOString();
    }

    return moment.utc(localDate).toISOString();
  }

  public static toUtcDateString(localDate: Date): string | null {
    return localDate ? moment(localDate).utc().toDate().toISOString() : null;
  }

  public static toStringWithoutTime(date: Date): string | null {
    return date ? moment(date).format('YYYY-MM-DD') : null;
  }

  public static toMonthDayYearFormatString(date: Date): string | null {
    return date ? moment(date).format('MM/DD/YYYY') : null;
  }

  public static toLocalDateWithoutTime(date: string): Date | null {
    if (!date) {
      return null;
    }

    const m = moment(date);

    const localDateWithoutTime = new Date(m.year(), m.month(), m.date());

    return localDateWithoutTime;
  }
}
