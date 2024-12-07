import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class DayTimetableQueryDto {
  @IsString()
  start_day_identifier: string;

  @IsString()
  timezone_identifier: string;

  @IsInt()
  service_duration: number;

  @IsOptional()
  @IsInt()
  days?: number = 1;

  @IsOptional()
  @IsInt()
  timeslot_interval?: number = 1800;

  @IsOptional()
  @IsBoolean()
  is_ignore_schedule?: boolean = false;

  @IsOptional()
  @IsBoolean()
  is_ignore_workhour?: boolean = false;
}
