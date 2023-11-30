import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Weekdays } from '../utils/weekdays';
import { HttpRequestService } from '../../commons/services/http-requests.service';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { DatesService } from '../../commons/services/dates.service';
import { HoursDay } from '../utils/hoursDay';
import { ScheduleData } from '../models/schedule.interface';
import { takeUntil, tap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';


@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit, OnDestroy {
  private sub$: Subject<void> = new Subject();
  private _ApiData: string = environment.apiEndPoint
  private _scheduleData: ScheduleData[] = [];
  
  public scheduleDataForDay: ScheduleData[] = [];
  public weekdays: string[] = [];
  public hoursDay: string[] = [];
  public hoursDayInitCopy: string[] = [];
  public hoursDayEndCopy: string[] = [];
  public enableHourEnd!: boolean;
  public formSelectDate: FormGroup = this.fb.group({
    weekday: ['', Validators.required],
    hourDayInit: ['', Validators.required],
    hourDayEnd: ['', Validators.required]
  })

  constructor(
    private http: HttpRequestService,
    private datesService: DatesService,
    private fb: FormBuilder,
    private ms: MatSnackBar
  ) { }
 
  ngOnInit(): void {
    this.getDataEndPoint();
    this.getWeekdays()
    this.getHoursDay()

    this.formSelectDate.get('weekday')?.valueChanges
      .pipe(
        takeUntil(this.sub$),
        tap({
          next: (weekday: string) => {
            this.filterWeekdaySelect(weekday)
          },
          error: (err: Error) => {
            console.error(err)
          }
        })
      )
      .subscribe()

    this.formSelectDate.get('hourDayInit')?.valueChanges
    .pipe(
      takeUntil(this.sub$),
      tap({
        next: (hourDayInit: string) => {
          this.setTimeEnd(hourDayInit)
        },
        error: (err: Error) => {
          console.error(err)
        }
      })
    )
    .subscribe()
  }

  ngOnDestroy(): void {
    this.sub$.next();
    this.sub$.complete();
  }

  private getDataEndPoint(): void {
    this.http.getData<ScheduleData[]>(this._ApiData)
      .pipe(
        takeUntil(this.sub$),
        tap((response: ScheduleData[]) => {
          this._scheduleData = response.map((data: ScheduleData) => {
            data.HourEnd = this.setFormatHourDuration(data)
            return data
          });
        })
      )
      .subscribe()
  }

  private getWeekdays(): void {
    this.weekdays = this.datesService.weekdays.length > 0 ? this.datesService.weekdays : Weekdays.getWeekdays();
  }

  private getHoursDay(): void {
    this.hoursDay = this.datesService.hoursDay.length > 0 ? this.datesService.hoursDay : HoursDay.getHoursDay();
    this.hoursDayInitCopy = [...this.hoursDay]
  }

  private filterWeekdaySelect(daySelect: string): void {
    this.scheduleDataForDay = this._scheduleData.filter((data: ScheduleData) => data.Day === daySelect);
    this.scheduleByDay()
  }

  public scheduleByDay(): void {
    let scheduleByDay = this.scheduleDataForDay
    const start: moment.Moment = moment().startOf('hour').hour(9);
    const end: string = moment().startOf('hour').hour(17).format('HH:mm');
    const date: string = '2023-12-29';

    const times: number = 8 * 4;

    let hours: string[] = [];

    for (let i = 0; i < times; i++) {
      const hour = moment(start)
        .add(15 * i, 'minutes')
        .format('HH:mm');

        hours.push(hour); 
    }

    for (let i = 0; i < scheduleByDay.length; i++) {
      let time = moment(`${date} ${scheduleByDay[i].Hour}`);

      let startOf = hours.indexOf(time.format('HH:mm'));

      hours.splice(startOf, parseInt(scheduleByDay[i].Duration) / 15);   
      let position = hours.indexOf(time.subtract(15, 'minutes').format('HH:mm'));
      hours.splice(position, 1);
    }

    let hour = moment(`${date} ${hours[hours.length-1]}`).add('30', 'minutes').format('HH:mm');

    let lastHourIsAfter = moment(`${date} ${hour}`)
    .isAfter(moment(`${date} ${end}`));

    if(lastHourIsAfter) {
      hours.splice(hours.length-1, 1)
    }
    
    this.hoursDayInitCopy = hours
  }

  private setTimeEnd(hourInitSelect: string): void {
    const date: string = '2023-12-29';
    const hoursEnd: string[] = []
    let scheduleByDay: ScheduleData[] = this.scheduleDataForDay
    let timeInitOther: string = ''
    let timeInit = moment(`${date} ${hourInitSelect}`);

    for(let i = 0; i < 4; i++ ) {
      if(i === 0) {
        hoursEnd.push(timeInit.add('30', 'minutes').format('HH:mm'))
      }else {
        timeInitOther = timeInit.add('15', 'minutes').format('HH:mm');

        const validate: boolean = scheduleByDay.some((data: ScheduleData) => timeInitOther === data.Hour)
        
        if(moment(`${date} 17:00`) < moment(`${date} ${timeInitOther}`)) {
          break;
        }

        if(!validate) {
          hoursEnd.push(timeInitOther)
        }else {
          hoursEnd.push(timeInitOther)
          break;
        }
      }
    }

    this.hoursDayEndCopy = hoursEnd
    this.enableHourEnd = true
  }

  private setFormatHourDuration(data: ScheduleData): string {
    const newDate: Date = new Date();
    const arrayHour: string[] = this.splitHour(data.Hour)

    newDate.setHours(parseInt(arrayHour[0]));
    newDate.setMinutes(parseInt(arrayHour[1]));

    newDate.setMinutes(newDate.getMinutes() + parseInt(data.Duration))
    
    return HoursDay.convertDateToHourString(newDate)
  }

  private splitHour(hour: string): string[] {
    const separateHoursArray: string[] = hour.split(':');

    return separateHoursArray;
  }

  confirmSchedule(): void {
    const init: moment.Moment = moment(this.formSelectDate.get('hourDayInit')?.value, 'HH:mm', true);
    const end: moment.Moment  = moment(this.formSelectDate.get('hourDayEnd')?.value, 'HH:mm', true);

    const newSchedule: ScheduleData = {
      Day: this.formSelectDate.get('weekday')?.value,
      Hour: this.formSelectDate.get('hourDayInit')?.value,
      Duration: end.diff(init, 'minute').toString(),
    }
    
    this._scheduleData.push(newSchedule)
    this.formSelectDate.reset()

    this.ms.open('Cita confirmada', '', {
      duration: 4000
    })
  }
}
