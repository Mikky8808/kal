import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { SessionService } from 'projects/@session/src/lib/session.service';
import { catchError, finalize, map, tap } from 'rxjs/operators';

@Injectable()
export class OutInterceptor implements HttpInterceptor {
  constructor(public sessionService: SessionService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.sessionService.isLoading$.next(true);
    request = request.clone({
      setHeaders: {
        'X-Requested-With': 'XMLHttpRequest',
        Kalani: 'v1.00',
      },
    });
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        this.sessionService.isLoading$.next(false);

        if (error.status == 401) {
          this.sessionService.Authenticated = false;
          location.reload();
        }

        return throwError(() => {
          return error;
        });
      }),
      finalize(() => {
        this.sessionService.isLoading$.next(false);
      })
    );
  }
}
