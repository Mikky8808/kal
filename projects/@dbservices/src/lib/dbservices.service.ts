import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DbservicesService {
  constructor(private http: HttpClient) {}

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
  getAllRidesCal(data: any) {
    return this.http.post('/api/rides/getAllRidesCal', data);
  }
  createRideAppt(data: any) {
    return this.http.post('/api/rides/createRideAppt', data);
  }
  updateRideAppt(data: any) {
    return this.http.post('/api/rides/updateRideAppt', data);
  }

  //PT Appointment
  createPTAppt(data: any) {
    return this.http.post('/api/Ptappts/createPTAppt', data);
  }
  getPTAppt(data: any) {
    return this.http.post('/api/Ptappts/getPTAppt', data);
  }
  updatePTApptStatus(data: any) {
    return this.http.post('/api/Ptappts/updatePTApptStatus', data);
  }
  updatePTAppt(data: any) {
    return this.http.post('/api/Ptappts/updatePTAppt', data);
  }
  deletePTAppt(data: any) {
    return this.http.post('/api/Ptappts/deletePTAppt', data);
  }

  getAllPTAppt(data: any) {
    return this.http.post('/api/Ptappts/getAllPTAppt', data);
  }

  getMemberApptForPrint(data: any) {
    return this.http.post('/api/Ptappts/getMemberApptForPrint', data);
  }
  // Accupuncture/Massage
  getAccuMassageAppt(data: any) {
    return this.http.post('/api/AccuMassage/getPTAppt', data);
  }
  getAllAccuMassageAppt(data: any) {
    return this.http.post('/api/AccuMassage/getAllPTAppt', data);
  }
  saveAccuMassageAppt(data: any) {
    return this.http.post('/api/AccuMassage/saveAppt', data);
  }
  DeleteAccuMassageAppt(data: any) {
    return this.http.post('/api/AccuMassage/DeleteAppt', data);
  }

  // Lunch

  getAllLunchAppt(data: any) {
    return this.http.post('/api/lunch/getAll', data);
  }

  createLunchTypes(data: any) {
    return this.http.post('/api/lunch/createLunchTypes', data);
  }
  getLunch(data: any) {
    return this.http.post('/api/lunch/Get', data);
  }

  createLunchAppt(data: any) {
    return this.http.post('/api/lunch/Insert', data);
  }

  saveLunchAppt(data: any) {
    return this.http.post('/api/lunch/Save', data);
  }
  deleteLunchAppt(data: any) {
    return this.http.post('/api/lunch/Delete', data);
  }

  //Points
  getAllPointTrans(data: any) {
    return this.http.post('/api/points/getAllPointTrans', data);
  }
  savePointTrans(data: any) {
    return this.http.post('/api/points/Save', data);
  }
  deletePointTrans(data: any) {
    return this.http.post('/api/points/Delete', data);
  }

  saveVehodometer(data: any) {
    return this.http.post('/api/Vehicles/Save', data);
  }

  getLastVehodometer(data: any) {
    return this.http.post('/api/Vehicles/getLastVehodometer', data);
  }
  getVehodometer(data: any) {
    return this.http.post('/api/Vehicles/getVehodometer', data);
  }

  
  getci_sessions(data: any) {
    return this.http.post('/api/admin/getci_sessions', data);
  }
  getUserList(data: any) {
    return this.http.post('/api/admin/getUserList', data);
  }
  UpdateUser(data: any) {
    return this.http.post('/api/admin/UpdateUser', data);
  }
  

  smsQuickSend(data: any) {
    return this.http.post('/api/sms/quickSend', data);
  }
}
