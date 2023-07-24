import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Holiday } from 'src/entities/booster/holiday.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HolidayProvider {
  static models = [
    Holiday
  ]
  constructor(
    @InjectRepository(Holiday)
    private readonly holidayRepo : Repository<Holiday>
  ) {}
}
