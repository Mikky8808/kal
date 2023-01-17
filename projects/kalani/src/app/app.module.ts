import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JMC_INITIALIZER } from 'projects/@jmcboot/src/lib/jmcboot.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {OutInterceptor} from 'projects/@jmcintercept/src/lib/out.interceptor'
 import { MaterialModule } from 'projects/@vendors/src/public-api';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
     MaterialModule,
    HttpClientModule,
    BrowserAnimationsModule
  ],
  providers: [JMC_INITIALIZER,
    { provide: HTTP_INTERCEPTORS, useClass: OutInterceptor, multi: true },],
  bootstrap: [AppComponent]
})
export class AppModule { }
