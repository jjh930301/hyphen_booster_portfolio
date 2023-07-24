import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const client = context.switchToWs().getClient();
      const authorization = client.handshake.headers.authorization;
      if(`Bearer ${process.env.HYPHEN_ACCESS_TOKEN}` === authorization) {
        context.switchToWs().getData().access = true
        return true
      }
      return false
    } catch(e) {
      console.log(e);
      return false;
    }
  }
}
