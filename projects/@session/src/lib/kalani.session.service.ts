import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { JmcbootService } from 'projects/@jmcboot/src/lib/jmcboot.service';
import { ErrormessageService } from './errormessage.service';
import { NotificationService } from './notification.service';
@Injectable({
  providedIn: 'root',
})
export class KalaniSessionService {
  constructor(
    public boot: JmcbootService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private _showerror: ErrormessageService,
    private notification: NotificationService
  ) {}
  // durationInSeconds = 35;

  public QVMember$ = new Subject<any>();

  public isLoading$: Subject<boolean> = new Subject<boolean>();

  get Authenticated() {
    return this.boot.config?.Authenticated;
  }
  set Authenticated(val) {
    this.boot.config!.Authenticated = val;
  }
  set bootdata(val: any) {
    this.boot.config!.bootdata = val;
  }
  get currentUser() {
    return this.boot.config?.bootdata?.user;
  }
  get Drivers() {
    return this.boot.config?.bootdata?.drivers;
  }
  get membershiptypes() {
    return this.boot.config?.bootdata?.membershiptypes;
  }
  get insurancetypes() {
    return this.boot.config?.bootdata?.insurancetypes;
  }
  // get paymentmethodtypes() {
  //   return this.boot.config?.bootdata?.paymentmethodtypes;
  // }
  // get pointRedeemTypes() {
  //   return this.boot.config?.bootdata?.pointredeemtypes;
  // }
 // get pointearntypes() {
  //   return this.boot.config?.bootdata?.pointearntypes;
  // }
  get pointMethods() {
    return this.boot.config?.bootdata?.pointMethods;
  }
  
  get PTStaff() {
    return this.boot.config?.bootdata?.PTStaff;
  }

  get getRideStatus() {
    return this.boot.config?.bootdata.RideStatus;
  }
  get getptStatus() {
    return this.boot.config?.bootdata.ptStatus;
  }
  get ptReasons() {
    return this.boot.config?.bootdata.ptReasons;
  }
  get getlunchstatus() {
    return this.boot.config?.bootdata.lunchstatus;
  }
  get tripreasons() {
    return this.boot.config?.bootdata.tripreasons;
  }
  get membertypes() {
    return this.boot.config?.bootdata.membertypes;
  }
  get allusers() {
    return this.boot.config?.bootdata.users;
  }
get vehicles (){
  return this.boot.config?.bootdata.vehicles;
}
  getToken() {
    return localStorage.getItem('token');
  }
  showErrorMsg(error: any) {
    this._showerror.showErrorMsg(error);
  }
  notify(msg: string) {
    this.notification.notify(msg);
  }
}
