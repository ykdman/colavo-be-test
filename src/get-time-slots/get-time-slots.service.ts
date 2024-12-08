import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { DayTimetable, Timeslot } from './dto/response.dto';
import { DayTimetableQueryDto } from './dto/request.dto';
import { Event, Workhour } from './interfaces/timeslot.interface';
import { loadJson } from './utils/file.util';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class GetTimeSlotsService {
  async getDayTimeTable(query: DayTimetableQueryDto): Promise<DayTimetable[]> {
    const { start_day_identifier, timezone_identifier, days } = query;

    const startDay = dayjs(start_day_identifier, 'YYYYMMDD').tz(
      timezone_identifier,
    );
    const workhoursData: Workhour[] = loadJson<Workhour[]>(
      'src/data/workhours.json',
    );
    const eventsData: Event[] = loadJson<Event[]>('src/data/events.json');

    const timeTables: DayTimetable[] = [];

    for (let i = 0; i < days; i++) {
      const currentDay = startDay.add(i, 'day');
      const workDay = currentDay.day() || 1;
      const workhour = workhoursData.find((wh) => wh.weekday === workDay);

      timeTables.push(
        this.generateDayTimetable(currentDay, workhour, eventsData, query),
      );
    }

    return timeTables;
  }

  private generateDayTimetable(
    day: dayjs.Dayjs,
    workhour: Workhour | undefined,
    events: Event[],
    query: DayTimetableQueryDto,
  ): DayTimetable {
    const {
      service_duration,
      timeslot_interval,
      is_ignore_schedule,
      is_ignore_workhour,
    } = query;

    const startOfDay = day.startOf('day').unix();
    const isDayOff = workhour?.is_day_off || false;
    const timeslots: Timeslot[] = [];

    const timeInfo = {
      totalOpenTime: startOfDay,
      totalCloseTime: startOfDay + 86400,
      workOpenTime: startOfDay + (workhour?.open_interval || 0),
      workCloseTime: startOfDay + (workhour?.close_interval || 86400),
    };

    for (
      let slot = timeInfo.totalOpenTime;
      slot + service_duration <= timeInfo.totalCloseTime;
      slot += timeslot_interval
    ) {
      if (
        this.shouldCreateTimeslot(
          slot,
          timeInfo,
          is_ignore_schedule,
          is_ignore_workhour,
          events,
          service_duration,
        )
      ) {
        timeslots.push({ begin_at: slot, end_at: slot + service_duration });
      }
    }

    return {
      start_of_day: startOfDay,
      day_modifier: day.diff(
        dayjs(query.start_day_identifier, 'YYYYMMDD'),
        'day',
      ),
      is_day_off: isDayOff,
      timeslots,
    };
  }

  private shouldCreateTimeslot(
    slot: number,
    timeInfo: {
      totalOpenTime: number;
      totalCloseTime: number;
      workOpenTime: number;
      workCloseTime: number;
    },
    is_ignore_schedule: boolean,
    is_ignore_workhour: boolean,
    events: Event[],
    service_duration: number,
  ): boolean {
    if (is_ignore_schedule && is_ignore_workhour) {
      return true;
    } else if (is_ignore_schedule && !is_ignore_workhour) {
      return slot < timeInfo.workOpenTime || slot > timeInfo.workCloseTime;
    } else if (!is_ignore_schedule && is_ignore_workhour) {
      return !this.isEventExist(slot, slot + service_duration, events);
    } else {
      return (
        (slot < timeInfo.workOpenTime || slot > timeInfo.workCloseTime) &&
        !this.isEventExist(slot, slot + service_duration, events)
      );
    }
  }

  private isEventExist(
    beginAt: number,
    endAt: number,
    events: Event[],
  ): boolean {
    return events.some(
      (event) => event.begin_at <= beginAt && event.end_at >= endAt,
    );
  }
}
