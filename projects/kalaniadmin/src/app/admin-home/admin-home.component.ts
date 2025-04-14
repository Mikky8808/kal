import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from 'projects/@session/src/public-api';
import { LoginComponent } from 'projects/@components/src/lib/login/login.component';
import { DbservicesService } from 'projects/@dbservices/src/public-api';
import { JmcbootService } from 'projects/@jmcboot/src/public-api';
import { AppRoutingModule } from '../app-routing.module';
import { MenuItems } from './menu.items';
import { MainNavComponent } from 'projects/@components/src/lib/main-nav/main-nav.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, LoginComponent, AppRoutingModule,MainNavComponent,MatIconModule,MatButtonModule],
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent {
  constructor(
    public session: SessionService,
    public jmcboot: JmcbootService,

    private dbservices: DbservicesService
  ) {}
  errormsg = 'Please enter your login Information';
  MenuItems = MenuItems;
  currentUser = this.session.currentUser;

  onSubmit(Login: any) {
    this.dbservices.loginKalani(Login).subscribe({
      next: (json: any) => {
        if (json.Authenticated) {
          this.session.bootdata = json.bootdata;
          this.session.Authenticated = true;
          this.jmcboot.config!.bootdata = json.bootdata;
          const user = json.bootdata.user;
          console.log(json);
        } else {
          this.errormsg = 'Invalid username and password combination.';
        }
      },
      error: (e) => {
        this.errormsg = e;
      },
    });
  }
}