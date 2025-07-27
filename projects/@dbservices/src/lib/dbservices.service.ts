import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from 'projects/@session/src/lib/notification.service';

@Injectable({
  providedIn: 'root',
})
export class DbservicesService {
  constructor(private http: HttpClient, private notification: NotificationService) {}

  loginKalani(data: any): Observable<any> {
    return this.http.post('/api/auth/login', data);
  }

  logoff(): Observable<any> {
    return this.http.get('/api/logoff');
  }

  getAllMembers(data = { membertype: '' }): Observable<any> {
    return this.http.post('api/members/getAllMembers', data);
  }

  getMemberQV(data: any): Observable<any> {
    return this.http.post('/api/members/getMemberQV', data);
  }

  getMember(data: any): Observable<any> {
    return this.http.post('/api/members/getMember', data);
  }

  saveMember(data: any): Observable<any> {
    return this.http.post('/api/members/saveMember', data);
  }

  checkInMember(data: any): Observable<any> {
    return this.http.post('/api/members/checkInMember', data);
  }

  memberdelete(data: any) {
  return this.http.post('/backend/member_delete.php', data);
}


  directsubmit(data: { id: number, status: number, coverage: string }): Observable<any> {
  return this.http.post('/backend/accum.php', data);
}


  directMemberCheckIn(data: any): Observable<any> {
    return this.http.post('/backend/membercheckin.php', data);
  }

  deleteCheckInMember(data: any): Observable<any> {
    return this.http.post('/api/members/deleteCheckInMember', data);
  }

  getAllcheckInMembers(data: any): Observable<any> {
    return this.http.post('/api/members/getAllcheckInMembers', data);
  }

  uploadMemberPic(data: any): Observable<any> {
    return this.http.post('/api/members/uploadMemberPic', data, {
      reportProgress: true,
      observe: 'events',
    });
  }
memberLogin(data: any): Observable<any> {
    // Update the URL if your PHP API is elsewhere
    return this.http.post('/app/member-login.php', data);
  }
  // RIDES
  getDayTrips(data: any): Observable<any> {
    return this.http.post('/api/rides/getDayTrips', data);
  }

  getTrip(data: any): Observable<any> {
    return this.http.post('/api/rides/getTrip', data);
  }

  assignDriver(data: any): Observable<any> {
    return this.http.post('/api/rides/assignDriver', data);
  }

  getAllRidesCal(data: any): Observable<any> {
    return this.http.post('/api/rides/getAllRidesCal', data);
  }

 createRideAppt(data: any): Observable<any> {
  return this.http.post('/api/rides/createRideAppt', data).pipe(
    catchError((error) => {
      const status = error?.status;
      const message = error?.error?.message || 'Something went wrong during ride creation';

      if (status === 409) {
        this.notification.notify(message); // Conflict message
        return of({ conflict: true, message }); // Return harmless observable
      }

      // For other errors, still throw
      this.notification.notify('Unexpected error occurred');
      return throwError(() => error);
    })
  );
}


  updateRideAppt(data: any): Observable<any> {
    return this.http.post('/api/rides/updateRideAppt', data);
  }

  /**
   * Update only the date and time of a Ride appointment (direct public backend, PHP)
   */
  deletingrides(data: any): Observable<any> {
    return this.http.post('/backend/rides.php', data);
  }

  // PT Appointment
  createPTAppt(data: any): Observable<any> {
    return this.http.post('/api/Ptappts/createPTAppt', data);
  }

  getPTAppt(data: any): Observable<any> {
    return this.http.post('/api/Ptappts/getPTAppt', data);
  }

  updatePTApptStatus(data: any): Observable<any> {
    return this.http.post('/api/Ptappts/updatePTApptStatus', data);
  }

  updatePTAppt(data: any): Observable<any> {
    return this.http.post('/api/Ptappts/updatePTAppt', data);
  }

  deletePTAppt(data: any): Observable<any> {
    return this.http.post('/api/Ptappts/deletePTAppt', data);
  }

  getAllPTAppt(data: any): Observable<any> {
    return this.http.post('/api/Ptappts/getAllPTAppt', data);
  }

  getMemberApptForPrint(data: any): Observable<any> {
    return this.http.post('/api/Ptappts/getMemberApptForPrint', data);
  }

  /**
   * Update only the date and time of a PT appointment
   */
  updatePTApptDateTimeOnly(data: any): Observable<any> {
    return this.http.post('/backend/pt.php', data);
  }

memberMarkDeceased(data: { memberId: number }) {
    // Replace the URL and HTTP method as appropriate for your backend
    return this.http.post('/backend/markdeceased.php', data);
  }

  // Acupuncture/Massage
  getAccuMassageAppt(data: any): Observable<any> {
    return this.http.post('/api/AccuMassage/getPTAppt', data);
  }

  getAllAccuMassageAppt(data: any): Observable<any> {
    return this.http.post('/api/AccuMassage/getAllPTAppt', data);
  }

  saveAccuMassageAppt(data: any): Observable<any> {
    return this.http.post('/api/AccuMassage/saveAppt', data);
  }

  DeleteAccuMassageAppt(data: any): Observable<any> {
    return this.http.post('/api/AccuMassage/DeleteAppt', data);
  }

  /**
   * Update only the date and time of an Accu/Massage appointment
   */
  updateAccuMassageApptDateTimeOnly(data: any): Observable<any> {
    return this.http.post('/backend/accumassage.php', data);
  }

  // Lunch
  getAllLunchAppt(data: any): Observable<any> {
    return this.http.post('/api/lunch/getAll', data);
  }

  createLunchTypes(data: any): Observable<any> {
    return this.http.post('/api/lunch/createLunchTypes', data);
  }

  getLunch(data: any): Observable<any> {
    return this.http.post('/api/lunch/Get', data);
  }

  createLunchAppt(data: any): Observable<any> {
    return this.http.post('/api/lunch/Insert', data);
  }

  saveLunchAppt(data: any): Observable<any> {
    return this.http.post('/api/lunch/Save', data);
  }

  deleteLunchAppt(data: any): Observable<any> {
    return this.http.post('/api/lunch/Delete', data);
  }

  // Points
  getAllPointTrans(data: any): Observable<any> {
    return this.http.post('/api/points/getAllPointTrans', data);
  }

  savePointTrans(data: any): Observable<any> {
    return this.http.post('/api/points/Save', data);
  }

  deletePointTrans(data: any): Observable<any> {
    return this.http.post('/api/points/Delete', data);
  }

  saveVehodometer(data: any): Observable<any> {
    return this.http.post('/api/Vehicles/Save', data);
  }

  getLastVehodometer(data: any): Observable<any> {
    return this.http.post('/api/Vehicles/getLastVehodometer', data);
  }

  getVehodometer(data: any): Observable<any> {
    return this.http.post('/api/Vehicles/getVehodometer', data);
  }

  getci_sessions(data: any): Observable<any> {
    return this.http.post('/api/admin/getci_sessions', data);
  }

  getUserList(data: any): Observable<any> {
    return this.http.post('/api/admin/getUserList', data);
  }

  UpdateUser(data: any): Observable<any> {
    return this.http.post('/api/admin/UpdateUser', data);
  }

  DeleteUser(data: any): Observable<any> {
    return this.http.post('/api/admin/DeleteUser', data);
  }

  smsQuickSend(data: any): Observable<any> {
    return this.http.post('/api/sms/quickSend', data);
  }
}
