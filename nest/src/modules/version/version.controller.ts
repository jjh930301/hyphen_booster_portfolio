import { Controller, Get, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiRes } from 'src/models';
import { VersionService } from './version.service';

@ApiTags('version')
@Controller()
export class VersionController {
  constructor(
    private readonly versionSvc : VersionService
  ){}
  
  @ApiOperation({
    summary : 'version',
  })
  @ApiResponse({
    description : `version: "1.3.4"`
  })
  @Get()
  async version(
    @Res() res
  ) {
    try {
      const serviceData = await this.versionSvc.version()
      return serviceData.apiResponse(res).send();
    } catch(e) {
      return ApiRes._500(res , e.toString());
    }
  }
}
