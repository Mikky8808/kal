import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';
import { SessionService } from 'projects/@session/src/lib/session.service';

@Injectable()
export class OutInterceptor implements HttpInterceptor {
  constructor(public sessionService: SessionService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.sessionService.isLoading.next(true);
    request = request.clone({
      setHeaders: {
        'X-Requested-With': 'XMLHttpRequest',
        Kalani: 'v1.00',
        Authorization: 'Bearer ' + this.sessionService.getToken(),
      },
    });

    return next.handle(request).pipe(
      finalize(() => {
        this.sessionService.isLoading.next(false);
      })
    );
  }
}
