import { IsBoolean, IsInt } from 'class-validator';

export class DayTimetable {
  @IsInt()
  start_of_day: number;

  @IsInt()
  day_modifier: number;

  @IsBoolean()
  is_day_off: boolean;

  timeslots: Timeslot[];
}

export class Timeslot {
  @IsInt()
  begin_at: number;

  @IsInt()
  end_at: number;
}
