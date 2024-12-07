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
  async getDayTimeTable(query: DayTimetableQueryDto) {
    const { start_day_identifier, timezone_identifier, days } = query;

    const startDay = dayjs(start_day_identifier, 'YYYYMMDD').tz(
      timezone_identifier,
    );
    const workhoursData: Workhour[] = loadJson<Workhour[]>(
      '../../data/workhours.json',
    );
    const eventsData: Event[] = loadJson<Event[]>('../../data/events.json');

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
    const isDayOff = is_ignore_workhour ? false : workhour?.is_day_off || true;
    const timeslots: Timeslot[] = [];

    if (!isDayOff) {
      const openInterval = is_ignore_workhour ? 0 : workhour.open_interval || 0;
      const closeInterval = is_ignore_workhour
        ? 86400
        : workhour.close_interval || 86400;
      const openTime = startOfDay + openInterval;
      const closeTime = startOfDay + closeInterval;

      for (
        let slot = openTime;
        slot + service_duration <= closeTime;
        slot += timeslot_interval
      ) {
        if (
          is_ignore_schedule ||
          !this.isSlotOverlapping(slot, slot + service_duration, events)
        ) {
          timeslots.push({
            begin_at: slot,
            end_at: slot + service_duration,
          });
        }
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

  private isSlotOverlapping(
    beginAt: number,
    endAt: number,
    events: Event[],
  ): boolean {
    return events.some(
      (event) => !(event.end_at <= beginAt || event.begin_at >= endAt),
    );
  }
}
