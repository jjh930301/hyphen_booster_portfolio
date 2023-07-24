import { Controller, Get, Res } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { 
  HealthCheck, 
  HealthCheckService, 
  HttpHealthIndicator, 
  TypeOrmHealthIndicator
} from '@nestjs/terminus';

@Controller("health")
export class HealthController {
  constructor(
    private readonly health : HealthCheckService,
    private readonly http : HttpHealthIndicator,
    private readonly mysql : TypeOrmHealthIndicator
  ) {}
  @Get("check")
  @HealthCheck()
  @ApiOperation({
    summary : "check"
  })
  check() {
    return this.health.check([
      async () => this.mysql.pingCheck('database')
    ])
  }
}