import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DatesService {
  private _weekdays: string[] = [];
  private _hoursDay: string[] = [];

  get weekdays(): string[] {
    return [...this._weekdays]
  }

  get hoursDay(): string[] {
    return [...this._hoursDay]
  }

  setWeekdays(weekdays: string[]): void {
    this._weekdays = weekdays
  }

  setHoursDay(hours: string[]): void {
    this._hoursDay = hours
  }

  constructor() { }
}
