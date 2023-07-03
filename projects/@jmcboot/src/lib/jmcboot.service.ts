import { Injectable, NgZone } from '@angular/core';
import { APP_INITIALIZER, Provider } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { lastValueFrom } from 'rxjs';
import { BarcodereaderService } from 'projects/@session/src/lib/barcodereader.service';
import { ErrormessageService } from 'projects/@session/src/lib/errormessage.service';

export interface Config {
  Authenticated?: boolean;
  bootdata: any;
}

@Injectable({
  providedIn: 'root',
})
export class JmcbootService {
  public config?: Config | null;

  constructor(
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    private barCodeReader: BarcodereaderService,
  ) {}

  public async loadConfig(apiFunc='auth'): Promise<void> {
    const data$ = this.http.get<Config>('/api/'+apiFunc);

    try {
      this.config = await lastValueFrom(data$);
      if (this.config?.Authenticated) {
        console.log(this.config);
        this.barCodeReader.connectBarCodeReader();
      }
    } catch (error: any) {
      this._snackBar.open(error.message, 'action', {
        duration: 162000,
      });
      // NOTE: Throwing this error will prevent the application from bootstrapping.
      throw error;
    }
  }
}
// export var JMC_INITIALIZER: Provider[] = [
//   {
//     provide: APP_INITIALIZER,
//     useFactory: function (appInitializer: JmcbootService) {
//       return function (): Promise<void> {
//         // The application will "block" until this promise is resolved.
//         return appInitializer.loadConfig();
//       };
//     },
//     deps: [JmcbootService],
//     multi: true,
//   },
// ];
