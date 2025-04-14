import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JimgcardComponent } from 'projects/@components/src/lib/jimgcard/jimgcard.component';
import { KalaniSessionService } from 'projects/@session/src/lib/kalani.session.service';
import { MatDialog } from '@angular/material/dialog';
import { DbservicesService } from 'projects/@dbservices/src/public-api';
import { ci_sessions } from 'projects/@models/src/lib/models';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-login-sessions',
  standalone: true,
  imports: [
    CommonModule,
    JimgcardComponent,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './login-sessions.component.html',
  styleUrls: ['./login-sessions.component.css'],
})
export class LoginSessionsComponent {
  constructor(
    public db: DbservicesService,
    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,
    public kalanisession: KalaniSessionService
  ) {}

  loggedIn: any;
  loginAttempt: any;
  currsession?: string;

  ngOnInit(): void {
    this.getci_sessions();
  }

  getci_sessions(deleteSession: string = '') {
    this.db.getci_sessions({ deleteSession: deleteSession }).subscribe({
      next: (json: any) => {
        this.currsession = json.currsession;
        this.loggedIn = json.data.filter(
          (element: ci_sessions) => element?.username! > ''
        );
        this.loginAttempt = json.data.filter(
          (element: ci_sessions) => element?.username! == ''
        );
      },
      error: (err) => {
        this.kalanisession.showErrorMsg(err);
      },
    });
  }
}
