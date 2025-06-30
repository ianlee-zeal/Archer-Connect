export enum ScheduleFrequency {
    Weekly = 1,
    Monthly = 2,
}

export const ScheduleFrequencyValues =  {
    [ScheduleFrequency.Monthly]: 'monthly',
    [ScheduleFrequency.Weekly]:  'weekly',
}

export enum RepeatType {
    DayOfMonth = 'DayOfMonth',
    DayOfWeek = 'DayOfWeek'
}