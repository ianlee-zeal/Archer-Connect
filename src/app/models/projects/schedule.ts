import { ScheduleFrequency } from "../enums/schedule-frequency.enum";
import { RepeatType } from "../enums/schedule-frequency.enum";

export class Schedule {
    frequency: ScheduleFrequency;
    dayOfWeek?: number;
    repeatType?: RepeatType;
    dayOfMonth?: number;
    weekOfMonth?: number;
  }

