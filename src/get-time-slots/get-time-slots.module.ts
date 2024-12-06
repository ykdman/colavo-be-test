import { Module } from '@nestjs/common';
import { GetTimeSlotsService } from './get-time-slots.service';
import { GetTimeSlotsController } from './get-time-slots.controller';

@Module({
  controllers: [GetTimeSlotsController],
  providers: [GetTimeSlotsService],
})
export class GetTimeSlotsModule {}
