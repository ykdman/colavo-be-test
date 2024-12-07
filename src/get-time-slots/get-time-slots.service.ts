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
      totalOpenTime: startOfDay + 0,
      totalCloseTime: startOfDay + 86400,
      workOpenTime: startOfDay + workhour?.open_interval,
      workCloseTime: startOfDay + workhour?.close_interval,
    };

    for (
      let slot = timeInfo.totalOpenTime;
      slot + service_duration <= timeInfo.totalCloseTime;
      slot += timeslot_interval
    ) {
      if (is_ignore_schedule && is_ignore_workhour) {
        // 기존 이벤트 무시 && 하루 전체에 대한 timeslot 생성
        timeslots.push({
          begin_at: slot,
          end_at: slot + service_duration,
        });
      } else if (is_ignore_schedule && !is_ignore_workhour) {
        // 영업 시작 시간 ~ 영업 종료 시간을 제외한 시간대에 대해서만 timeslot 생성
        if (slot < timeInfo.workOpenTime || slot > timeInfo.workCloseTime) {
          timeslots.push({
            begin_at: slot,
            end_at: slot + service_duration,
          });
        } else {
          continue;
        }
      } else if (!is_ignore_schedule && is_ignore_workhour) {
        // 기존 이벤트 무시 && 영업시작 시간 ~ 영업종료 시간을 제외한 시간대에 대해서 timeslot 생성
        if (!this.isEventExist(slot, slot + service_duration, events)) {
          timeslots.push({
            begin_at: slot,
            end_at: slot + service_duration,
          });
        } else {
          continue;
        }
      } else {
        // 영업시작 시간 ~ 영업 종료 시간을 제외한 시간대에 대해서 timeslot 생성 && 이벤트와 겹치는 시간대는 제외
        if (
          (slot < timeInfo.workOpenTime || slot > timeInfo.workCloseTime) &&
          !this.isEventExist(slot, slot + service_duration, events)
        ) {
          timeslots.push({
            begin_at: slot,
            end_at: slot + service_duration,
          });
        } else {
          continue;
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

  private isEventExist(
    beginAt: number,
    endAt: number,
    events: Event[],
  ): boolean {
    // 이벤트가 존재하는 경우 true, 존재하지 않는 경우 false
    return events.some(
      (event) => event.begin_at <= beginAt && event.end_at >= endAt,
    );
  }
}
