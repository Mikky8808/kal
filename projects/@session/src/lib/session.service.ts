import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { JmcbootService } from 'projects/@jmcboot/src/lib/jmcboot.service';
@Injectable({
  providedIn: 'root',
})
export class SessionService {
  constructor(public boot: JmcbootService) { }

  public isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  get Authenticated() {
    return this.boot.config?.Authenticated;
  }
  set Authenticated(val) {
    this.boot.config!.Authenticated = val;
  }
  set bootdata(val:any) {
    this.boot.config!.bootdata = val;
  }
  getRideStatus() {
    return this.boot.config?.bootdata.RideStatus;
  }
  get currentuser() {
    return this.boot.config?.bootdata.user;
  }
  get allusers() {
    return this.boot.config?.bootdata.users;
  }
  get AllRiders() {
    return this.boot.config?.bootdata.Riders;
  }
  set AllRiders(val) {
    this.boot.config!.bootdata.Riders.length = 0;
    val.map((rec:any) => {
      this.boot.config?.bootdata.Riders.push(rec);
    });
  }
  getToken() {
    return localStorage.getItem('token');
  }
  Logout() {
    console.log('logout');
  }
}
