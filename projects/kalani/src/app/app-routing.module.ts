import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListmembersComponent } from './Members/listmembers/listmembers.component';

const routes: Routes = [
  {
    path: 'members', component:ListmembersComponent
  },
 
  
  { path: '**', redirectTo: 'members', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
