import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [  {
  path:'members', 
  loadComponent: () =>
  import('./Members/memberlist/memberlist.component').then(m => m.MemberlistComponent)
  
},];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
