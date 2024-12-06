import { Controller } from '@nestjs/common';
import { GetTimeSlotsService } from './get-time-slots.service';

@Controller('getTimeSlots')
export class GetTimeSlotsController {
  constructor(private readonly getTimeSlotsService: GetTimeSlotsService) {}
}
