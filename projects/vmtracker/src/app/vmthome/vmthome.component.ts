import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from 'projects/@session/src/public-api';
import { LoginComponent } from 'projects/@components/src/lib/login/login.component';
import { DbservicesService } from 'projects/@dbservices/src/public-api';
import { JmcbootService } from 'projects/@jmcboot/src/public-api';
import { AppRoutingModule } from '../app-routing.module';

@Component({
  selector: 'app-vmthome',
  standalone: true,
  imports: [CommonModule, LoginComponent, AppRoutingModule],
  templateUrl: './vmthome.component.html',
  styleUrls: ['./vmthome.component.scss'],
})
export class VmthomeComponent {
  constructor(
    public session: SessionService,
    public jmcboot: JmcbootService,

    private dbservices: DbservicesService
  ) {}
  errormsg = 'Please enter your login Information';

  onSubmit(Login: any) {
    this.dbservices.loginKalani(Login).subscribe({
      next: (json: any) => {
        if (json.Authenticated) {
          this.session.bootdata = json.bootdata;
          this.session.Authenticated = true;
          this.jmcboot.config!.bootdata = json.bootdata;
          const user = json.bootdata.user;
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
