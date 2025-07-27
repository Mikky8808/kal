import { Injectable } from '@angular/core';
import {
  HttpInterceptor, HttpRequest, HttpHandler, HttpEvent
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoggingService } from './logging.service';

@Injectable()
export class HttpLoggerInterceptor implements HttpInterceptor {
  constructor(private logger: LoggingService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.logger.log('HTTP Request', req);

    return next.handle(req).pipe(
      tap(event => {
        this.logger.log('HTTP Response', event);
      })
    );
  }
}