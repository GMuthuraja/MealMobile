import { Inject, Injectable, Optional } from '@angular/core';
import { format, getTime, getUnixTime, subDays, getYear, isSameDay, toDate, isBefore, addDays, getDate, getMonth, getDaysInMonth, isWithinInterval, addMonths, subMonths, isAfter, differenceInMonths } from 'date-fns';
import {
  CalendarOriginal,
  CalendarDay,
  CalendarMonth,
  CalendarModalOptions,
  CalendarResult,
  DayConfig,
} from '../calendar.model';
import { defaults, pickModes } from '../config';
import { DEFAULT_CALENDAR_OPTIONS } from './calendar-options.provider';

const isBoolean = (input: any) => input === true || input === false;

@Injectable()
export class CalendarService {
  private readonly defaultOpts: CalendarModalOptions;

  constructor(@Optional() @Inject(DEFAULT_CALENDAR_OPTIONS) defaultOpts: CalendarModalOptions) {
    this.defaultOpts = defaultOpts;
  }

  get DEFAULT_STEP() {
    return 12;
  }

  safeOpt(calendarOptions: any = {}): CalendarModalOptions {
    const _disableWeeks: number[] = [];
    const _daysConfig: DayConfig[] = [];
    let {
      from = new Date(),
      to = 0,
      weekStart = 0,
      step = this.DEFAULT_STEP,
      id = '',
      cssClass = '',
      closeLabel = 'CANCEL',
      doneLabel = 'DONE',
      monthFormat = 'MMM YYYY',
      title = 'CALENDAR',
      defaultTitle = '',
      defaultSubtitle = '',
      autoDone = false,
      canBackwardsSelected = false,
      closeIcon = false,
      doneIcon = false,
      showYearPicker = false,
      isSaveHistory = false,
      pickMode = pickModes.SINGLE,
      color = defaults.COLOR,
      weekdays = defaults.WEEKS_FORMAT,
      daysConfig = _daysConfig,
      disableWeeks = _disableWeeks,
      showAdjacentMonthDay = true,
      defaultEndDateToStartDate = false,
    } = { ...this.defaultOpts, ...calendarOptions };

    return {
      id,
      from,
      to,
      pickMode,
      autoDone,
      color,
      cssClass,
      weekStart,
      closeLabel,
      closeIcon,
      doneLabel,
      doneIcon,
      canBackwardsSelected,
      isSaveHistory,
      disableWeeks,
      monthFormat,
      title,
      weekdays,
      daysConfig,
      step,
      showYearPicker,
      defaultTitle,
      defaultSubtitle,
      defaultScrollTo: calendarOptions.defaultScrollTo || from,
      defaultDate: calendarOptions.defaultDate || null,
      defaultDates: calendarOptions.defaultDates || null,
      defaultDateRange: calendarOptions.defaultDateRange || null,
      showAdjacentMonthDay,
      defaultEndDateToStartDate
    };
  }

  createOriginalCalendar(time: number): CalendarOriginal {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstWeek = new Date(year, month, 1).getDay();
    const howManyDays = getDaysInMonth(time);
    return {
      year,
      month,
      firstWeek,
      howManyDays,
      time: new Date(year, month, 1).getTime(),
      date: new Date(time),
    };
  }

  findDayConfig(day: any, opt: CalendarModalOptions): any {
    if (opt.daysConfig.length <= 0) return null;
    return opt.daysConfig.find(n => day.isSame(n.date, 'day'));
  }

