import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [

  {   path:'users', 
  loadComponent: () =>
  import('./users/users.component').then(m => m.UsersComponent)
  },
{   path:'./', 
loadComponent: () =>
import('./login-sessions/login-sessions.component').then(m => m.LoginSessionsComponent)
},
{ path: '**', redirectTo: './', pathMatch: 'full' },


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
