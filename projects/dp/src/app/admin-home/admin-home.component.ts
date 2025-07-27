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
  imports: [CommonModule, LoginComponent, AppRoutingModule, MainNavComponent, MatIconModule, MatButtonModule],
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent {
  constructor(
    public session: SessionService,
    public jmcboot: JmcbootService,
    private dbservices: DbservicesService
  ) {}

  errormsg = 'Please enter your last name and last 4 digits of your phone number';
  MenuItems = MenuItems;
  currentUser = this.session.currentUser;

  onSubmit(Login: any) {
    const payload = {
      lastName: Login.username,
      phoneLast4: Login.password
    };

    this.dbservices.memberLogin(payload).subscribe({
      next: (json: any) => {
        if (json.Authenticated && json.member) {
          // If admin, proceed as usual
          if (json.member.isAdmin) {
            this.session.bootdata = json.member;
            this.session.Authenticated = true;
            this.jmcboot.config!.bootdata = json.member;
            this.currentUser = json.member;
          } else {
            // If not admin, open QuickView and do not set session
            this.goToQuickView(json.member.id || json.member.member_id);
          }
        } else {
          this.errormsg = 'Invalid last name or phone digits.';
        }
      },
      error: (e) => {
        this.errormsg = e;
      },
    });
  }

  goToQuickView(memberId: number) {
    // Update the URL to your actual Kalani app domain/path
    window.open(`http://jimg.app/member-qv/${memberId}`, '_blank');
  }
}