  createCalendarDay(time: number, opt: CalendarModalOptions, month?: number): CalendarDay {
    let _time = getTime(time);
    let date = getTime(time);
    let isToday = isSameDay(new Date(), _time);
    let dayConfig = this.findDayConfig(_time, opt);
    let _rangeBeg = getTime(opt.from).valueOf();
    let _rangeEnd = getTime(opt.to).valueOf();
    let isBetween = true;
    let disableWee = opt.disableWeeks.indexOf(toDate(_time).getDay()) !== -1;

    if (_rangeBeg > 0 && _rangeEnd > 0) {
      if (!opt.canBackwardsSelected) {      
        isBetween = !isWithinInterval(_time, {start: _rangeBeg, end: _rangeEnd});

        //Select today date as default date
        if(isToday)
        {
          isBetween = false;
        }
      } else {
        isBetween = isBefore(_time,_rangeBeg) ? false : isBetween;
      }
    } else if (_rangeBeg > 0 && _rangeEnd === 0) {
      if (!opt.canBackwardsSelected) {
        let _addTime = addDays(_time, 1);
        isBetween = !isAfter(_addTime, _rangeBeg);
      } else {
        isBetween = false;
      }
    }

    let _disable = false;

    if (dayConfig && isBoolean(dayConfig.disable)) {
      _disable = dayConfig.disable;
    } else {
      _disable = disableWee || isBetween;
    }

    let title = new Date(time).getDate().toString();
    if (dayConfig && dayConfig.title) {
      title = dayConfig.title;
    } else if (opt.defaultTitle) {
      title = opt.defaultTitle;
    }
    let subTitle = '';
    if (dayConfig && dayConfig.subTitle) {
      subTitle = dayConfig.subTitle;
    } else if (opt.defaultSubtitle) {
      subTitle = opt.defaultSubtitle;
    }

    return {
      time,
      isToday,
      title,
      subTitle,
      selected: false,
      isLastMonth: getMonth(date) < month,
      isNextMonth: getMonth(date) > month,
      marked: dayConfig ? dayConfig.marked || false : false,
      cssClass: dayConfig ? dayConfig.cssClass || '' : '',
      disable: _disable,
      isFirst: getDate(date) === 1,
      isLast: getDate(date) === getDaysInMonth(date),
    };

  }

  createCalendarMonth(original: CalendarOriginal, opt: CalendarModalOptions): CalendarMonth {
    let days: Array<CalendarDay> = new Array(6).fill(null);
    let len = original.howManyDays;
    for (let dayItem = original.firstWeek; dayItem < len + original.firstWeek; dayItem++) {
      let itemTime = new Date(original.year, original.month, dayItem - original.firstWeek + 1).getTime();
      days[dayItem] = this.createCalendarDay(itemTime, opt);
    }

    let weekStart = opt.weekStart;

    if (weekStart === 1) {
      if (days[0] === null) {
        days.shift();
      } else {
        days.unshift(...new Array(6).fill(null));
      }
    }

    if (opt.showAdjacentMonthDay) {
      const _booleanMap = days.map(e => !!e);
      const thisMonth = getMonth(original.time);
      let startOffsetIndex = _booleanMap.indexOf(true) - 1;
      let endOffsetIndex = _booleanMap.lastIndexOf(true) + 1;
      for (startOffsetIndex; startOffsetIndex >= 0; startOffsetIndex--) {
        const dayBefore = subDays(days[startOffsetIndex + 1].time, 1);
        days[startOffsetIndex] = this.createCalendarDay(dayBefore.valueOf(), opt, thisMonth);
      }

      if (!(_booleanMap.length % 7 === 0 && _booleanMap[_booleanMap.length - 1])) {
        for (endOffsetIndex; endOffsetIndex < days.length + (endOffsetIndex % 7); endOffsetIndex++) {
          const dayAfter = addDays(days[endOffsetIndex - 1].time, 1);
          days[endOffsetIndex] = this.createCalendarDay(dayAfter.valueOf(), opt, thisMonth);
        }
      }
    }

    return {
      days,
      original: original,
    };
  }

  createMonthsByPeriod(startTime: number, monthsNum: number, opt: CalendarModalOptions): Array<CalendarMonth> {
    let _array: Array<CalendarMonth> = [];

    let _start = new Date(startTime);
    let _startMonth = new Date(_start.getFullYear(), _start.getMonth(), 1).getTime();
    for (let month = 0; month < monthsNum; month++) {
      let time = addMonths(_startMonth, month).valueOf();
      let originalCalendar = this.createOriginalCalendar(time);
      _array.push(this.createCalendarMonth(originalCalendar, opt));
    }

    return _array;
  }

  wrapResult(original: CalendarDay[], pickMode: string) {
    let result: any;
    switch (pickMode) {
      case pickModes.SINGLE:
        result = this.multiFormat(original[0].time);
        break;
      case pickModes.RANGE:
        result = {
          from: this.multiFormat(original[0].time),
          to: this.multiFormat((original[1] || original[0]).time),
        };
        break;
      case pickModes.MULTI:
        result = original.map(e => this.multiFormat(e.time));
        break;
      default:
        result = original;
    }
    return result;
  }

  multiFormat(time: number): CalendarResult {
    const _datefns = getTime(time);
    return {
      time: _datefns.valueOf(),
      unix: getUnixTime(_datefns),
      dateObj: toDate(_datefns),
      string: format(_datefns, defaults.DATE_FORMAT),
      years: getYear(_datefns),
      months: getMonth(_datefns) + 1,
      date: getDate(_datefns),
    };
  }
}
