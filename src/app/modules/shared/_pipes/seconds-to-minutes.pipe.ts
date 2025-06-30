/* eslint-disable class-methods-use-this */
import { Pipe, PipeTransform } from '@angular/core';

// Transforms seconds to minutes. For example, transforms "300" (seconds) to "05:00" (5 minutes).
@Pipe({ name: 'secToMin', pure: true })
export class SecondsToMinutesPipe implements PipeTransform {
    transform(seconds: number | undefined): string {
        if (seconds === null || seconds === undefined) {
            return '';
        }

        var date = new Date(0); //We need to manually set 0 here.
        date.setSeconds(seconds);
        var minutesSecondsString = date.toISOString().substr(14, 5); //Get only minutes + seconds string from the toISOString() result like: 1970-01-01T00:05:00.000Z

        return minutesSecondsString;
    }
}
