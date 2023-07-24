import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { JwtHelper } from "src/helpers/jwt.helper";

@Injectable()
export class UserGuard implements CanActivate {
  
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const client = context.switchToWs().getClient();
      const authorization = client.handshake.headers.authorization;
      if(!authorization) {
        return false
      }
      const verification = JwtHelper.verify(authorization);
      if(verification) {
        // cannot verify
        context.switchToWs().getData().id = verification.id
        return true;
      } 
      return false;
    } catch(e) {
      return false;
    }   
  }
}