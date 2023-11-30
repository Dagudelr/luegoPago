import { eachMinuteOfInterval, endOfDay, startOfDay } from "date-fns";

export class HoursDay {

    public static getHoursDay(): string[] {
      const currentDate: Date = new Date();

      const initDate: Date = startOfDay(new Date(currentDate));
      initDate.setHours(9, 0, 0, 0);

      const endDate: Date = endOfDay(new Date(currentDate));
      endDate.setHours(17, 0, 0, 0);

      const hoursDay = eachMinuteOfInterval({ start: initDate, end: endDate }, {step: 15});

      return hoursDay.map((hour: Date) => hour.toLocaleString("es", {hour: '2-digit', minute: '2-digit', hour12: false}));
    }

    public static convertDateToHourString(date: Date): string {
        return date.toLocaleString("es", {hour: '2-digit', minute: '2-digit', hour12: false})
    }
}