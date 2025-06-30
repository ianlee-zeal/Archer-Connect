import { Injectable } from '@angular/core';
import { NgbDateStruct, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment-timezone';

import { DateFormatPipe } from '../_pipes';

@Injectable()
export class NgbDateCustomParserFormatter extends NgbDateParserFormatter {
    public parse(value: string): NgbDateStruct {
        if (this.isValid(value)) {
            let date = moment(value.trim(), DateFormatPipe.format);

            return date.isValid()
                ? <NgbDateStruct>{
                    day: +date.format('DD'),
                    month: +date.format('MM'),
                    year: +date.format('YYYY')
                }
                : null;
        }

        return null;
    }

    public format(date: NgbDateStruct): string {
        if (!date)
            return '';

        let mdt = moment([date.year, date.month - 1, date.day]);

        if (!mdt.isValid())
            return '';

        return mdt.format(DateFormatPipe.format);
    }

    private isValid(value: string) {
        let isValid = false;

        if (value && value.length == DateFormatPipe.format.length) {
            let date = new Date(value);
            isValid = date instanceof Date && !isNaN(date.valueOf())
        }

        return isValid;
    }
}