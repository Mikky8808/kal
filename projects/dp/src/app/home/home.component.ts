import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from 'projects/@session/src/lib/session.service';
import { DbservicesService } from 'projects/@dbservices/src/lib/dbservices.service';
import { HttpClient } from '@angular/common/http';
import { BarcodereaderService } from 'projects/@session/src/lib/barcodereader.service';
import { JmcbootService } from 'projects/@jmcboot/src/public-api';
import { JimgcardComponent } from 'projects/@components/src/lib/jimgcard/jimgcard.component';
import { MainNavComponent } from 'projects/@components/src/lib/main-nav/main-nav.component';
import { LoginComponent } from 'projects/@components/src/lib/login/login.component';
import { AppRoutingModule } from '../app-routing.module';
import { Router } from '@angular/router';

export interface MenuItem {
  name: string;
  href?: boolean;
  link?: string;
  icon?: string;
  top?: boolean;

  children?: MenuItem[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    JimgcardComponent,
    MainNavComponent,
    LoginComponent,
    AppRoutingModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  constructor(
    public jmcboot: JmcbootService,
    public session: SessionService,
    private dbservices: DbservicesService,
    public _router: Router,
    private barCodeReader: BarcodereaderService
  ) {}
  title = 'kalani';
  errormsg = 'Please enter your login Information';
  MenuItems: MenuItem[] = [
    // {
    //   name: 'Members',
    //   href: false,
    //   link: 'members',
    //   icon: 'group',
    //   top: true,
    // },
    {
      name: 'Kalani',
      children: [
        {
          name: 'Members',
          href: false,
          link: 'members',
          icon: 'group',
          top: true,
        },
        {
          name: 'Members Checkin Dash',
          href: false,
          link: 'memCheckinHS/K',
          icon: 'check',
          top: true,
        },
        
        {
          name: 'Acupuncture/Massage Appt',
          href: false,
          link: 'accumassage',
          icon: 'spa',
          top: true,
        },
        {
          name: 'Lunch Reservations',
          href: false,
          link: 'lunch',
          icon: 'restaurant',
          top: true,
        },
      ],
    },
    {
      name: 'Rides',
      children: [
        {
          name: 'Trips',
          href: false,
          link: 'trips',
          icon: 'directions_bus_filled',
          top: true,
        },
        {
          name: 'Schedule Ride',
          href: false,
          link: 'scheduleRide',
          icon: 'edit_calendar',
          top: true,
        },
        {
          name: 'Dasboard',
          href: false,
          link: 'tripdash',
          icon: 'dashboard',
          top: true,
        },
      ],
    },
    {
      name: 'Health Spring',
      children: [
        {
          name: 'Members Checkin Dash',
          href: false,
          link: 'memCheckin/H',
          icon: 'check',
          top: true,
        },
        {
          name: 'Schedule Appt',
          href: false,
          link: 'ptappt',
          icon: 'edit_calendar',
          top: true,
        },
        {
          name: 'Appt Dasboard',
          href: false,
          link: 'ptapptdash',
          icon: 'dashboard',
          top: true,
        },

      ],
    },
  ];

  menuBar = [
    {
      name: 'My Trips',
      href: false,
      link: 'trips',
      icon: 'directions_bus_filled',
      top: true,
    },
    {
      name: 'Dasboard',
      href: false,
      link: 'dashboard',
      icon: 'dashboard',
      top: true,
    },
    {
      name: 'Members',
      href: false,
      link: 'members',
      icon: 'group',
      top: true,
    },
    {
      name: 'Assign',
      href: false,
      link: 'assign',
      icon: 'dashboard',
      top: true,
    },
  ];

  onSubmit(Login: any) {
    this.dbservices.loginKalani(Login).subscribe({
      next: (json: any) => {
        if (json.Authenticated) {
          this.session.bootdata = json.bootdata;
          this.session.Authenticated = true;
          this.jmcboot.config!.bootdata = json.bootdata;
          const user = json.bootdata.user;

          this.barCodeReader.connectBarCodeReader();
          this._router.navigate([user.startPath])
     
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
