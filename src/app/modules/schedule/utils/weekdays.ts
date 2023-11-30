import { format } from "date-fns";
import { es } from 'date-fns/locale';

export class Weekdays {

    public static getWeekdays(): string[] {
        const weekdays: string[] = [];
        
        for(let i = 0; i < 7; i++) {
            const date = new Date(2023, 0, i + 1);
            const nameDay = format(date, 'EEEE', {locale: es})
            weekdays.push(nameDay);
        }

        return weekdays
    }
}