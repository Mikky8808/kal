import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { JmcbootService } from 'projects/@jmcboot/src/lib/jmcboot.service';
@Injectable({
  providedIn: 'root',
})
export class SessionServiceConfig {
  constructor(
    public boot: JmcbootService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}
  // durationInSeconds = 35;



 
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
  get paymentmethodtypes() {
    return this.boot.config?.bootdata?.paymentmethodtypes;
  }
  get pointearntypes() {
    return this.boot.config?.bootdata?.pointearntypes;
  }
  get PTStaff() {
    return this.boot.config?.bootdata?.PTStaff;
  }
  set bootdata(val: any) {
    this.boot.config!.bootdata = val;
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

  get membertypes() {
    return this.boot.config?.bootdata.membertypes;
  }
  get allusers() {
    return this.boot.config?.bootdata.users;
  }

}
