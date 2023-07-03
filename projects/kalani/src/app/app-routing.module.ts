import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { MemberPointsComponent } from './Members/member-points/member-points.component';
         
const routes: Routes = [
 
  // {
  //   path:'VMTrackDash', component:VMTtrackerDashComponent,

  // },
  // {
  //   path:'memDash', component:MemberPointsComponent
  // },

  // {
  //   path:'memPoints', 
  //   loadComponent: () =>
  //   import('./Members/member-points/member-points.component').then(m => m.MemberPointsComponent)
    
  // },  network_check
  {
    path:'VMTrackDash', 
    loadComponent: () =>
    import('./Rides/vmttracker-dash/vmttracker-dash.component').then(m => m.VMTtrackerDashComponent)
    
  },
  {
    path:'smsQsend', 
    loadComponent: () =>
    import('./sms/sms-quick-send/sms-quick-send.component').then(m => m.SmsQuickSendComponent)
    
  },
  {
    path:'memCheckin/:type', 
    loadComponent: () =>
    import('./Members/member-checkin-dash/member-checkin-dash.component').then(m => m.MemberCheckinDashComponent)
    
  },
  {
    path:'memCheckinHS/:type', 
    loadComponent: () =>
    import('./Members/member-checkin-dash/member-checkin-dash.component').then(m => m.MemberCheckinDashComponent)
    
  },
  {
    path:'lunch', 
    loadComponent: () =>
    import('./kalani/lunch-dash-board/lunch-dash-board.component').then(m => m.LunchDashBoardComponent)
    
  },
  {
    path:'accumassage', 
    loadComponent: () =>
    import('./kalani/accu-massage-appts/accu-massage-appts.component').then(m => m.AccuMassageApptsComponent)
    
  },
  {
    path:'scheduleRide', 
    loadComponent: () =>
    import('./Rides/trips/trip-appt-create/trip-appt-create.component').then(m => m.TripApptCreateComponent)
    
  },
  {
    path:'ptappt', 
    loadComponent: () =>
    import('./healthspring/pt-appointment/pt-appointment.component').then(m => m.PtAppointmentComponent)
    
  },
  {
    path:'ptapptdash', 
    loadComponent: () =>
    import('./healthspring/pt-appt-dash/pt-appt-dash.component').then(m => m.PtApptDashComponent)
     
  },
  {
    path:'tripdash', 
    loadComponent: () =>
    import('./Rides/trips/tripdash/tripdash.component').then(m => m.TripdashComponent)
    
  },
 
  {
    path:'memdash', 
    loadComponent: () =>
    import('./Members/member-dash-board/member-dash-board.component').then(m => m.MemberDashBoardComponent)
    
  },
  {
    path:'members', 
    loadComponent: () =>
    import('./Members/memberlist/memberlist.component').then(m => m.MemberlistComponent)
    
  },
  {
    path:'trips', 
    runGuardsAndResolvers: 'always',
    loadComponent: () =>
    import('./Rides/trips/trips.component').then(m => m.TripsComponent)
    
  },
  {
    path:'./', 
    runGuardsAndResolvers: 'always',
    loadComponent: () =>
    import('./Rides/trips/trips.component').then(m => m.TripsComponent)
    
  },
  {
    path:'trips/:date', 
    runGuardsAndResolvers: 'always',
    loadComponent: () =>
    import('./Rides/trips/trips.component').then(m => m.TripsComponent)
    
  },
 
  
  { path: '**', redirectTo: './', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
