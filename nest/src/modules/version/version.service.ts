import { Injectable } from '@nestjs/common';
import { ServiceData } from 'src/models';
import { VersionProvider } from './version.provider';

@Injectable()
export class VersionService {
  constructor(
    private readonly versionPvd : VersionProvider
  ){}

  public async version() : Promise<ServiceData> {
    try {
      const version = await this.versionPvd.version();
      return ServiceData.ok(
        'Version',
        version,
        2101
      )
    } catch(e) {
      return ServiceData.serverError();
    }
  }
}
