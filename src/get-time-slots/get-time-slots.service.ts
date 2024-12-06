import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { DayTimetable, Timeslot } from './dto/response.dto';
import { DayTimetableQueryDto } from './dto/request.dto';

import workhours from '../data/workhours.json';
import events from '../data/events.json';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class GetTimeSlotsService {
  async getDayTimeTable(query: DayTimetableQueryDto) {}
}
