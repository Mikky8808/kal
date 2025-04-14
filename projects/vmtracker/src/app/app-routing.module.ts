import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SelectVehicleComponent } from './select-vehicle/select-vehicle.component';
import { CloseBrowserComponent } from './close-browser/close-browser.component';

const routes: Routes = [
  {path:'selectVeh/:vid', component:SelectVehicleComponent},

  {path:'selectVeh', component:SelectVehicleComponent},
  {path: 'close', component:CloseBrowserComponent},

  { path: '**', redirectTo: 'selectVeh', pathMatch: 'full' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
