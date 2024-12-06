import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GetTimeSlotsModule } from './get-time-slots/get-time-slots.module';

@Module({
  imports: [GetTimeSlotsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
