import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class OwnerPasswordInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((wishlistObj) => {
        if (Array.isArray(wishlistObj)) {
          wishlistObj.forEach((element) => {
            delete element.owner.password;
          });
        } else {
          delete wishlistObj.owner.password;
        }

        return wishlistObj;
      }),
    );
  }
}
