import { NgModule ,APP_INITIALIZER} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import {  JmcbootService } from 'projects/@jmcboot/src/lib/jmcboot.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { OutInterceptor } from 'projects/@jmcintercept/src/lib/out.interceptor';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { HomeComponent } from './home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HomeComponent,
    HttpClientModule,
    MatSnackBarModule,
    MatDialogModule,
    BrowserAnimationsModule

  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: function (appInitializer: JmcbootService) {
        return function (): Promise<void> {
          // The application will "block" until this promise is resolved.
          return appInitializer.loadConfig('auth');
        };
      },
      deps: [JmcbootService],
      multi: true,
    },

    { provide: HTTP_INTERCEPTORS, useClass: OutInterceptor, multi: true },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' },
    },
  ],  bootstrap: [AppComponent]
})
export class AppModule { }
