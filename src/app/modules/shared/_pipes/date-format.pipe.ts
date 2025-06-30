import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import moment from 'moment-timezone';
import { TimezoneNamesHelper } from '@app/helpers/timezone-names.helper';
import { DEFAULT_DATE_TIME_FORMAT } from '@app/helpers/constants';

@Pipe({ name: 'dateFormat' })
export class DateFormatPipe implements PipeTransform {
  public static format: string = 'MM/DD/YYYY'; // use for datePickers

  public static timeFormat: string = 'h:mm a';

  private readonly datePipe = new DatePipe('en-US');

  private getPipeFormat = (format: string, mask) => {
    let pipeFormat = format;

    // eslint-disable-next-line guard-for-in
    for (const x in mask) {
      pipeFormat = pipeFormat.replace(new RegExp(x, 'g'), mask[x]);
    }

    return pipeFormat;
  };

  private readonly pipeFormat = this.getPipeFormat(DateFormatPipe.format, {
    D: 'd',
    Y: 'y',
  });

  transform(
    value: string | Date,
    displayTime = false,
    inputFormat?: string,
    timezone?: string,
    isUtc?: boolean,
    isTimeDisabled = false,
  ) {
    if (!value) {
      return null;
    }

    const format = this.getFormat(inputFormat, displayTime);

    let result: string | Date;
    if (!isTimeDisabled) {
      const utcDate = moment.utc(value);
      if (isUtc) {
        result = utcDate.format(DEFAULT_DATE_TIME_FORMAT);
      } else {
        result = moment.tz(utcDate, this.getTimezone(timezone)).format(DEFAULT_DATE_TIME_FORMAT);
      }
    } else {
      result = new Date(value);
    }

    return this.datePipe.transform(result, format);
  }

  public getTimezone(timezone?: string) {
    return timezone ? TimezoneNamesHelper.getIanaNameByWindowsTimezone(timezone) : moment.tz.guess();
  }

  private getFormat(inputFormat: string, withTime: boolean): string {
    if (!inputFormat) {
      return !withTime ? this.pipeFormat : `${this.pipeFormat} ${DateFormatPipe.timeFormat}`;
    }
    return inputFormat;
  }
}
