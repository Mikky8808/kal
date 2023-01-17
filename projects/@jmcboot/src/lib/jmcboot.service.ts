import { Injectable } from '@angular/core';
import { APP_INITIALIZER, Provider } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import {lastValueFrom} from 'rxjs'

export interface Config {
  Authenticated?: boolean;
  bootdata: any;
}

@Injectable({
  providedIn: 'root',
})
export class JmcbootService {
  public config?: Config | null;

  constructor(private http: HttpClient, private _snackBar: MatSnackBar) {}

  public async loadConfig(): Promise<void> {
    const data$ = this.http.post<Config>('/krides/auth/ridesboot', {
      token: localStorage.getItem('token'),
    });
    
    try {
    this.config = await lastValueFrom(data$);

      console.group('Configuration Loaded');
      console.log(this.config);
      console.groupEnd();
    } catch (error : any) {
      console.group('Configuration Failed');
      console.error(error);
      console.groupEnd();
      this._snackBar.open(error.message, 'action', {
        duration: 162000,
      });
      // NOTE: Throwing this error will prevent the application from bootstrapping.
      throw error;
    }
  }
}
export var JMC_INITIALIZER: Provider[] = [
  {
    provide: APP_INITIALIZER,
    useFactory: function (appInitializer: JmcbootService) {
      return function (): Promise<void> {
        // The application will "block" until this promise is resolved.
        return appInitializer.loadConfig();
      };
    },
    deps: [JmcbootService],
    multi: true,
  },
];
