import { Body, Controller, Post } from '@nestjs/common';
import { GetTimeSlotsService } from './get-time-slots.service';
import { DayTimetableQueryDto } from './dto/request.dto';

@Controller('getTimeSlots')
export class GetTimeSlotsController {
  constructor(private readonly getTimeSlotsService: GetTimeSlotsService) {}

  @Post()
  async getDayTimeTable(@Body() body: DayTimetableQueryDto) {
    return await this.getTimeSlotsService.getDayTimeTable(body);
  }
}
